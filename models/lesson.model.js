const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lessonSchema = new Schema({
    date: {
        type: String,
        required: true
    },
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
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
    rating: {
        type: String,
        enum: ['Tốt', 'Khá', 'Yếu', '']
    },
    comment_of_student: String,
    comment_of_tutor: String
});
//lessonSchema.index({ date: -1 });
const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;