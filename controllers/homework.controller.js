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

module.exports.deleteById = (req, res) => {
    Homework.findById(req.params.id).populate('class').exec((err, homework) => {
        res.render('homeworks/delete', {
            homework
        })
    })
}

module.exports.postCreate = (req, res) => {
    Student.find({classroom: req.body.class}).select({_id: 1}).exec((err, students) => {
        let homework = new Homework({
            name: req.body.name,
            date: new Date(req.body.date),
            type: req.body.type,
            note: req.body.note,
            class: req.body.class,
            total: req.body.total || 10,
            student: students.map(student => {return {student_id: student._id}})
        });
        homework.save((err, homework) => {
            req.flash('messages', [['success', 'Thêm Bài tập thành công.']]);
            res.redirect('/homeworks/view/'+homework._id);
        });
    })
}

module.exports.postEdit = (req, res) => {
    Homework.findByIdAndUpdate(req.body.id, {
        $set: {
            name: req.body.name,
            date: new Date(req.body.date),
            total: req.body.total || 100,
            type: req.body.type,
            note: req.body.note
        }
    }).exec((err, homework) => {
        req.flash('messages', [['success', 'Cập nhật Bài tập thành công.']]);
        res.redirect('/homeworks/view/'+req.body.id);
    })
}

module.exports.postDelete = (req, res) => {
    req.flash('messages', [['danger', 'Bạn vừa xóa Bài tập.']]);
    Homework.findByIdAndDelete(req.body.id).exec((err, result) => {res.redirect('/homeworks')});
}