const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://new-user_01:25112001@cluster0.nxm48.mongodb.net/sample_crud_students?retryWrites=true&w=majority', {
    useNewUrlParser: true
}).then(() => {
    console.log('Connected to MongoDB Alas.');
}).catch((err) => {
    console.log('Error occurred connecting to MongoDB Alas');
});

/* const Student = require('./models/student.model');

function quickSearch() {
  let name = document.querySelector("input#input-search").value;
  console.log(name);
  let nameRegex = new RegExp(name, 'i');
  Student.find({ name: {$regex: nameRegex} }).populate('classroom').exec((err, student) => {
    console.log(student);
  });
} */