const Lesson = require('../../models/lesson.model');

module.exports.getTopDates = async (req, res) => {
    let nowDate = new Date();
    nowDate = nowDate.valueOf() + 252e5;
    nowDate = new Date(nowDate);
    nowDate = nowDate.toISOString().slice(0,10);

    if(!req.query.start_date) req.query.start_date = nowDate;
    if(!req.query.end_date) req.query.end_date = nowDate;

    let distanceTime = (new Date(req.query.end_date)).valueOf() -(new Date(req.query.start_date)).valueOf();
    let lastStartTime = new Date((new Date(req.query.start_date)).valueOf()-distanceTime-24*3600*1000);
    let lastEndTime = new Date((new Date(req.query.end_date)).valueOf()-distanceTime-24*3600*1000);
    lastStartTime = lastStartTime.toISOString().slice(0,10);
    lastEndTime = lastEndTime.toISOString().slice(0,10);
    
    let topDates = {};
    topDates.thisPeriod = await Lesson.aggregate([
        {
            $match: {
                'date': { $gte: req.query.start_date, $lte: req.query.end_date},
                'time.end_hour': { $ne: null }
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
            $sort: { _id: 1 }
        }
    ]);
    topDates.lastPeriod = await Lesson.aggregate([
        {
            $match: {
                'date': { $gte: lastStartTime, $lte: lastEndTime},
                'time.end_hour': { $ne: null }
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
            $sort: { _id: 1 }
        }
    ]);
    res.json(topDates);
}

module.exports.getDataOfDate = (req, res) => {
    Lesson.find({ date: req.query.date }).populate('student_id').exec((err, lessons) => {
        if (err) res.send(err);
        let data = {};
        data.rating = []
        data.rating[0] = lessons.filter(lessons => lessons.rating >= 8).length;
        data.rating[1] = lessons.filter(lessons => lessons.rating >= 6 && lessons.rating < 8).length;
        data.rating[2] = lessons.filter(lessons => lessons.rating >= 4 && lessons.rating < 6).length;
        data.rating[3] = lessons.filter(lessons => lessons.rating >= 0.1 && lessons.rating < 4).length;
        data.rating[4] = lessons.length - data.rating[0] - data.rating[1] - data.rating[2] - data.rating[3];
        data.type = [];
        data.type[0] = lessons.filter(lessons => lessons.type == "Lý thuyết").length;
        data.type[1] = lessons.filter(lessons => lessons.type == "Bài tập").length;
        data.type[2] = lessons.length - data.type[0] - data.type[1] ;
        res.json(data);
    })
}