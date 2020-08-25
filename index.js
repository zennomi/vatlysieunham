require('dotenv').config();

const express = require('express');
const app = express();
const http = require('http').Server(app);
const port = process.env.PORT || 3000;

var io = require('socket.io')(http);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://new-user_01:25112001@cluster0.nxm48.mongodb.net/vlsn_2020?retryWrites=true&w=majority',{
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

app.get('/', async (req, res) => {
    let numStudents = await Student.countDocuments();
    let numClasses = await Classroom.countDocuments();
    let numLessons = await Lesson.countDocuments();
    res.render('index', {
        numStudents: numStudents,
        numClasses: numClasses,
        numLessons: numLessons
    });
});

app.use('/students', studentRoute);
app.use('/classes', classRoute);
app.use('/lessons', lessonRoute);
app.use('/auth', authRoute);

io.on('connection', (socket) => {
    socket.on('quick search', async function (name) {
        let nameRegex = new RegExp(name, 'i');
        let matchedStudents = await Student.find({ name: {$regex: nameRegex} }).limit(5).populate('classroom');
        io.emit('quick search', matchedStudents);
    });
});


http.listen(port, () => {
    console.log('Linh xinh dep da het doi <3');
    console.log('Server is running at ' + port);
});