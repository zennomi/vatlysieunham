const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let userId = mongoose.mongo.ObjectID('5f4471bbfb5aba08c0b119e9');
const studentSchema = new Schema({
    name: String,
    dob: {type: Date},
    classroom: { type: Schema.Types.ObjectId, ref: 'Classroom' },
    test_class: { type: Schema.Types.ObjectId, ref: 'Classroom' },
    id: {type: Number, index: true, unique: true},
    tags: [String],
    note: String,
    is_active: Boolean,
    created_at: {type: Date, default: '01/09/2020'},
    updated_at: {type: Date, default: '01/10/2020'},
    updated_by: {type: Schema.Types.ObjectId, ref: 'User', default: userId}
})
studentSchema.index({id: -1});
studentSchema.pre('save', (next) => {
    if(!this.updated_by){
      this.updated_by = new mongoose.Types.ObjectId("5f4471bbfb5aba08c0b119e9")
    }
    next();//important!
  });
studentSchema.methods.getName = function() {
    let nameArray = this.name.trim().split(' ');
    return nameArray[nameArray.length-1];
}
const Student = mongoose.model('Student', studentSchema);

module.exports = Student;

