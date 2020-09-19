const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const homeworkSchema = new Schema({
    date: {
        type: Date,
        index: true
    },
    name: String,
    note: String,
    type: {
        type: String,
        enum: ['BTVN', 'KT15P', 'KT50P']
    },
    class: {type: Schema.Types.ObjectId, ref: 'Classroom'},
    total: {type: Number, default: 10},
    student: [{
        student_id: {type: Schema.Types.ObjectId, ref: 'Student'},
        finish_count: Number,
        note: String
    }],
    note: String
});

homeworkSchema.index({date: -1});

const Homework = mongoose.model('Homework', homeworkSchema);

module.exports = Homework;