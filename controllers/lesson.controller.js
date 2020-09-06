const validate = require('../validate/lesson.validate');
const Lesson = require('../models/lesson.model');
const Student = require('../models/student.model');
const authMiddleware = require('../middlewares/auth.middleware');
const router = require('../routers/lesson.route');

module.exports.index = async (req, res) => {
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
}

module.exports.create = (req, res) => {
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
}

module.exports.register = (req, res) => {
    if (!req.signedCookies.registerLesson) {
        res.cookie('registerLesson', [], {
            signed: true,
            maxAge: 7 * 24 * 3600 * 1000
        });
    }
    res.render('lessons/register2');
}

module.exports.viewRegisters = (req, res) => {
    let arrays = req.signedCookies.registerLesson
    Lesson.find({'_id': {$in: arrays}}).exec((err, lessons) => {
        res.render('lessons/registers', {
            lessons: lessons
        });
    })
}

module.exports.schedule = async (req, res) => {
    let nowTime = new Date();
    nowTime = nowTime.valueOf() + 252e5;
    nowTime = new Date(nowTime);
    nowTime = nowTime.toISOString();

    let nowHour = parseInt(nowTime.slice(11, 13));
    let nowMinute = parseInt(nowTime.slice(14, 16));
    let lessons = await Lesson.find({ date: { $gte: nowTime.slice(0, 10) } }).populate('student_id');
    lessons = lessons.filter(lesson => lesson.time.start_hour >= nowHour).filter(lesson => lesson.time.start_hour);
    res.render('lessons/schedule', {
        lessons: lessons
    });
}

module.exports.check = (req, res) => {
    Lesson.find({
        $or: [{'time.end_hour': null},{'rating': null}]
    }).populate('student_id').sort({date: -1}).exec((err, lessons) => {
        res.render('lessons/check', {
            lessons
        })
    })
}

module.exports.analyse = async (req, res) => {
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
}

module.exports.viewByDate = (req, res) => {
    Lesson.find({ date: req.params.date }).populate('student_id').exec((err, lessons) => {
        if (err) res.send(err);
        res.render('lessons/view', {
            date: req.params.date,
            lessons: lessons
        })
    })
}

module.exports.viewById = (req, res) => {
    Lesson.findById(req.params.id).populate({ path: 'student_id', populate: { path: 'classroom' } }).populate('last_update.user').exec((err, lesson) => {
        if (err) res.render(err);
        let lastUpdateTime = '';
        let nowTime = new Date();
        if (lesson.last_update.time) {
            if(nowTime.getUTCMonth() > lesson.last_update.time.getUTCMonth()) {
                lastUpdateTime = nowTime.getUTCMonth() - lesson.last_update.time.getUTCMonth() + ' tháng';
            } else if (nowTime.getUTCDate() > lesson.last_update.time.getUTCDate()) {
                lastUpdateTime = nowTime.getUTCDate() - lesson.last_update.time.getUTCDate() + ' ngày';
            } else if (nowTime.getUTCHours() > lesson.last_update.time.getUTCHours()) {
                lastUpdateTime = nowTime.getUTCHours() - lesson.last_update.time.getUTCHours() + ' giờ';
            } else if (nowTime.getUTCMinutes() > lesson.last_update.time.getUTCMinutes()) {
                lastUpdateTime = nowTime.getUTCMinutes() - lesson.last_update.time.getUTCMinutes() + ' phút';
            } else if (nowTime.getUTCSeconds() > lesson.last_update.time.getUTCSeconds()) {
                lastUpdateTime = nowTime.getUTCSeconds() - lesson.last_update.time.getUTCSeconds() + ' giây';
            } else lastUpdateTime = '1 giây'
        }
        res.render('lessons/view-id', {
            lesson: lesson,
            lastUpdateTime: lastUpdateTime
        })
    })
}

module.exports.editById = (req, res) => {
    Lesson.findById(req.params.id).populate('student_id').exec((err, lesson) => {
        if (err) res.send(err);
        let nowTime = new Date();
        res.render('lessons/edit', {
            lesson: lesson
        });
    })
}

