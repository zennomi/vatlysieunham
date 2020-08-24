const Student = require('../models/student.model');
const Classroom = require('../models/class.model');
const Lesson = require('../models/lesson.model');
const { render } = require('pug');

module.exports.index = async (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let maxPage = Math.floor((await Student.countDocuments())/40)+1;
    if (page > maxPage) {
        res.render('error', {
            errors: ['Đi đâu đấy bạn ôi!']
        });
    } else {
        let students = await Student.find().populate('classroom').skip(40*(page-1)).limit(40);
        let classes = await Classroom.find();
        res.render('students/index', {
            students: students,
            classes: classes,
            page: page,
            maxPage: maxPage
        });
    }
};

module.exports.search = async (req, res) => {
    let name = req.query.name;
    let id = req.query.id;
    let cla = req.query.class;

    let nameRegex = new RegExp(req.query.name, 'i');
    let students = await Student.find({ name: {$regex: nameRegex} }).populate('classroom');
    let classes = await Classroom.find();
    let matchedStudents = students.filter((student) => {
        return (!id || student.id == id) && (!cla || student.classroom.name == cla)
    });
    console.log(matchedStudents);
    res.render('students/index', {
        students: matchedStudents,
        name: name,
        id: id,
        cla: cla,
        classes: classes
    });
};

module.exports.create = async (req, res) => {
    res.render('students/create', {
        classes: await Classroom.find()
    })
};

module.exports.getById = async (req, res) => {
    let student = await Student.findOne({ id: req.params.id }).populate('classroom');
    if (!student) {
        res.render('error', {
            errors: ['Không tìm thấy HS này.']
        });
        return;
    }
    let lessonArr = await Lesson.find({ student_id: student._id });
    let data = {
        total: 0,
        totalTimes: 0,
        totalGoods: 0,
        totalBads: 0,
        totalLW: 0,
        totalTimesLW: 0,
        totalGoodsLW: 0,
        totalBadsLW: 0,
        
    };
    lessonArr.forEach( lesson => {
        if (lesson.rating) {
            data.total++;
        }
        if (lesson.time.end_hour) {
            data.totalTimes+= lesson.time.end_hour*60+lesson.time.end_minute-(lesson.time.start_hour*60+lesson.time.start_minute);
        }
        if (lesson.rating=='Tốt') {
            data.totalGoods++;
        } else if (lesson.rating=='Yếu') {
            data.totalBads++;
        }
    });
    let lwDate = new Date();
    lwDate = lwDate.valueOf()-6048e5;
	lwDate = new Date(lwDate)
    lwDate = lwDate.toISOString().slice(0,10);

    lessonArr.filter(lesson => lesson.date>lwDate ).forEach( lesson => {
        if (lesson.rating) {
            data.totalLW++;
        }
        if (lesson.time.end_hour) {
            data.totalTimesLW+= lesson.time.end_hour*60+lesson.time.end_minute-(lesson.time.start_hour*60+lesson.time.start_minute);
        }
        if (lesson.rating=='Tốt') {
            data.totalGoodsLW++;
        } else if (lesson.rating=='Yếu') {
            data.totalBadsLW++;
        }
    });
    res.render('students/view', {
        student: student,
        lessons: lessonArr,
        data: data
    })
};

module.exports.editById = async (req, res) => {
    let student = await Student.findOne({ id: req.params.id }).populate('classroom');
    res.render('students/edit', {
        student: student,
        classes: await Classroom.find()
    })
}

module.exports.deleteById = (req, res) => {
    Student.findOne({ id: req.params.id }).populate('classroom').exec((err, deleteStudent) => {
        if (err) res.send(err);
        else {
            res.render('students/delete', {
                student: deleteStudent
            });
        }
    })
}

module.exports.postCreate = async (req, res) => {
    let classroom = await Classroom.findOne({ name: req.body.class });

    let id = (await Student.aggregate([
        {
            $group: {
                _id: null,
                max: {$max: "$id"}
            }
        }
    ]));
    id = id.length>0 ? id[0].max+1 : 1;
    let student = new Student({
        name: req.body.name,
        classroom: classroom._id,
        id: id,
        note: req.body.note
    });
    if (req.body.dob) student.dob = new Date(req.body.dob);
    await Classroom.findOneAndUpdate({ name: req.body.class }, { $addToSet: { students: student._id }});
    await student.save();
    res.redirect('/students/'+student.id);
};

module.exports.postEdit = async (req, res) => {
    let newClass = await Classroom.findOne({ name: req.body.class });
    let student = await Student.findOneAndUpdate(
        { id: req.body.id },
        { $set: { name: req.body.name, dob: req.body.dob, classroom: newClass._id, note: req.body.note }}
    );
    res.redirect('/students/' + req.body.id);
}

module.exports.postDelete = async (req, res) => {
    let student = await Student.findOne({ id: req.body.id });
    await Student.deleteOne({ id: req.body.id });
    await Lesson.deleteOne({ student_id: student._id });
    res.redirect('/students');
}