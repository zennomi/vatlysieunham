const Student = require('../models/student.model');
const Classroom = require('../models/class.model');
const Homework = require('../models/homework.model');

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
    let id = (await Classroom.findOne({ name: req.params.name }))._id;
    let homeworks = await Homework.find({ class: id });
    let idOfHomeworks = homeworks.map((homework) => homework._id.toString());
    let homeworksOfStudents = await Homework.aggregate([
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
                    homework_id: '$_id',
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
    homeworksOfStudents.forEach((homework) => {
        homework.arrayOfRecords = [];
        homework.records.forEach(record => {
            let index = idOfHomeworks.indexOf(record.homework_id.toString());
            homework.arrayOfRecords[index] = {
                point: record.point == null ?  null : Math.round(record.point*100)/10,
                note: record.note
            }
        });
    });
    res.render('classes/view', {
        students: await Student.find({ classroom: id }),
        className: req.params.name,
        homeworks: homeworks,
        homeworksOfStudents: homeworksOfStudents,
    })
};