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
const Test = require('./models/test.model');
const Record = require('./models/record.model');

const studentRoute = require('./routers/student.route');
const classRoute = require('./routers/class.route');
const lessonRoute = require('./routers/lesson.route');
const authRoute = require('./routers/auth.route');
const userRoute = require('./routers/user.route');
const recordRoute = require('./routers/record.route');
const periodRoute = require('./routers/period.route');
const testRoute = require('./routers/test.route');
const authMiddleware = require('./middlewares/auth.middleware');
const { update } = require('./models/class.model');

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

app.get('/', pushMessage, async (req, res) => {
    let numStudents = await Student.countDocuments({is_active: true});
    let numClasses = await Classroom.countDocuments({type: 'LEARN'});
    let numLessons = await Lesson.countDocuments();
    res.render('index', {
        numStudents: numStudents,
        numClasses: numClasses,
        numLessons: numLessons
    });
});
app.get(/\/view/, authMiddleware.authRequire);
app.get(/\/edit/, authMiddleware.authRequire);
app.get(/\/create/, authMiddleware.authRequire);
app.get(/\/delete/, authMiddleware.authRequire);
app.use('/students/delete', authMiddleware.adminRequire);
app.use('/students', pushMessage, studentRoute);
app.use('/classes', pushMessage, classRoute);
app.use('/lessons', pushMessage, lessonRoute);
app.use('/auth', pushMessage, authRoute);
app.use('/records', authMiddleware.authRequire, pushMessage, recordRoute);
app.use('/periods', authMiddleware.authRequire, pushMessage, periodRoute);
app.use('/tests', authMiddleware.authRequire, pushMessage, testRoute);
app.use('/user', authMiddleware.authRequire, pushMessage, userRoute);

app.get('/api/students/search', (req, res) => {
    let nameRegex = new RegExp(req.query.name, 'i');
    Student.find({ name: { $regex: nameRegex } }).limit(5).populate('classroom').exec((err, students) => {
        res.json(students);
    });
});

app.get('/api/students/:id', (req, res) => {
    Student.findOne({id: req.params.id}, '_id name classroom')
        .populate('classroom')
        .exec((err, student) => {
            res.json(student);
        });
})

io.on('connection', (socket) => {
    socket.on('quick search', async function (name) {
        let nameRegex = new RegExp(name, 'i');
        let matchedStudents = await Student.find({ name: { $regex: nameRegex } }).limit(5).populate('classroom');
        io.emit('quick search', matchedStudents);
    });

    socket.on('update-test', async function (updateInfo) {
        let student = await Student.findOne({ id: updateInfo.studentId });
        if (!student) return;
        
        updateInfo.studentId = student._id;
        
        if (updateInfo.method == 'add') {
            await Test.findById(updateInfo.testId).exec((err, test) => {
                test.student.push({
                    student_id: updateInfo.studentId,
                    mark: updateInfo.mark ? Number(updateInfo.mark) : undefined,
                    note: updateInfo.note ? updateInfo.note : undefined
                });
                test.save();
            });     
            return;
        }

        if (updateInfo.method == 'update'){
            if (updateInfo.mark) {
                await Test.findOneAndUpdate({ _id: updateInfo.testId, 'student.student_id': updateInfo.studentId }, {
                    $set: {
                        'student.$.mark': updateInfo.mark,
                        'student.$.note': updateInfo.note
                    }
                })
            } else {
                await Test.findOneAndUpdate({ _id: updateInfo.testId, 'student.student_id': updateInfo.studentId }, {
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
            await Test.findByIdAndUpdate(updateInfo.testId, {
                $pull: {student: {student_id: updateInfo.studentId}}
            });
            return;
        }
    });
    socket.on('update-record', async function (updateInfo) {
        updateInfo.studentId = (await Student.findOne({ id: updateInfo.studentId }))._id;
        if (!updateInfo.note) updateInfo.note = undefined;
        if (updateInfo.finishCount) {
            await Record.findOneAndUpdate({ _id: updateInfo.recordId, 'student.student_id': updateInfo.studentId }, {
                $set: {
                    'student.$.finish_count': updateInfo.finishCount,
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
        }
    });
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