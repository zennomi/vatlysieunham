const express = require('express');
const app = express();

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

var studentRoute = require('./routers/student.route');
var classRoute = require('./routers/class.route');
var lessonRoute = require('./routers/lesson.route');

app.set('views', './views');
app.set('view engine', 'pug');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.render('index');
});

app.use('/students', studentRoute);
app.use('/classes', classRoute);
app.use('/lessons', lessonRoute);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Server is running at ' + port);
});