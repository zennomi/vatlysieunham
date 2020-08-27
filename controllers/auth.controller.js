const User = require('../models/user.model');
const md5 = require('md5');

module.exports.login = (req, res) => {
    res.render('auth/login');
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
    res.cookie('username', user.username, {
        signed: true
    });
    res.cookie('user_id', user._id, {
        signed: true
    });
    res.locals.user = user;
    res.render('user/view', {
        matchedUser: user,
        massages: {'success': ['Đăng nhập thành công.']}
    });
}