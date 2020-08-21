const express = require('express');
const app = express();
const http = require('http').Server(app);
const port = process.env.PORT || 3000;

var io = require('socket.io')(http);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://new-user_01:25112001@cluster0.nxm48.mongodb.net/sample_crud_students?retryWrites=true&w=majority', {
    useNewUrlParser: true
}).then(() => {
    console.log('Connected to MongoDB Alas.');
}).catch((err) => {
    console.log('Error occurred connecting to MongoDB Alas');
});

const Student = require('./models/student.model');
const Classroom = require('./models/class.model');
const Lesson = require('./models/lesson.model');

var studentRoute = require('./routers/student.route');
var classRoute = require('./routers/class.route');
var lessonRoute = require('./routers/lesson.route');

app.set('views', './views');
app.set('view engine', 'pug');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
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