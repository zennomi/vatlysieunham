const User = require("../models/user.model");

module.exports.authRequire = (req, res, next) => {
    if (!req.signedCookies.username) {
        res.redirect('/auth/login');
        return;
    }
    User.findOne({ name: req.signedCookies.username }).exec((err, user) => {
        if (err) {
            res.render('error', {
                errors: [err]
            });
            return;
        }
        if (!user) {
            res.redirect('/auth/login');
            return;
        }
        res.locals.user = user;
        next();
    })
}