const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const classroomSchema = new Schema({
    name: {type: String, index: true, unique: true},
    type: {
        type: String,
        enum: ['LEARN', 'TEST']
    }
})

classroomSchema.index({ name: 1 });
const Classroom = mongoose.model('Classroom', classroomSchema);

module.exports = Classroom;