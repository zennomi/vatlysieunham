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
            matchedUser: user,
            currentUserName: req.signedCookies.user.username
        })
    })
}