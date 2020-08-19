const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.connect('mongodb+srv://new-user_01:25112001@cluster0.nxm48.mongodb.net/sample_crud_students?retryWrites=true&w=majority', {useNewUrlParser: true});

const Classroom = require('./class.model');

const studentSchema = new Schema({
    name: String,
    dob: {type: Date, default: '1970-01-01'},
    classroom: { type: Schema.Types.ObjectId, ref: 'Classroom' },
    id: String
})

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;

