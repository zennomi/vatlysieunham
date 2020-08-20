const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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