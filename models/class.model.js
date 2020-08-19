const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.connect('mongodb+srv://new-user_01:25112001@cluster0.nxm48.mongodb.net/sample_crud_students?retryWrites=true&w=majority', {useNewUrlParser: true});

const Student = require('./student.model');

const classroomSchema = new Schema({
    name: String,
    students: [{ type: Schema.Types.ObjectId, ref: 'Student'} ]
})

classroomSchema.methods.addStudent = function (newStudentId) {
    this.students.push(newStudentId)
}

classroomSchema.methods.deleteStudent = function (studentId) {
    let index = this.students.indexOf(studentId);
    if (index > -1)
        this.students.splice(index, 1);
}

const Classroom = mongoose.model('Classroom', classroomSchema);

module.exports = Classroom;