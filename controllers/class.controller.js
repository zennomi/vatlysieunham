const Student = require('../models/student.model');
const Classroom = require('../models/class.model');

module.exports.index = async (req, res) => {
    res.render('classes/index', {
        classes: await Classroom.find()
    })
};

module.exports.getByName = async (req, res) => {
    let classroom = await Classroom.findOne({ name: req.params.name }).populate({ path: 'students', populate: { path: 'classroom'}});
    res.render('classes/view', {
        cla: classroom,
        students: classroom.students
    })
};