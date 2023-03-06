const Student = require('../models/student.model');
const Classroom = require('../models/class.model');
const User = require('../models/user.model');
const Record = require('../models/record.model');

module.exports.index = async (req, res) => {
    let classes = [];
    classes = await Student.aggregate([
        {
            $match: { is_active: true }
        },
        {
            $group: {
                _id: '$classroom',
                totalStudents: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: 'classrooms',
                localField: '_id',
                foreignField: '_id',
                as: 'nameArr'
            }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$nameArr", 0] }, "$$ROOT"] } }
        },
        {
            $sort: { name: 1 }
        }
    ]);
    classes.push(...Array.from(await Student.aggregate([
        {
            $match: {
                test_class: { $ne: null },
                is_active: true
            }
        },
        {
            $group: {
                _id: '$test_class',
                totalStudents: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: 'classrooms',
                localField: '_id',
                foreignField: '_id',
                as: 'nameArr'
            }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$nameArr", 0] }, "$$ROOT"] } }
        }
    ])));
    res.render('classes/index', { classes })
};

module.exports.getByName = async (req, res) => {
    let classroom = await Classroom.findOne({ name: req.params.name }).populate('main_tutor').populate('side_tutor');
    let id = classroom._id;
    let records = await Record.find({ class: id }).sort({ date: -1 });
    let idOfRecords = records.map((record) => record._id.toString());
    let recordsOfStudents = await Record.aggregate([
        {
            $match: {
                'class': id
            }
        },
        {
            $unwind: "$student"
        },
        {
            $group: {
                _id: '$student.student_id',
                records: {
                    $addToSet: {
                        record_id: '$_id',
                        point: { $divide: ['$student.finish_count', '$total'] },
                        note: '$student.note'
                    }
                }
            }
        },
        {
            $lookup: {
                from: "students",
                localField: "_id",
                foreignField: "_id",
                as: 'student'
            }
        },
        {
            $match: {
                student: {
                    $elemMatch: { is_active: true }
                }
            }
        }
    ]);
    recordsOfStudents.forEach((student) => {
        student.arrayOfRecords = [];
        student.records.forEach(record => {
            let index = idOfRecords.indexOf(record.record_id.toString());
            student.arrayOfRecords[index] = {
                point: record.point == null ? null : Math.round(record.point * 100) / 10,
                note: record.note
            }
        });
    });
    if (classroom.type == 'LEARN') {
        res.render('classes/view', {
            students: await Student.find({ classroom: id, is_active: true }),
            classroom: classroom,
            records: records,
            recordsOfStudents: recordsOfStudents,
        })
    } else {
        res.render('classes/view', {
            students: await Student.find({ test_class: id, is_active: true }),
            classroom: classroom,
            records: records,
            recordsOfStudents: recordsOfStudents,
        })
    }
};

module.exports.getDataStudents = async (req, res) => {
    let startDate = req.query.start_date || '2022-06-01';
    let endDate = req.query.end_date || (new Date()).toISOString().slice(0,10);
    let classroom = await Classroom.findOne({ name: req.params.name });
    let students = await Student.find({ classroom: classroom._id });
    let idArray = students.map(student => student._id);
    let records = await Record.aggregate([
        {
            $unwind: '$student'
        },
        {
            $match: {
                'student.student_id': { $in: idArray },
                'student.finish_count': { $ne: null, $ne: undefined },
                'date': {$gte: new Date(startDate), $lte: new Date(endDate)}
            }
        },
        {
            $project: {
                _id: '$student.student_id',
                mark: { $multiply: [{ $divide: ['$student.finish_count', '$total'] }, 10] },
                type: '$type',
                note: '$student.note'
            }
        },
        {
            $group: {
                _id: '$_id',
                records: { $push: { mark: '$mark', type: '$type', note: '$note' } }
            }
        },
        {
            $lookup: {
                from: "lessons",
                localField: "_id",
                foreignField: "student_id",
                as: "lessons"
            }
        },
        {
            $project: {
                _id: true,
                records: true,
                lessons: {
                    $filter: {
                        input: "$lessons",
                        as: "lesson",
                        cond: {$and: [{$ne: ['$$lesson.rating', null]},
                            {$gte: ['$$lesson.date', startDate]},
                            {$lte: ['$$lesson.date', endDate]}] }
                    }
                }
            }
        },
        {
            $lookup: {
                from: "students",
                localField: "_id",    // field in the orders collection
                foreignField: "_id",  // field in the items collection
                as: "fromItems"
            }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$fromItems", 0] }, "$$ROOT"] } }
        },
        { $project: { fromItems: 0 } }
    ]);
    records.forEach(student => {
        student.average = [];
        student.average[0] = Math.round(student.records.filter(r => r.type == "BTVN").map(r => r.mark).reduce((a,b) => a + b, 0)/student.records.filter(r => r.type == "BTVN").length*10)/10;
        student.average[1] = Math.round(student.records.filter(r => r.type == "KT15P").map(r => r.mark).reduce((a,b) => a + b, 0)/student.records.filter(r => r.type == "KT15P").length*10)/10;
        student.average[2] = Math.round(student.records.filter(r => r.type == "KT50P" || r.type.indexOf("TEST") >-1).map(r => r.mark).reduce((a,b) => a + b, 0)/student.records.filter(r => r.type == "KT50P" || r.type.indexOf("TEST") >-1).length*10)/10;
        student.average[3] = Math.round(student.lessons.map(l => l.rating).reduce((a,b) => a + b, 0)/student.lessons.length*10)/10;
    })
    res.render('classes/data', {
        className: req.params.name,
        data: records,
        startDate, endDate
    })
}

module.exports.editByName = async(req, res) => {
    let classroom = await Classroom.findOne({ name: req.params.name }).populate('main_tutor').populate('side_tutor');
    let users = await User.find({});
    res.render('classes/edit', {classroom, users})
}

module.exports.postEditById = async (req, res) => {
    let classroom = await Classroom.findById(req.params.id);
    classroom.name = req.body.name;
    if (req.body.note) classroom.note = req.body.note;
    else classroom.note = undefined;
    if (req.body.main_tutor) classroom.main_tutor = req.body.main_tutor;
    else classroom.main_tutor = undefined;
    if (req.body.side_tutor) classroom.side_tutor = req.body.side_tutor;
    else classroom.side_tutor = undefined;
    await classroom.save();
    res.redirect('/classes/'+classroom.name);
}