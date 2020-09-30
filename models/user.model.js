const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const actionSchema = new Schema({
    method: String,
    content: String,
    time: Date,
    _id : {id:false}
});

const userSchema = new Schema({
    username: {type: String, index: true, unique: true},
    password: String,
    role: {
        type: String,
        enum: ['admin', 'mod', 'teacher', 'tutor']
    },
    name: String,
    last_login: Date,
    note: String,
    action: [actionSchema]
})

userSchema.index({ username: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;