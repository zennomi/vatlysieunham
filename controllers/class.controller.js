const Student = require('../models/student.model');
const Classroom = require('../models/class.model');
const Record = require('../models/record.model');

module.exports.index = (req, res) => {
    Student.aggregate([
        {
            $group: {
                _id: '$classroom',
                totalStudents: {$sum: 1}
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
            $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$nameArr", 0 ] }, "$$ROOT" ] } }
        },
        {
            $sort: {name: 1}
        }
    ]).exec((err, classrooms) => {
        if (err) res.render('errors', {
            errors: [err]
        })
        res.render('classes/index', {
            classes: classrooms
        })
    })
};

module.exports.getByName = async (req, res) => {
    let classroom = await Classroom.findOne({ name: req.params.name })
    let id = classroom._id;
    let records = await Record.find({ class: id }).sort({date: -1});
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
                records: {$addToSet: {
                    record_id: '$_id',
                    point:  {$divide: ['$student.finish_count', '$total']},
                    note: '$student.note'
                }}
            }
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
    recordsOfStudents.forEach((student) => {
        student.arrayOfRecords = [];
        student.records.forEach(record => {
            let index = idOfRecords.indexOf(record.record_id.toString());
            student.arrayOfRecords[index] = {
                point: record.point == null ?  null : Math.round(record.point*100)/10,
                note: record.note
            }
        });
    });
    if (classroom.type == 'LEARN') {
        res.render('classes/view', {
            students: await Student.find({ classroom: id, is_active: true }),
            className: req.params.name,
            records: records,
            recordsOfStudents: recordsOfStudents,
        })
    } else {
        res.render('classes/view', {
            students: await Student.find({ test_class: id, is_active: true }),
            className: req.params.name,
            records: records,
            recordsOfStudents: recordsOfStudents,
        })
    }
};