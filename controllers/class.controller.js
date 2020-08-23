const Student = require('../models/student.model');
const Classroom = require('../models/class.model');

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
    let id = (await Classroom.findOne({ name: req.params.name }))._id
    res.render('classes/view', {
        students: await Student.find({ classroom: id }),
        className: req.params.name
    })
};