const User = require('../models/user.model');
const md5 = require('md5');

module.exports.login = (req, res) => {
    res.render('auth/login');
}

module.exports.logout = (req, res) => {
    res.clearCookie('user');
    req.flash('messages', [['info', 'Đăng xuất thành công.']]);
    res.redirect('/');
}

module.exports.postLogin = async (req, res) => {
    let user = await User.findOne({ username: req.body.username })
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
    user.password = undefined;
    user.note = undefined;
    user.action = undefined;
    res.cookie('user', user, {
        signed: true,
        maxAge: 7 * 24 * 3600 * 1000
    });
    req.flash('messages', [['success', 'Đăng nhập thành công.']]);
    res.redirect(req.flash('history')[0] || '/dashboard');
}