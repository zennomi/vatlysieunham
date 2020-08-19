const Student = require('../models/student.model');
const Classroom = require('../models/class.model');

module.exports.index = async (req, res) => {
    let students = await Student.find().populate('classroom');
    let classes = await Classroom.find();
    res.render('students/index', {
        students: students,
        classes: classes
    });
};

module.exports.search = async (req, res) => {
    let name = req.query.name;
    let id = req.query.id;
    let cla = req.query.class;

    let nameRegex = new RegExp(req.query.name, 'i');
    let students = await Student.find({ name: {$regex: nameRegex} }).populate('classroom');
    let classes = await Classroom.find();
    console.log(students);
    let matchedStudents = students.filter((student) => {
        return (!id || student.id == id) && (!cla || student.classroom.name == cla)
    });
    console.log(matchedStudents);
    res.render('students/index', {
        students: matchedStudents,
        name: name,
        id: id,
        classes: classes
    });
};

module.exports.create = async (req, res) => {
    res.render('students/create', {
        classes: await Classroom.find()
    })
};

module.exports.getById = async (req, res) => {
    res.render('students/view', {
        student: await Student.findOne({ id: req.params.id }).populate('classroom')
    })
};

module.exports.editById = async (req, res) => {
    let student = await Student.findOne({ id: req.params.id }).populate('classroom');
    res.render('students/edit', {
        student: student,
        classes: await Classroom.find()
    })
}

module.exports.deleteById = async (req, res) => {
    res.render('students/delete', {
        id: req.params.id
    });
}

module.exports.postCreate = async (req, res) => {
    let classroom = await Classroom.findOne({ name: req.body.class });
    let lastDigitYear = req.body.dob.split('-')[0].slice(2);
    let regex = new RegExp(`^${lastDigitYear}`);
    let id = lastDigitYear + (await Student.countDocuments({ id: { $regex: regex } } ) + 1);
    var student = new Student({
        name: req.body.name,
        classroom: classroom._id,
        dob: new Date(req.body.dob),
        id: id
    });
    await Classroom.findOneAndUpdate({ name: req.body.class }, { $addToSet: { students: student._id }});
    await student.save();
    console.log(student);
    res.redirect('/students');
};

module.exports.postEdit = async (req, res) => {
    let newClass = await Classroom.findOne({ name: req.body.class });
    let student = await Student.findOneAndUpdate(
        { id: req.body.id },
        { $set: { name: req.body.name, dob: req.body.dob, classroom: newClass._id }}
    );
    if (newClass.students.indexOf(student._id) == -1 ) {
        await Classroom.findOneAndUpdate({ students: student._id }, { $pull: {students: student._id } });
        newClass.addStudent(student._id);
        newClass.save();
    }
    res.redirect('/students/' + req.body.id);
}

module.exports.postDelete = async (req, res) => {
    let student = await Student.findOne({ id: req.body.id });
    let classroom = await Classroom.findOne({ students: { $all: [student._id]} });
    classroom.deleteStudent(student._id);
    await classroom.save();
    await Student.deleteOne({ id: req.body.id });
    
    res.redirect('/students');
}