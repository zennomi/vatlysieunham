const Student = require('../models/student.model');
const Classroom = require('../models/class.model');
const Lesson = require('../models/lesson.model');
const Record = require('../models/record.model');

module.exports.index = async (req, res) => {
    // let page = parseInt(req.query.page) || 1;
    // let maxPage = Math.floor((await Student.countDocuments()) / 40) + 1;
    // if (page > maxPage) {
    //     res.render('error', {
    //         errors: ['Đi đâu đấy bạn ôi!']
    //     });
    // } else {
    // }
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
    let tag = req.query.tag;
    let nameRegex = new RegExp(req.query.name, 'i');
    let students = await Student.find({ name: { $regex: nameRegex } }).populate('classroom');
    let classes = await Classroom.find();
    let matchedStudents = students.filter((student) => {
        return (!id || student.id == id) && (!cla || student.classroom.name == cla) && (!tag || student.tags.indexOf(tag) > -1)
    });
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
        classes: await Classroom.find({ type: "LEARN" })
    })
};

module.exports.getById = async (req, res) => {
    let student = await Student.findOne({ id: req.params.id }).populate('classroom').populate('test_class');
    if (!student) {
        res.render('error', {
            errors: ['Không tìm thấy HS này.']
        });
        return;
    }

    let records = await Record.aggregate([
        {
            $unwind: "$student"
        },
        {
            $match: {
                'student.student_id': student._id
            }
        },
        {
            $project: {
                mark: { $ifNull: ['$student.finish_count', undefined] },
                mark: { $multiply: [{ $divide: ['$student.finish_count', '$total'] }, 10] },
                name: '$name',
                note: '$student.note',
                type: '$type',
                date: '$date',
                record_type: 'records'
            }
        }
    ]);
    records.sort((a, b) => b.date - a.date);
    let data = {
        total: 0,
        totalTimes: 0,
        totalRating: 0,
        totalExercises: 0,
        totalProblems: 0,
        totalLW: 0,
        totalTimesLW: 0,
        totalRatingLW: 0,
        totalExercisesLW: 0,
        totalProblemsLW: 0
    };

    let lessonArr = await Lesson.find({ student_id: student._id }).sort({ date: -1 });
    lessonArr.forEach(lesson => {
        if (lesson.rating) {
            data.total++;
            data.totalRating += lesson.rating
        }
        if (lesson.time.end_hour) {
            data.totalTimes += lesson.time.end_hour * 60 + lesson.time.end_minute - (lesson.time.start_hour * 60 + lesson.time.start_minute);
        }
        if (lesson.total_problems) {
            data.totalExercises++;
            data.totalProblems += lesson.total_problems;
        }
    });
    let lwDate = new Date();
    lwDate = lwDate.valueOf() - 6048e5;
    lwDate = new Date(lwDate)
    lwDate = lwDate.toISOString().slice(0, 10);

    lessonArr.filter(lesson => lesson.date > lwDate).forEach(lesson => {
        if (lesson.rating) {
            data.totalLW++;
            data.totalRatingLW += lesson.rating;
        }
        if (lesson.time.end_hour) {
            data.totalTimesLW += lesson.time.end_hour * 60 + lesson.time.end_minute - (lesson.time.start_hour * 60 + lesson.time.start_minute);
        }
        if (lesson.total_problems) {
            data.totalExercisesLW++;
            data.totalProblemsLW += lesson.total_problems;
        }
    });
    res.render('students/view', {
        student: student,
        lessons: lessonArr,
        data: data,
        records: records
    })
};

