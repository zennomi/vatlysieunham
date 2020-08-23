const Student = require('../models/student.model');
const Classroom = require('../models/class.model');
const Lesson = require('../models/lesson.model');

module.exports.index = async (req, res) => {
    let students = await Student.find().populate('classroom');
    let classes = await Classroom.find();
    res.render('students/index', {
        students: students,
        classes: classes
    });
};

module.exports.search = async (req, res) => {
    let name = req.query.name;
    let id = req.query.id;
    let cla = req.query.class;

    let nameRegex = new RegExp(req.query.name, 'i');
    let students = await Student.find({ name: {$regex: nameRegex} }).populate('classroom');
    let classes = await Classroom.find();
    console.log(students);
    let matchedStudents = students.filter((student) => {
        return (!id || student.id == id) && (!cla || student.classroom.name == cla)
    });
    console.log(matchedStudents);
    res.render('students/index', {
        students: matchedStudents,
        name: name,
        id: id,
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
    ]))[0].max+1;
    var student = new Student({
        name: req.body.name,
        classroom: classroom._id,
        dob: new Date(req.body.dob),
        id: id
    });
    await Classroom.findOneAndUpdate({ name: req.body.class }, { $addToSet: { students: student._id }});
    await student.save();
    res.redirect('/students/'+student.id);
};

module.exports.postEdit = async (req, res) => {
    let newClass = await Classroom.findOne({ name: req.body.class });
    let student = await Student.findOneAndUpdate(
        { id: req.body.id },
        { $set: { name: req.body.name, dob: req.body.dob, classroom: newClass._id }}
    );
    if (newClass.students.indexOf(student._id) == -1 ) {
        await Classroom.findOneAndUpdate({ students: student._id }, { $pull: {students: student._id } });
        newClass.addStudent(student._id);
        newClass.save();
    }
    res.redirect('/students/' + req.body.id);
}

module.exports.postDelete = async (req, res) => {
    let student = await Student.findOne({ id: req.body.id });
    let classroom = await Classroom.findOne({ students: { $all: [student._id]} });
    classroom.deleteStudent(student._id);
    await classroom.save();
    await Student.deleteOne({ id: req.body.id });
    await Lesson.deleteOne({ student_id: student._id });
    res.redirect('/students');
}