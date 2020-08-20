const Student = require('../models/student.model');

module.exports.postCreate = async (req, res, next) => {
    let errors =[];
    let matchedStudent = await Student.findOne({ id: req.body.id });
    if (!matchedStudent) {
        errors.push('Không thấy học sinh có ID ' + req.body.id);
    }
    if (errors.length) {
        let nowTime = new Date();
        res.render('lessons/create', {
            time: {
                date: nowTime.getFullYear() + '-' + (nowTime.getMonth() < 9 ? '0' : '') + (nowTime.getMonth()+1) + '-' + nowTime.getDate(),
                time: nowTime.getHours() + ':' + (nowTime.getMinutes() < 10 ? '0' : '') + nowTime.getMinutes()
            },
            errors: errors
        })
        return;
    }
    next();
}