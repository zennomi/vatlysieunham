module.exports.postCreate = function (req, res, next) {
    var errors = [];
    if (errors.length) {
        res.render('errors', {
            errors: errors
        });
    } else {
        next();
    }
}