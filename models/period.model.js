const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const periodSchema = new Schema({
    date: {
        type: Date,
        index: true
    },
    type: {
        type: String,
        enum: ['LEARN', 'TEST']
    },
    instructor: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    name: String,
    note: String,
    class: {type: Schema.Types.ObjectId, ref: 'Classroom'},
    link: String
});
periodSchema.methods.getDetailedDate = function () {
    let date = this.date;
    let day = date.getUTCDay();
    if (date.getUTCDay() != 0) {
        day = 'Thứ ' + (day+1)
    } else {
        day = 'Chủ nhật'
    }
    return `${date.toISOString().slice(5,7)}/${date.toISOString().slice(8,10)} ${day}`
}
const Period = mongoose.model('Period', periodSchema);

module.exports = Period;

