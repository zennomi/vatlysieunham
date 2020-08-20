var express = require('express');
var router = express.Router();

const validate = require('../validate/lesson.validate');
const Lesson = require('../models/lesson.model');
const Student = require('../models/student.model');

router.get('/', async (req, res) => {
    let dateLesson = await Lesson.aggregate([
        {
            $group: {
                _id: "$date",
                totalStudents: {$sum: 1}
            }
        },
        {
            $sort: { "_id": -1 }
        }
    ]);
    res.render('lessons/index', {
        lessons: dateLesson
    });
});

router.get('/create', (req, res) => {
    let nowTime = new Date();
    res.render('lessons/create', {
        time: {
            date: nowTime.getFullYear() + '-' + (nowTime.getMonth() < 9 ? '0' : '') + (nowTime.getMonth()+1) + '-' + nowTime.getDate(),
            time: nowTime.getHours() + ':' + (nowTime.getMinutes() < 10 ? '0' : '') + nowTime.getMinutes()
        }
    });
});

router.get('/:date', (req, res) => {
    Lesson.find({ date: req.params.date }).populate('student_id').exec((err, lessons) => {
        if (err) res.send(err);
        console.log(lessons);
        res.render('lessons/view', {
            lessons: lessons
        })
    })
})

router.post('/create', validate.postCreate, async (req, res) => {
    let lesson = new Lesson({
        date: req.body.date.toString(),
        student_id: (await Student.findOne({ id: req.body.id }))._id,
        type: req.body.type ? req.body.type : undefined,
        time: {
            start_hour: req.body.start_time ? parseInt(req.body.start_time.slice(0,2)) : undefined,
            start_minute: req.body.start_time ? parseInt(req.body.start_time.slice(3,5)) : undefined,
            end_hour: req.body.end_time ? parseInt(req.body.end_time.slice(0,2)) : undefined,
            end_minute: req.body.end_time ? parseInt(req.body.end_time.slice(3,5)) : undefined
        },
        topic: req.body.topic,
        comment_of_tutor: req.body.comment_of_tutor,
        comment_of_student: req.body.comment_of_student
    })
    await lesson.save();
    res.send(req.body);
})

module.exports = router;