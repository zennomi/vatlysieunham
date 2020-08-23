const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://new-user_01:25112001@cluster0.nxm48.mongodb.net/vlsn_2020?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}).then(() => {
    console.log('Connected to MongoDB Alas.');
}).catch((err) => {
    console.log('Error occurred connecting to MongoDB Alas');
});
const Classroom = require('./models/class.model');
const Student = require('./models/student.model');
const Lesson = require('./models/lesson.model');

var students = ['Nguyễn Minh Hằng', 'Vũ Tuấn Phát', 'Nguyễn Minh Khang', 'Nguyễn Đức Nam', 'Trịnh Gia Hưng', 'Phùng Thế Vinh', 'Lê Trí Đức', 'Ngô Lam Phương', 'Lê Xuân Nhi', 'Lê Anh Huy', 'Phạm Công Ngọc Lam', 'Nguyễn Đức Anh', 'Lê Hoàng An', 'Vũ Ngọc Nhi', 'Nguyễ Hoàng Hải My', 'Cao Thế Phương', 'Bạch Long Hải', 'Vũ Đức Quang', 'Hoàng Minh Kiên', 'Vương Mỹ Anh Anh'];
students = students.map((ele,i) => {
    return {
        'name': ele,
        id: i+178,
        classroom: '5f428ca39dec1050bea1d3d6'
    }
})

console.log(students)

for (let i=0; i < students.length; i++) {
    let student = new Student({
        name: students[i].name,
        id: students[i].id,
        classroom: '5f428ca39dec1050bea1d3d6'
    });
    student.save((err, result) => {
        console.log(result)
    });
}