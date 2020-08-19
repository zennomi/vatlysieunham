
const Classroom = require('./models/class.model');
const Student = require('./models/student.model');
Classroom.findOneAndUpdate({ students: '5f379c8aae93d11f5cc4753b' }, { $pull: {students: '5f379c8aae93d11f5cc4753b' } }).exec((err, doc) => {
    console.log(doc);
})