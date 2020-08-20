const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Classroom = require('./class.model');

const studentSchema = new Schema({
    name: String,
    dob: {type: Date, default: '1970-01-01'},
    classroom: { type: Schema.Types.ObjectId, ref: 'Classroom' },
    id: String
})

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;

