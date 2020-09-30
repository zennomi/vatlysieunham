const Period = require('../models/period.model');
const Classroom = require('../models/class.model');
const User = require('../models/user.model');

module.exports.index = (req, res) => {
    Period.find({}).populate('class').exec((err, periods) => {
        res.render('periods/index', {periods})
    })
}

module.exports.viewById = (req, res) => {
    Period.findById(req.params.id).populate('class').populate('instructor').exec((err, period) => {
        res.render('periods/view', {period}); 
    });
}

module.exports.create = async (req, res) => {
    Classroom.find({}).exec((err, classes) => {
        User.find({}).exec((err, users) => {
            res.render('periods/create', {classes, users})
        })
    });
}

module.exports.deleteById = (req, res) => {
    Period.findById(req.params.id).exec((err, period) => {
        res.render('periods/delete', {period});
    })
}

module.exports.postCreate = (req, res) => {
    let period = new Period({
        name: req.body.name,
        date: new Date(req.body.date),
        type: req.body.type,
        instructor: req.body.instructor,
        class: [...req.body.class],
        note: req.body.note || undefined
    });
    if (req.body.link) {
        let linkArr = req.body.link.split('/');
        linkArr[linkArr.length-1] = 'preview';
        period.link = linkArr.join('/');
    }
    period.save(() => {
        res.redirect('/periods/view/'+period._id);
    })
}

module.exports.postDelete = (req, res) => {
    Period.findByIdAndDelete(req.body.id).exec((err, period) => {
        req.flash('messages', [['danger', `Bạn vừa xóa một buổi ${period.type}.`]]);
        User.findById(res.locals.user._id).exec((err, user) => {
            user.action.push({
                method: 'delete',
                content: period.toString(),
                time: Date.now()
            });
            user.save();
        })
        res.redirect('/periods');
    });
}