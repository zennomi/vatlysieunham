const Classroom = require("../models/class.model");

module.exports.postCreate = function (req, res, next) {
    var errors = [];
    if (!req.body.name) {
        errors.push('Name is required.');
    }
    if (!req.body.dob) {
        errors.push('Date of birth is required.');
    }
    if ( !req.body.class) {
        errors.push('Class is required.');
    }
    if (errors.length) {
        Classroom.find().exec(function(err, classes) {
            res.render('students/create', {
                errors: errors,
                studentInfo: req.body,
                classes: classes
            });
        })
        
    } else {
        next();
    }
}