const User = require("../models/user.model");

module.exports.getAuth = (req, res, next) => {
    if (req.path != '/auth/login') {
        if (req.signedCookies.user == false) {
            req.flash('danger', 'Mời đồng chí đăng nhập lại.');
            res.redirect('/auth/login');
            return;
        }
        res.locals.user = req.signedCookies.user;
    }
    next();
}

module.exports.authRequire = async (req, res, next) => {
    if (!req.signedCookies.user) {
        req.flash('danger', 'Đăng nhập cái đã bạn ôi.');
        res.redirect('/auth/login');
        return;
    }
    next();
}

module.exports.adminRequire = (req, res, next) => {
    if (res.locals.user.role != 'admin') {
        res.render('error', {
            errors: ['Admin mới thực hiện được thao tác này!']
        });
        return;
    }
    next();
}