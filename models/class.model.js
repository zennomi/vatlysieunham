const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Student = require('./student.model');
const classroomSchema = new Schema({
    name: {type: String, index: true, unique: true},
    type: {
        type: String,
        enum: ['LEARN', 'TEST']
    },
    main_tutor: {type: Schema.Types.ObjectId, ref: 'User'},
    side_tutor: {type: Schema.Types.ObjectId, ref: 'User'},
    note: String
})
classroomSchema.methods.getNumberOfStudents = async function() {
    return await Student
        .countDocuments({$or: [{classroom: this._id}, {test_class: this._id}], is_active: true});
}
classroomSchema.index({ name: 1 });
const Classroom = mongoose.model('Classroom', classroomSchema);

module.exports = Classroom;