require('dotenv').config();

const express = require('express');
const app = express();
const http = require('http').Server(app);
const port = process.env.PORT || 3000;
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');

var io = require('socket.io')(http);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}).then(() => {
    console.log('Connected to MongoDB Atlas.');
}).catch((err) => {
    console.log('Error occurred connecting to MongoDB Atlas');
});

const Student = require('./models/student.model');
const Classroom = require('./models/class.model');
const Lesson = require('./models/lesson.model');
const User = require('./models/user.model');
const Record = require('./models/record.model');

const studentRoute = require('./routers/student.route');
const classRoute = require('./routers/class.route');
const lessonRoute = require('./routers/lesson.route');
const authRoute = require('./routers/auth.route');
const userRoute = require('./routers/user.route');
const recordRoute = require('./routers/record.route');
const periodRoute = require('./routers/period.route');

const apiStudentRoute = require('./api/routers/student.route');
const apiLessonRoute = require('./api/routers/lesson.route');

const authMiddleware = require('./middlewares/auth.middleware');
const viewMiddleware = require('./middlewares/view.middleware');

app.set('views', './views');
app.set('view engine', 'pug');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.static(__dirname + '/public'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    maxAge: new Date(Date.now() + 3600000),
    resave: true,
    saveUninitialized: true,
    cookie: { path: '/', maxAge: 24 * 3600 * 1000, httpOnly: true }
}));

app.use(flash());

app.use(authMiddleware.getAuth);

app.get(/\/view/, authMiddleware.authRequire);
app.get(/\/edit/, authMiddleware.authRequire);
app.get(/\/create/, authMiddleware.authRequire);
app.get(/\/delete/, authMiddleware.authRequire);
app.use('/students/delete', authMiddleware.adminRequire);

app.use(pushMessage);
app.use(viewMiddleware.getBreadcrumb);
app.get('/', (req, res) => {
    res.render('index');
});
app.get('/dashboard', pushMessage, async (req, res) => {
    let nowTime = (new Date()).valueOf();
    let students = await Student.find({ is_active: true }).populate('classroom');
    let newStudents = students
                        .filter(student => (student.created_at).valueOf() > nowTime - 7 * 24 * 3600 * 1000)
                        .sort((a, b) => b.created_at.valueOf() - a.created_at.valueOf());
    let numStudents = students.length;
    let numClasses = await Classroom.countDocuments({ type: 'LEARN' });
    let numLessons = await Lesson.countDocuments();
    let numRecords = await Record.countDocuments();
    res.render('dashboard', {
        title: 'TỔNG KẾT - VLSN',
        numStudents: numStudents,
        numClasses: numClasses,
        numRecords: numRecords,
        numLessons: numLessons,
        newStudents: newStudents
    });
});

app.use('/students', studentRoute);
app.use('/classes', classRoute);
app.use('/lessons', lessonRoute);
app.use('/auth', authRoute);
app.use('/records', authMiddleware.authRequire, recordRoute);
app.use('/periods', authMiddleware.authRequire, periodRoute);
app.use('/user', authMiddleware.authRequire, userRoute);
app.use('/api/students', apiStudentRoute);
app.use('/api/lessons', apiLessonRoute);

io.on('connection', (socket) => {
    socket.on('quick search', async function (name) {
        let nameRegex = new RegExp(name, 'i');
        let matchedStudents = await Student.find({ name: { $regex: nameRegex } }).limit(5).populate('classroom');
        io.emit('quick search', matchedStudents);
    });

    socket.on('update-record', async function (updateInfo) {
        let student = await Student.findOne({ id: updateInfo.studentId });
        if (!student) return;

        updateInfo.studentId = student._id;

        if (updateInfo.method == 'add') {
            await Record.findById(updateInfo.recordId).exec((err, record) => {
                record.student.push({
                    student_id: updateInfo.studentId,
                    finish_count: updateInfo.finish_count ? Number(updateInfo.finish_count) : undefined,
                    note: updateInfo.note ? updateInfo.note : undefined
                });
                record.save();
            });
            return;
        }

        if (updateInfo.method == 'update') {
            if (updateInfo.finish_count) {
                await Record.findOneAndUpdate({ _id: updateInfo.recordId, 'student.student_id': updateInfo.studentId }, {
                    $set: {
                        'student.$.finish_count': updateInfo.finish_count,
                        'student.$.note': updateInfo.note
                    }
                })
            } else {
                await Record.findOneAndUpdate({ _id: updateInfo.recordId, 'student.student_id': updateInfo.studentId }, {
                    $unset: {
                        'student.$.finish_count': ''
                    },
                    $set: {
                        'student.$.note': updateInfo.note
                    }
                })
            };
            return;
        }

        if (updateInfo.method = 'remove') {
            console.log(updateInfo)
            await Record.findByIdAndUpdate(updateInfo.recordId, {
                $pull: { student: { student_id: updateInfo.studentId } }
            });
            return;
        }
    });
    //     socket.on('update-record', async function (updateInfo) {
    //         updateInfo.studentId = (await Student.findOne({ id: updateInfo.studentId }))._id;
    //         if (!updateInfo.note) updateInfo.note = undefined;
    //         if (updateInfo.finishCount) {
    //             await Record.findOneAndUpdate({ _id: updateInfo.recordId, 'student.student_id': updateInfo.studentId }, {
    //                 $set: {
    //                     'student.$.finish_count': updateInfo.finishCount,
    //                     'student.$.note': updateInfo.note
    //                 }
    //             })
    //         } else {
    //             await Record.findOneAndUpdate({ _id: updateInfo.recordId, 'student.student_id': updateInfo.studentId }, {
    //                 $unset: {
    //                     'student.$.finish_count': ''
    //                 },
    //                 $set: {
    //                     'student.$.note': updateInfo.note
    //                 }
    //             })
    //         }
    //     });
});

//test
app.get('/graph', (req, res) => {
    res.render('graph');
})
app.get('/flash', function (req, res) {
    // Set a flash message by passing the key, followed by the value, to req.flash().
    req.flash('info', 'Flash is back!')
    res.redirect('/');
});
function pushMessage(req, res, next) {
    res.locals.messages = req.flash('messages');
    next();
}
// end test

http.listen(port, () => {
    console.log('Server is running at ' + port);
});