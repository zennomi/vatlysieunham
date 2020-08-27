require('dotenv').config();

const express = require('express');
const app = express();
const http = require('http').Server(app);
const port = process.env.PORT || 3000;
const session = require('express-session');
const flash = require('connect-flash');

var io = require('socket.io')(http);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://new-user_01:25112001@cluster0.nxm48.mongodb.net/vlsn_2020?retryWrites=true&w=majority', {
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

const studentRoute = require('./routers/student.route');
const classRoute = require('./routers/class.route');
const lessonRoute = require('./routers/lesson.route');
const authRoute = require('./routers/auth.route');

const authMiddleware = require('./middlewares/auth.middleware');

app.set('views', './views');
app.set('view engine', 'pug');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.static(__dirname + '/public'));
app.use(session({
    cookie: { maxAge: 60000 },
    secret: 'codeworkrsecret',
    saveUninitialized: false,
    resave: false
}));
app.use(flash());


app.use((req, res, next) => {
    if(req.signedCookies.username) {
        if (!app.locals.user) {
            User.findOne({ username: req.signedCookies.username }).exec((err, user) => {
                if (err) {
                    app.render('error', {
                        errors: [err]
                    });
                    return;
                }
                if (!user) {
                    res.redirect('/auth/login');
                    return;
                }
                app.locals.user = user;
            })
        }
    }
    next();
});

app.get('/', pushMessage, async (req, res) => {
    let numStudents = await Student.countDocuments();
    let numClasses = await Classroom.countDocuments();
    let numLessons = await Lesson.countDocuments();
    res.render('index', {
        numStudents: numStudents,
        numClasses: numClasses,
        numLessons: numLessons
//        messages: req.flash()
    });
});


app.get(/\/edit\//, authMiddleware.authRequire);
app.get(/\/create/, authMiddleware.authRequire);
app.get(/\/delete/, authMiddleware.authRequire);
app.use('/students/delete', authMiddleware.adminRequire);
app.use('/students', pushMessage, studentRoute);
app.use('/classes', pushMessage, classRoute);
app.use('/lessons', pushMessage, lessonRoute);
app.use('/auth',pushMessage, authRoute);

app.get('/user/:username', authMiddleware.authRequire, (req, res) => {
    User.findOne({ username: req.params.username }).exec((err, user) => {
        if (!user) {
            res.render('error', {
                errors: ['Không tìm thấy user có tên này.']
            });
            return;
        }
        res.render('user/view', {
            matchedUser: user
        })
    })
});

app.get('/auth/logout', (req, res) => {
    app.locals.user = undefined;
    res.clearCookie('username');
    res.clearCookie('user_id');
    req.flash('info','Đăng xuất thành công.');
    res.redirect('/');
})

io.on('connection', (socket) => {
    socket.on('quick search', async function (name) {
        let nameRegex = new RegExp(name, 'i');
        let matchedStudents = await Student.find({ name: { $regex: nameRegex } }).limit(5).populate('classroom');
        io.emit('quick search', matchedStudents);
    });
});

//test

app.get('/flash', function (req, res) {
    // Set a flash message by passing the key, followed by the value, to req.flash().
    req.flash('info', 'Flash is back!')
    res.redirect('/');
});
function pushMessage (req, res, next) {
    res.locals.messages = req.flash();
    next();
}
// end test

http.listen(port, () => {
    console.log('Linh xinh dep da het doi <3');
    console.log('Server is running at ' + port);
});