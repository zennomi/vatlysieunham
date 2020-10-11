const User = require("../models/user.model");

module.exports.getAuth = (req, res, next) => {
    if (req.path != '/auth/login') {
        if (req.signedCookies.user == false) {
            req.flash('messages', [['danger', 'Mời đồng chí đăng nhập lại.']]);
            res.redirect('/auth/login');
            return;
        }
        res.locals.user = req.signedCookies.user;
    } else {
        res.locals.user = undefined;
    }
    next();
}

module.exports.authRequire = (req, res, next) => {
    if (!req.signedCookies.user) {
        req.flash('messages', [['danger', 'Đăng nhập cái đã bạn ôi']]);
        req.flash('history', req.path);
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