const Record = require('../models/record.model');
const Classroom = require('../models/class.model');
const Student = require('../models/student.model');
const User = require('../models/user.model');
module.exports.index = (req, res) => {
    Record.find().sort({ date: -1 }).populate('class').exec((err, records) => {
        res.render('records/index', {
            records: records
        })
    })
}

module.exports.viewById = (req, res) => {
    Record.findById(req.params.id).populate('class').populate('student.student_id').exec((err, record) => {
        res.render('records/view', {
            record
        })
    })
}

module.exports.create = (req, res) => {
    Classroom.find().exec((err, classes) => {
        res.render('records/create', {
            classes
        });
    })
}

module.exports.editById = (req, res) => {
    Record.findById(req.params.id).populate('student.student_id').exec((err, record) => {
        res.render('records/edit', {
            record
        });
    });
}

module.exports.deleteById = (req, res) => {
    Record.findById(req.params.id).populate('class').exec((err, record) => {
        res.render('records/delete', {
            record
        })
    })
}

module.exports.postCreate = (req, res) => {
    if (req.body.link) {
        let linkArr = req.body.link.split('/');
        linkArr[linkArr.length - 1] = 'preview';
        req.body.link = linkArr.join('/');
    }
    if (req.body.type == "TESTON" || req.body.type == "TESTOFF") {
        Student.find({ test_class: req.body.class, is_active: true }).select({ _id: 1 }).exec(async (err, students) => {
            let record = new Record({
                name: req.body.name,
                date: new Date(req.body.date),
                type: req.body.type,
                note: req.body.note || undefined,
                class: req.body.class,
                total: req.body.total || 10,
                link: req.body.link || undefined,
                student: students.map(student => { return { student_id: student._id } })
            });
            await record.save((err, record) => {
                req.flash('messages', [['success', 'Thêm Bài tập thành công.']]);
                res.redirect('/records/' + record._id);
            });
        });
    } else {
        Student.find({ classroom: req.body.class, is_active: true }).select({ _id: 1 }).exec(async (err, students) => {
            let record = new Record({
                name: req.body.name,
                date: new Date(req.body.date),
                type: req.body.type,
                note: req.body.note || undefined,
                class: req.body.class,
                total: req.body.total || 10,
                link: req.body.link || undefined,
                student: students.map(student => { return { student_id: student._id } })
            });
            await record.save((err, record) => {
                req.flash('messages', [['success', 'Thêm Bài tập thành công.']]);
                res.redirect('/records/' + record._id);
            });
        });
    }

}

module.exports.postEdit = (req, res) => {
    if (req.body.link) {
        let linkArr = req.body.link.split('/');
        linkArr[linkArr.length - 1] = 'preview';
        req.body.link = linkArr.join('/');
    }
    Record.findByIdAndUpdate(req.body.id, {
        $set: {
            name: req.body.name,
            date: new Date(req.body.date),
            total: req.body.total || 100,
            type: req.body.type,
            period_id: req.body.period_id || undefined,
            link: req.body.link || undefined,
            note: req.body.note || undefined
        }
    }).exec((err, record) => {
        req.flash('messages', [['success', 'Cập nhật Bài tập thành công.']]);
        res.redirect('/records/' + req.body.id);
    })
}

module.exports.postDelete = (req, res) => {
    req.flash('messages', [['danger', 'Bạn vừa xóa Bài tập.']]);
    Record.findByIdAndDelete(req.body.id).exec((err, record) => {
        User.findById(res.locals.user._id).exec((err, user) => {
            user.action.push({
                method: 'delete',
                content: record.toString(),
                time: Date.now()
            });
            user.save();
        })
        res.redirect('/records');
    });
}