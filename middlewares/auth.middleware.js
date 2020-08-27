const User = require("../models/user.model");

module.exports.authRequire = (req, res, next) => {
    if (!req.signedCookies.username) {
        req.flash('danger', 'Đăng nhập cái đã bạn ôi.');
        res.redirect('/auth/login');
        return;
    }
    
    User.findOne({ username: req.signedCookies.username }).exec((err, user) => {
        if (err) {
            res.render('error', {
                errors: [err]
            });
            return;
        }
        if (!user) {
            req.flash('danger', 'Mời đồng chí đăng nhập lại.');
            res.redirect('/auth/login');
            return;
        }
        res.locals.user = user;
        next();
    })
}

module.exports.adminRequire = (req, res, next) => {
    if (res.locals.user.role!='admin') {
        res.render('error', {
            errors: ['Admin mới thực hiện được thao tác này!']
        });
        return;
    }
    next();
}