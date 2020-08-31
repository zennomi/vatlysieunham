const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lessonSchema = new Schema({
    date: {
        type: String,
        required: true,
        index: true
    },
    student_id: {
        type: Schema.Types.ObjectId,
        index: true,
        required: true,
        ref: 'Student'
    },
    type: {
        type: String,
        enum: ['Lý thuyết', 'Bài tập']
    },
    time: {
        start_hour: Number,
        start_minute: Number,
        end_hour: Number,
        end_minute: Number
    },
    topic: String,
    total_problems: Number,
    rating: {
        type: Number,
        max: 10,
        min: 0
    },
    comment_of_student: String,
    comment_of_tutor: String,
    last_update: {
        time: {type: Date, default: Date.now},
        user: {type: Schema.Types.ObjectId, ref: 'User'}
    }
});

lessonSchema.index({ date: -1, student_id: 1 });
const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;