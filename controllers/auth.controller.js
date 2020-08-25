const User = require('../models/user.model');
const md5 = require('md5');

module.exports.login = (req, res) => {
    res.render('auth/login');
}

module.exports.postLogin = (req, res) => {
    User.findOne({ name: req.body.username }).exec((err, user) => {
        if (err) {
            res.render('error', {
                errors: [err]
            });
            return;
        }
        if (!user) {
            res.render('error', {
                errors: ['Tên tài khoản không chính xác.']
            });
            return;
        }
        if (md5(req.body.password) != user.password) {
            res.render('error', {
                errors: ['Mật khẩu không chính xác.']
            });
            return;
        }
        res.cookie('username', user.name, {
            signed: true
        });
        res.redirect('/');
    })
}