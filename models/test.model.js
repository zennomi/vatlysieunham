const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const testSchema = new Schema({
    date: {
        type: Date,
        index: true
    },
    name: String,
    note: String,
    link: String,
    total: {type: Number, default: 10},
    student: [{
        student_id: {type: Schema.Types.ObjectId, ref: 'Student'},
        mark: Number,
        note: String
    }]
});

testSchema.methods.getDetailedDate = function () {
    let date = new Date(this.date);
    if (date.getUTCDay() != 0) {
        day = 'Thứ ' + (day+1)
    } else {
        day = 'Chủ nhật'
    }
    return `${this.date.slice(8,10)}/${this.date.slice(5,7)} ${day}`
}
testSchema.index({date: -1});

const Test = mongoose.model('Test', testSchema);

module.exports = Test;