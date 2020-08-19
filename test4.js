const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.connect('mongodb+srv://new-user_01:25112001@cluster0.nxm48.mongodb.net/sample_crud_students?retryWrites=true&w=majority', { useNewUrlParser: true });

const studentSchema = Schema({
    name: String,
    classroom: { type: Schema.Types.ObjectId, ref: 'Classroom' }
});
const classroomSchema = Schema({
    name: String
});

const Classroom = mongoose.model('Classroom', classroomSchema);
const Student = mongoose.model('Student', studentSchema);

Classroom.
    findOne({ name: '12A' }).
    exec((err, classroom) => {
        if (err) return console.log(err);
        var student1 = new Student({
            name: 'Nguyen Van B',
            classroom: classroom._id
        });
        student1.save((err, student) => {
            if (err) console.log(err);
            Student.
                findOne({ name: 'Nguyen Van B' }).
                populate('classroom').
                exec(function (err, student) {
                    if (err) return console.log(err);
                    console.log(student);
                });
        })
    })

