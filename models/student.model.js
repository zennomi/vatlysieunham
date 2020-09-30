const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    name: String,
    dob: {type: Date},
    classroom: { type: Schema.Types.ObjectId, ref: 'Classroom' },
    test_class: { type: Schema.Types.ObjectId, ref: 'Classroom' },
    id: {type: Number, index: true, unique: true},
    tags: [String],
    note: String,
    is_active: Boolean
})
studentSchema.index({id: -1});
const Student = mongoose.model('Student', studentSchema);

module.exports = Student;

