const Student = require('../../models/student.model');

module.exports.search = (req, res) => {
    let nameRegex = new RegExp(req.query.name, 'i');
    Student.find({ name: { $regex: nameRegex } }).limit(5).populate('classroom').exec((err, students) => {
        res.json(students);
    });
};

module.exports.getById = (req, res) => {
    Student.findOne({ id: req.params.id }, '_id name classroom')
        .populate('classroom')
        .exec((err, student) => {
            res.json(student);
        });
};