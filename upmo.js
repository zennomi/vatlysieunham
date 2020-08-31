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

/* var students = ['Nguyễn Phan Anh', 'Hoàng Đức Anh', 'Phạm Hữu Duy Anh', 'Cù Minh Anh', 'Chu Bảo Ngọc', 'Nguyễn Hồng Phúc', 'Nguyễn Duy Anh', 'Nguyễn Hoàng Lâm', 'Lê Ngô Ngọc Minh', 'Nguyễn Mai Chi', 'Trần Hữu Nam Anh', 'Nguyẽn Hải Đức', 'Đặng Minh Đạt', 'Nguyễn Duy Anh', 'Phan Ngân Hà', 'Hồ Thái Đức', 'Tạ Hồng Phong', 'Mai Lan Nhi', 'Nguyễn Đức Huy', 'Trần Hữu Trí', 'Phạm Yến Nhi', 'Bùi Đức Phúc', 'Đào Vũ Thanh Phương', 'Hoàng Anh Tuấn', 'Ngô Minh Đức', 'Nguyễn Phúc Quỳnh Nhi', 'Trịnh Minh Nhật', 'Nguyễn Trọng Kiên'];
students = students.map((ele,i) => {
    return {
        'name': ele,
        id: i+248,
        classroom: '5f428c699dec1050bea1d3d5'
    }
})

console.log(students)

for (let i=0; i < students.length; i++) {
    let student = new Student({
        name: students[i].name,
        id: students[i].id,
        classroom: '5f428c699dec1050bea1d3d5'
    });
    student.save((err, result) => {
        console.log(result)
    });
} */

Lesson.updateMany({grade: 5}, {
    $set: {rating: 5},
    $unset: {grade: ''}
})
.exec((err, result) => {console.log(result)});