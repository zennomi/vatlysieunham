var express = require('express');
var router = express.Router();

const validate = require('../validate/lesson.validate');
const Lesson = require('../models/lesson.model');
const Student = require('../models/student.model');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', async (req, res) => {
    let nowTime = new Date();
    nowTime = nowTime.valueOf() + 252e5;
    nowTime = new Date(nowTime);
    nowTime = nowTime.toISOString();
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
        lessons: dateLesson,
        today: nowTime.slice(0,10)
    });
});

router.get('/create', (req, res) => {
    let nowTime = new Date();
    nowTime = nowTime.valueOf() + 252e5;
    nowTime = new Date(nowTime);
    nowTime = nowTime.toISOString();
    res.render('lessons/create', {
        time: {
            date: req.query.date || nowTime.slice(0, 10),
            time: nowTime.slice(11, 16)
        },
        student_id: req.query.id || ''
    });
});
router.get('/schedule', async (req, res) => {
    let nowTime = new Date();
    nowTime = nowTime.valueOf() + 252e5;
    nowTime = new Date(nowTime);
    nowTime = nowTime.toISOString();

    let nowHour = parseInt(nowTime.slice(11, 13));
    let nowMinute = parseInt(nowTime.slice(14, 16));
    let lessons = await Lesson.find({ date: { $gte: nowTime.slice(0, 10) } }).populate('student_id');
    lessons = lessons.filter(lesson => lesson.time.start_hour >= nowHour).filter(lesson => lesson.time.start_hour);
    console.log(lessons, nowHour, nowMinute);
    res.render('lessons/schedule', {
        lessons: lessons
    });
})
router.get('/analyse', authMiddleware.authRequire, async (req, res) => {
    let nowTime = new Date();
    nowTime = nowTime.valueOf() + 252e5;
    nowTime = new Date(nowTime);
    nowTime = nowTime.toISOString();
    let topStudents = await Lesson.aggregate([
        {
            $match: {
                'time.end_hour': { $ne: null },
                'date': { $gte: req.query.start_date || '2019-06' },
                'date': { $lte: req.query.end_date || nowTime.slice(0, 10) }
            }
        },
        {
            $group: {
                _id: "$student_id",
                total: { $sum: 1 },
                totalTimes: {
                    $sum: {
                        $subtract: [{ $sum: [{ $multiply: ['$time.end_hour', 60] }, '$time.end_minute'] },
                        { $sum: [{ $multiply: ['$time.start_hour', 60] }, '$time.start_minute'] }]
                    }
                }
            }
        },
        {
            $sort: {
                totalTimes: -1
            }
        },
        {
            $limit: 10
        },
        {
            $lookup: {
                from: "students",
                localField: "_id",
                foreignField: "_id",
                as: 'student'
            }
        }
    ]);
    let topHards = await Lesson.aggregate([
        {
            $match: {
                'time.end_hour': { $ne: null },
                'date': { $gte: req.query.start_date || '2019-06' },
                'date': { $lte: req.query.end_date || nowTime.slice(0, 10) },
                'total_problems': { $ne: null }
            }
        },
        {
            $group: {
                _id: '$student_id',
                totalProblems: {$sum: '$total_problems'},
                totalTimes: {
                    $sum: {
                        $subtract: [{ $sum: [{ $multiply: ['$time.end_hour', 60] }, '$time.end_minute'] },
                        { $sum: [{ $multiply: ['$time.start_hour', 60] }, '$time.start_minute'] }]
                    }
                }
            }
        },
        {
            $project: {
                _id: 1,
                avgProblems: {$divide: ['$totalProblems', {$divide: ['$totalTimes', 60]}]}
            }
        },
        {
            $sort: {
                avgProblems: -1
            }
        },
        {
            $limit: 10
        },
        {
            $lookup: {
                from: "students",
                localField: "_id",
                foreignField: "_id",
                as: 'student'
            }
        }
    ])
    console.log(topHards)
    let topDates = await Lesson.aggregate([
        {
            $match: {
                'date': { $gte: req.query.start_date || '2019-06' },
                'time.end_hour': { $ne: null },
                'date': { $lte: req.query.end_date || nowTime.slice(0, 10) }
            }
        },
        {
            $group: {
                _id: '$date',
                total: { $sum: 1 },
                totalTimes: {
                    $sum: {
                        $subtract: [{ $sum: [{ $multiply: ['$time.end_hour', 60] }, '$time.end_minute'] },
                        { $sum: [{ $multiply: ['$time.start_hour', 60] }, '$time.start_minute'] }]
                    }
                }
            }
        },
        {
            $sort: { total: -1, totalTimes: -1 }
        },
        {
            $limit: 7
        }
    ]);
    let topDays = await Lesson.aggregate([
        {
            $match: {
                'date': { $gte: req.query.start_date || '2019-06' },
                'time.end_hour': { $ne: null },
                'date': { $lte: req.query.end_date || nowTime.slice(0, 10) }
            }
        },
        {
            $project: {
                _id: 0,
                day: { $dayOfWeek: { $dateFromString: { dateString: '$date' } } },
                time: 1
            }
        },
        {
            $group: {
                _id: '$day',
                total: { $sum: 1 },
                totalTimes: {
                    $sum: {
                        $subtract: [{ $sum: [{ $multiply: ['$time.end_hour', 60] }, '$time.end_minute'] },
                        { $sum: [{ $multiply: ['$time.start_hour', 60] }, '$time.start_minute'] }]
                    }
                }
            }
        },
        {
            $sort: { total: -1, totalTimes: -1 }
        },
        {
            $limit: 7
        }
    ])

    let dataHours = await Lesson.aggregate([
        {
            $match: {
                'date': { $gte: req.query.start_date || '2019-06' },
                'time.end_hour': { $ne: null },
                'date': { $lte: req.query.end_date || nowTime.slice(0, 10) }
            }
        },
        {
            $project: {
                _id: 0,
                start_hour: '$time.start_hour',
                start_minute: '$time.start_minute',
                total: {
                    $subtract: [{ $sum: [{ $multiply: ['$time.end_hour', 60] }, '$time.end_minute'] },
                    { $sum: [{ $multiply: ['$time.start_hour', 60] }, '$time.start_minute'] }]
                }
            }
        }
    ])
    let topHours = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

    dataHours.forEach(lesson => {
        let i = lesson.start_hour;
        let total = lesson.total;
        if (lesson.start_minute+total<=60) {
            topHours[i]+=total;
        } else {
            topHours[i]+=60-lesson.start_minute;
            total-=60-lesson.start_minute;
            while (total >= 60) {
                i++;
                topHours[i]+=60;
                total-=60;
            }
            i++;
            topHours[i]+=total;
        }
    })
    topHours = topHours
    .map((ele,i) => { return {hour: i, value: ele }})
    .sort((a, b) => (a.value > b.value)?-1:(a.value<b.value)?1:0);
    res.render('lessons/analyse', {
        start_date: req.query.start_date,
        end_date: req.query.end_date,
        topStudents: topStudents,
        topDates: topDates,
        topDays: topDays,
        topHours: topHours,
        topHards: topHards
    });
});

