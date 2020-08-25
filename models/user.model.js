const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {type: String, index: true, unique: true},
    password: String,
    last_login: Date
})

userSchema.index({ name: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;