module.exports.deleteById = (req, res) => {
    Lesson.findById(req.params.id).populate('student_id').exec((err, lesson) => {
        if (err) res.send(err);
        else {
            res.render('lessons/delete', {
                lesson: lesson
            })
        }
    })
}

module.exports.postCreate = async (req, res) => {
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
        comment_of_student: req.body.comment_of_student,
        last_update: {
            time: Date.now(),
            user: req.signedCookies.user._id
        }
    })
    await lesson.save();
    req.flash('success', 'Thêm buổi trợ giảng thành công.');
    res.redirect('/lessons/' + req.body.date);
}

module.exports.postRegister = async (req, res) => {
    let today = new Date();
    today = today.valueOf() + 252e5;
    today = new Date(today);

    let id = (await Student.findOne({ id: req.body.student_id }))._id;
    
    if (req.body.start_time_2) {
        await registerDay(1, req.body.type_2, req.body.start_time_2, req.body.end_time_2, req.body.topic_2)
    }
    if (req.body.start_time_3) {
        await registerDay(2, req.body.type_3, req.body.start_time_3, req.body.end_time_3, req.body.topic_3)
    }
    if (req.body.start_time_4) {
        await registerDay(3, req.body.type_4, req.body.start_time_4, req.body.end_time_4, req.body.topic_4)
    }
    if (req.body.start_time_5) {
        await registerDay(4, req.body.type_5, req.body.start_time_5, req.body.end_time_5, req.body.topic_5)
    }
    if (req.body.start_time_6) {
        await registerDay(5, req.body.type_6, req.body.start_time_6, req.body.end_time_6, req.body.topic_6)
    }
    if (req.body.start_time_7) {
        await registerDay(6, req.body.type_7, req.body.start_time_7, req.body.end_time_7, req.body.topic_7)
    }
    if (req.body.start_time_8) {
        await registerDay(0, req.body.type_8, req.body.start_time_8, req.body.end_time_8, req.body.topic_8)
    }
    req.flash('success', 'Đăng ký trợ giảng thành công.');
    res.redirect('/lessons/registers');

    async function registerDay(value, type, start_time, end_time, topic) {
        let distance = (value <= today.getUTCDay()) ? value - today.getUTCDay() + 7 : value - today.getUTCDay();
        let date = today.valueOf() + distance*864e5;
        date = new Date(date);
        let lesson = new Lesson({
            date: date.toISOString().slice(0,10),
            student_id: id,
            type: type ? type : undefined,
            time: {
                start_hour: start_time ? parseInt(start_time.slice(0, 2)) : undefined,
                start_minute: start_time ? parseInt(start_time.slice(3, 5)) : undefined,
                end_hour: end_time ? parseInt(end_time.slice(0, 2)) : undefined,
                end_minute: end_time ? parseInt(end_time.slice(3, 5)) : undefined
            },
            topic: topic,
            comment_of_student: req.body.comment_of_student
        });
        await lesson.save();
        let lists = req.signedCookies.registerLesson;
        lists.push(lesson._id);
        res.cookie('registerLesson', lists, {
            signed: true,
            maxAge: 7 * 24 * 3600 * 1000
        });
    }
}

module.exports.postEdit =(req, res) => {
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
            comment_of_student: req.body.comment_of_student,
            last_update: {
                time: Date.now(),
                user: req.signedCookies.user._id
            }
        }
    }).exec((err, lesson) => {
        if (err) res.send(err);
        req.flash('success', 'Sửa buổi trợ giảng thành công.');
        res.redirect('/lessons/view/' + lesson._id);
    })
}

module.exports.postDelete = (req, res) => {
    
    Lesson.findByIdAndDelete(req.body.id).exec((err) => {
        if (err) {
            res.send('error', {
                errors: [err]
            });
            return;
        }
        req.flash('danger', 'Vừa xóa một buổi trợ giảng.');
        res.redirect('/lessons');
    })
}