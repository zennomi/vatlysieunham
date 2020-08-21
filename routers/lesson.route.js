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
                totalStudents: { $sum: 1 }
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
    //  nowTime += 25200000;
    res.render('lessons/create', {
        time: {
            date: nowTime.getFullYear() + '-' + (nowTime.getMonth() < 9 ? '0' : '') + (nowTime.getMonth() + 1) + '-' + nowTime.getDate(),
            time: nowTime.getHours() + ':' + (nowTime.getMinutes() < 10 ? '0' : '') + nowTime.getMinutes()
        }
    });
});

router.get('/:date', (req, res) => {
    Lesson.find({ date: req.params.date }).populate('student_id').exec((err, lessons) => {
        if (err) res.send(err);
        res.render('lessons/view', {
            lessons: lessons
        })
    })
})

router.get('/view/:id', (req, res) => {
    Lesson.findById(req.params.id).populate({ path: 'student_id', populate: { path: 'classroom'}}).exec((err, lesson) => {
        if (err) res.render(err);
        console.log(lesson);
        res.render('lessons/view-id', {
            lesson: lesson
        })
    })
})

router.get('/edit/:id', (req, res) => {
    Lesson.findById(req.params.id).populate('student_id').exec((err, lesson) => {
        if (err) res.send(err);
        let nowTime = new Date();
        res.render('lessons/edit', {
            lesson: lesson,
            time: {
                date: nowTime.getFullYear() + '-' + (nowTime.getMonth() < 9 ? '0' : '') + (nowTime.getMonth() + 1) + '-' + nowTime.getDate(),
                time: nowTime.getHours() + ':' + (nowTime.getMinutes() < 10 ? '0' : '') + nowTime.getMinutes()
            }
        });
    })
})

router.get('/delete/:id', (req, res) => {
    Lesson.findById(req.params.id).populate('student_id').exec((err, lesson) => {
        if (err) res.send(err);
        else {
            res.render('lessons/delete', {
                lesson: lesson
            })
        }
    })
})

router.post('/create', validate.postCreate, async (req, res) => {
    let lesson = new Lesson({
        date: req.body.date.toString(),
        student_id: (await Student.findOne({ id: req.body.student_id }))._id,
        type: req.body.type ? req.body.type : undefined,
        time: {
            start_hour: req.body.start_time ? parseInt(req.body.start_time.slice(0, 2)) : undefined,
            start_minute: req.body.start_time ? parseInt(req.body.start_time.slice(3, 5)) : undefined,
            end_hour: req.body.end_time ? parseInt(req.body.end_time.slice(0, 2)) : undefined,
            end_minute: req.body.end_time ? parseInt(req.body.end_time.slice(3, 5)) : undefined
        },
        topic: req.body.topic,
        comment_of_tutor: req.body.comment_of_tutor,
        comment_of_student: req.body.comment_of_student
    })
    await lesson.save();
    res.redirect('/lessons/view/'+lesson._id);
})

router.post('/edit', validate.postCreate, (req, res) => {
    Lesson.findByIdAndUpdate(req.body.id, {
        $set: {
            date: req.body.date.toString(),
            type: req.body.type ? req.body.type : undefined,
            time: {
                start_hour: req.body.start_time ? parseInt(req.body.start_time.slice(0, 2)) : undefined,
                start_minute: req.body.start_time ? parseInt(req.body.start_time.slice(3, 5)) : undefined,
                end_hour: req.body.end_time ? parseInt(req.body.end_time.slice(0, 2)) : undefined,
                end_minute: req.body.end_time ? parseInt(req.body.end_time.slice(3, 5)) : undefined
            },
            topic: req.body.topic,
            comment_of_tutor: req.body.comment_of_tutor,
            comment_of_student: req.body.comment_of_student
        }
    }).exec((err, lesson) => {
        if (err) res.send(err);
        console.log(lesson);
        res.redirect('/lessons/view/'+lesson._id);
    })
})

router.post('/delete', (req, res) => {
    Lesson.findByIdAndDelete(req.body.id).exec((err) => {
        if (err) res.send(err);
        else {
            res.redirect('/lessons');
        }
    })
})

module.exports = router;