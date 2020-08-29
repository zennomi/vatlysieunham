const Homework = require('../models/homework.model');
const Classroom = require('../models/class.model');
const Student = require('../models/student.model');
module.exports.index = (req, res) => {
    Homework.find().sort({ date: -1 }).populate('class').exec((err, homeworks) => {
        res.render('homeworks/index', {
            homeworks: homeworks
        })
    })
}

module.exports.viewById = (req, res) => {
    Homework.findById(req.params.id).populate('class').populate('student.student_id').exec((err, homework) => {
        res.render('homeworks/view', {
            homework
        })
    })
}

module.exports.create = (req, res) => {
    Classroom.find().exec((err, classes) => {
        res.render('homeworks/create', {
            classes
        })
    })
}

module.exports.editById = (req, res) => {
    Homework.findById(req.params.id).populate('student.student_id').exec((err, homework) => {
        res.render('homeworks/edit', {
            homework
        })
    })
}

module.exports.postCreate = (req, res) => {
    Student.find({classroom: req.body.class}).select({_id: 1}).exec((err, students) => {
        let homework = new Homework({
            name: req.body.name,
            date: new Date(req.body.date),
            note: req.body.note,
            class: req.body.class,
            total: req.body.total || 100,
            student: students.map(student => {return {student_id: student._id}})
        })
        homework.save();
        res.redirect('/homeworks', {
            homework
        });
    })
}