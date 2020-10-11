module.exports.getBreadcrumb = function (req, res, next) {
    res.locals.breadcrumb = req.originalUrl.split('/');
    next();
}