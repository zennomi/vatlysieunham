const Student = require('../models/student.model');

module.exports.postCreate = async (req, res, next) => {
    let errors =[];
    let matchedStudent = await Student.findOne({ id: req.body.student_id });
    if (!matchedStudent) {
        errors.push('Tôi làm trợ giảng 2 năm nay rồi mà chưa thấy học sinh nào có cái ID ' + req.body.student_id + ' này.');
    }
    if (req.body.end_time) {
        let startTimes = parseInt(req.body.start_time.slice(0, 2))*60+parseInt(req.body.start_time.slice(3, 5));
        let endTimes = parseInt(req.body.end_time.slice(0, 2))*60+parseInt(req.body.end_time.slice(3, 5));
        if (startTimes >= endTimes) {
            errors.push('Học xong trước khi bắt đầu học.')
        }
    }
    if (req.body.comment_of_tutor) {
        if (!req.body.rating) {
            errors.push('Nhận xét thì đánh giá luôn đi.');
        }
    }
    if (errors.length) {
        let nowTime = new Date();
        /* res.render('lessons/create', {
            time: {
                date: nowTime.getFullYear() + '-' + (nowTime.getMonth() < 9 ? '0' : '') + (nowTime.getMonth()+1) + '-' + nowTime.getDate(),
                time: nowTime.getHours() + ':' + (nowTime.getMinutes() < 10 ? '0' : '') + nowTime.getMinutes()
            },
            errors: errors
        }) */
        res.render('error', {errors: errors})
        return;
    }
    next();
}