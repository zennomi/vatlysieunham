const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');

var studentRoute = require('./routers/student.route');
var classRoute = require('./routers/class.route');

app.set('views', './views');
app.set('view engine', 'pug');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.render('index');
});

app.use('/students', studentRoute);
app.use('/classes', classRoute);

app.listen(port, () => {
    console.log('Server is running at ' + port);
});