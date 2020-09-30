const Test = require("../models/test.model");

module.exports.index = (req, res) => {
    Test.find({}).exec((err, tests) => {
        res.render('tests/index', {tests});
    })
}

module.exports.viewById = (req, res) => {
    Test.findById(req.params.id).populate('student.student_id').exec((err, test) => {
        res.render('tests/view', {test: test});
    });
}

module.exports.create = (req, res) => {
    res.render('tests/create');
}

module.exports.editById = (req, res) => {
    Test.findById(req.params.id).populate('student.student_id').exec((err, test) => {
        res.render('tests/edit', {test})
    })
}

module.exports.deleteById = (req, res) => {
    Test.findById(req.params.id).exec((err, test) => {
        res.render('tests/delete', {test});
    })
}

module.exports.postCreate = (req, res) => {
    let test = new Test({
        name: req.body.name,
        date: new Date(req.body.date),
        total: req.body.total || 10
    });
    if (req.body.note == '') {
        test.note = undefined;
    } else {
        test.note = req.body.note
    }
    let linkArr = req.body.link.split('/');
    linkArr[linkArr.length-1] = 'preview';
    test.link = linkArr.join('/');
    test.save((err, test) => {
        req.flash('messages', [['success', 'Thêm Đề kiểm tra thành công.']]);
        res.redirect('/tests/view/'+test._id);
    });
}

module.exports.postEdit = (req, res) => {
    Test.findById(req.body.id).exec((err, test) => {
        test.name = req.body.name;
        test.date = new Date(req.body.date);
        test.total = req.body.total;
        test.note = (req.body.note == '') ? undefined : req.body.note;
        test.link = (req.body.link == '') ? undefined : req.body.link;
        test.save(() => {
            res.redirect('/tests/view/'+test._id);
        });
    });
}

module.exports.postDelete = (req, res) => {
    req.flash('messages', [['danger', 'Bạn vừa xóa buổi luyện đề.']]);
    Test.findByIdAndDelete(req.body.id).exec((err, result) => {res.redirect('/tests')});
}