router.get('/:date', (req, res) => {
    Lesson.find({ date: req.params.date }).populate('student_id').exec((err, lessons) => {
        console.log(lessons);
        if (err) res.send(err);
        res.render('lessons/view', {
            date: req.params.date,
            lessons: lessons
        })
    })
})

router.get('/view/:id', (req, res) => {
    Lesson.findById(req.params.id).populate({ path: 'student_id', populate: { path: 'classroom' } }).exec((err, lesson) => {
        if (err) res.render(err);
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
            lesson: lesson
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
        type: req.body.total_problems ? 'Bài tập' : (req.body.type ? req.body.type : undefined),
        time: {
            start_hour: req.body.start_time ? parseInt(req.body.start_time.slice(0, 2)) : undefined,
            start_minute: req.body.start_time ? parseInt(req.body.start_time.slice(3, 5)) : undefined,
            end_hour: req.body.end_time ? parseInt(req.body.end_time.slice(0, 2)) : undefined,
            end_minute: req.body.end_time ? parseInt(req.body.end_time.slice(3, 5)) : undefined
        },
        topic: req.body.topic,
        total_problems: req.body.total_problems,
        rating: req.body.rating,
        comment_of_tutor: req.body.comment_of_tutor,
        comment_of_student: req.body.comment_of_student
    })
    await lesson.save();
    res.redirect('/lessons/' + lesson.date);
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
            total_problems: req.body.total_problems,
            rating: req.body.rating,
            comment_of_tutor: req.body.comment_of_tutor,
            comment_of_student: req.body.comment_of_student
        }
    }).exec((err, lesson) => {
        if (err) res.send(err);
        console.log(lesson);
        res.redirect('/lessons/view/' + lesson._id);
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