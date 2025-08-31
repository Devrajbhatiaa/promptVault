const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017');
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  username: String,
  age: Number,
  post:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"post"
  }]
})

module.exports = mongoose.model('user', userSchema);