module.exports.editById = async (req, res) => {
    let student = await Student.findOne({ id: req.params.id }).populate('classroom').populate('test_class').populate('updated_by');
    let classes = await Classroom.find();
    res.render('students/edit', {
        student: student,
        classes: classes.filter(cla => cla.type=="LEARN"),
        testClasses: classes.filter(cla => cla.type=="TEST")
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
    let id = (await Student.aggregate([
        {
            $group: {
                _id: null,
                max: { $max: "$id" }
            }
        }
    ]));
    id = id.length > 0 ? id[0].max + 1 : 1;
    let student = new Student({
        name: req.body.name,
        classroom: req.body.class,
        id: id,
        is_active: true,
        created_at: Date.now(),
        updated_by: res.locals.user._id
    });
    if (req.body.dob) student.dob = new Date(req.body.dob);
    if (req.body.tags) {
        student.tags = req.body.tags.split(',').map(tag => tag.trim().toUpperCase());
    };
    if (req.body.note) student.note = req.body.note;
    await student.save();
    // ADD ID STUDENT INTO RECORD
    // await Record.find({ class: req.body.class }).exec((err, records) => {
    //     records.forEach((record) => {
    //         record.student.every(student => student.student_id != student._id);
    //         record.student.push({ student_id: student._id });
    //         record.save();
    //     })
    // })
    req.flash('messages', [['success', `Đã thêm học sinh mới tên ${req.body.name} - ID ${id}.`]]);
    res.redirect('/students/' + student.id);
};

module.exports.postEdit = async (req, res) => {
    let student = await Student.findOne({ id: req.body.id });
    // REMOVE STUDENT FROM RECORD
    // if (!student.is_active) {
    //     Record.updateMany({}, {
    //         $pull: {
    //             student: {
    //                 student_id: student._id,
    //                 mark: null,
    //                 note: null
    //             }
    //         }
    //     })
    // }
    if (student.classroom != req.body.class) {
        // ADD STUDENT ID TO NEW RECORD
        // await Record.find({ class: req.body.class }).exec((err, records) => {
        //     if (!records) return;
        //     records.forEach((record) => {
        //         if (record.student.every(studentInArray => studentInArray.student_id.toString() != student._id.toString())) {
        //             record.student.push({ student_id: student._id });
        //             record.save();
        //         }
        //     })
        // });
        await Record.updateMany({
            class: student.classroom
        }, {
            $pull: {
                student: {
                    student_id: student._id,
                    mark: null,
                    note: null
                }
            }
        });
        student.classroom = req.body.class;
    }
    if (student.test_class != req.body.test_class) {
        // ADD STUDENT ID TO NEW RECORD

        // await Record.find({ class: req.body.test_class }).exec((err, records) => {
        //     if (!records) return;
        //     records.forEach((record) => {
        //         if (record.student.every(studentInArray => studentInArray.student_id.toString() != student._id.toString())) {
        //             record.student.push({ student_id: student._id });
        //             record.save();
        //         }
        //     })
        // });
        await Record.updateMany({
            class: student.test_class
        }, {
            $pull: {
                student: {
                    student_id: student._id,
                    mark: null,
                    note: null
                }
            }
        });
        student.test_class = req.body.test_class || undefined;
    }

    // UPDATE INFO STUDENT
    student.name = req.body.name;
    if (req.body.dob) student.dob = new Date(req.body.dob);
    else student.dob = undefined;
    if (req.body.tags) student.tags = req.body.tags.split(',').map(tag => tag.trim().toUpperCase());
    else student.tags = undefined;
    if (req.body.note) student.note = req.body.note;
    else student.note = undefined;
    student.is_active = req.body.is_active ? true : false;
    student.updated_by = res.locals.user._id;
    student.updated_at = Date.now();
    await student.save();
    req.flash('messages', [['success', `Đã sửa học sinh tên ${req.body.name} - ID ${req.body.id}`]]);
    res.redirect('/students/' + req.body.id);
}

module.exports.postDelete = async (req, res) => {
    let student = await Student.findOne({ id: req.body.id });
    await Lesson.deleteMany({ student_id: student._id });
    await Record.updateMany({}, {
        $pull: { student: { student_id: student._id } }
    });
    await Student.deleteOne({ id: req.body.id });
    req.flash('messages', [['danger', `Mọi thông tin (BTVN, buổi trợ giảng,...) của học sinh ${student.name} - ID ${student.id} đã bị xóa.`]]);
    res.redirect('/students');
}