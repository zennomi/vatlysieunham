const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://new-user_01:25112001@cluster0.nxm48.mongodb.net/sample_crud_students?retryWrites=true&w=majority', {
    useNewUrlParser: true
}).then(() => {
    console.log('Connected to MongoDB Alas.');
}).catch((err) => {
    console.log('Error occurred connecting to MongoDB Alas');
});
const Classroom = require('./models/class.model');
const Student = require('./models/student.model');
const Lesson = require('./models/lesson.model');
Lesson.updateMany({ type: 'exercise' }, { type: 'Bài tập'}).exec((err, result) => {
    if (err) console.log(err);
    console.log(result);
})