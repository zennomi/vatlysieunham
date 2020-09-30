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
    class: [{type: Schema.Types.ObjectId, ref: 'Classroom'}],
    link: String
});

const Period = mongoose.model('Period', periodSchema);

module.exports = Period;

