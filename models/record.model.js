const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    student_id: {type: Schema.Types.ObjectId, ref: 'Student'},
    finish_count: Number,
    note: String,
    _id : {id:false}
});

const recordSchema = new Schema({
    date: {
        type: Date,
        index: true
    },
    name: String,
    type: {
        type: String,
        enum: ['BTVN', 'KT15P', 'KT50P', 'TESTON', 'TESTOFF']
    },
    class: {type: Schema.Types.ObjectId, ref: 'Classroom'},
    total: {type: Number, default: 10},
    student: [studentSchema],
    link: String,
    note: String
});

recordSchema.methods.getDetailedDate = function () {
    let date = this.date;
    let day = date.getUTCDay();
    if (date.getUTCDay() != 0) {
        day = 'Thứ ' + (day+1)
    } else {
        day = 'Chủ nhật'
    }
    return `${day} ${date.toISOString().slice(8, 10)}/${date.toISOString().slice(5, 7)}`
}
recordSchema.methods.getNumberOfFilledStudent = function() {
    return this.student.filter(student => student.finish_count != null).length;
}
recordSchema.methods.getAverageMark = function() {
    let arrayOfMarks = this.student
        .filter(student => student.finish_count != null)
        .map(student => student.finish_count/this.total*10);
    return arrayOfMarks.reduce((a, b) => a+b, 0)/arrayOfMarks.length;
}
recordSchema.methods.getPieChartData = function() {
    let arrayOfMarks = this.student
        .filter(student => student.finish_count != null)
        .map(student => student.finish_count/this.total*10);
    return [
        arrayOfMarks.filter(mark => mark >=8).length,
        arrayOfMarks.filter(mark => (mark >=6 && mark <8)).length,
        arrayOfMarks.filter(mark => (mark >=4 && mark <6)).length,
        arrayOfMarks.filter(mark => (mark <4)).length,
        this.student.length - this.getNumberOfFilledStudent()
    ]
}
recordSchema.index({date: -1});

const Record = mongoose.model('Record', recordSchema, 'homeworks');

module.exports = Record;