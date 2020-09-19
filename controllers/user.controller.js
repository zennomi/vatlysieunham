const User = require('../models/user.model');
const md5 = require('md5');

module.exports.index = (req, res) => {
    res.redirect('/user/'+req.signedCookies.user.username);
}

module.exports.viewByUserName = (req, res) => {
    User.findOne({ username: req.params.username }).exec((err, user) => {
        if (!user) {
            res.render('error', {
                errors: ['Không tìm thấy user có tên này.']
            });
            return;
        }
        res.render('user/view', {
            matchedUser: user
        })
    })
}

module.exports.edit = (req, res) => {
    res.render('user/edit', {
        user: req.signedCookies.user
    })
}

module.exports.postEdit = (req, res) => {
    let errors = [];
    if (req.body.password.length < 6) {
        errors.push('Mật khẩu phải dài hơn 5 ký tự.');
    }
    if (req.body.password !== req.body.rePassword) {
        errors.push('Nhập lại sai mật khẩu.');
    }
    if (errors.length > 0) {
        res.render('error', {
            errors: errors
        });
        return;
    }
    User.findOneAndUpdate({username: req.body.username}, {
        $set: {
            name: req.body.name,
            username: req.body.username,
            password: md5(req.body.password),
            note: req.body.note
        }
    }, {new: true}).exec((err, user) => {
        req.flash('messages', [['success', `Sửa thông tin của user ${req.body.username} thành công.`]]); 
        req.flash('messages', [['info', 'Đăng nhập lại cho chắc.']]); 
        res.redirect('/auth/logout');
    })
}