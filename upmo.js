const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://new-user_01:25112001@cluster0.nxm48.mongodb.net/vlsn_2020?retryWrites=true&w=majority', {
    useNewdateParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}).then(() => {
    console.log('Connected to MongoDB Alas.');
    const Lesson = require('./models/lesson.model');
    try {
        Lesson.find({ date: { $regex: /2021/ } }).then(lessons => {
            for (const lesson of lessons) {
                lesson.date = lesson.date.replace('2021', '2023');
                if (!lesson.type) lesson.type = 'Lý thuyết'
                lesson.save()
                console.log(lesson.date)
            }
        })
    } catch (error) {
        console.log(error)
    }
}).catch((err) => {
    console.log('Error occurred connecting to MongoDB Alas');
});
