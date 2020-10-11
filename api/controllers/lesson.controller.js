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