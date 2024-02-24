const mongoose = require('mongoose');
const url = "mongodb+srv://admin:7g23RyNaECkvuxJ3@cluster0.tlbv1gv.mongodb.net/course";

mongoose.connect(url).then(() => {
  console.log("Mongoose has been connected");
}).catch((err) => {
  console.error('Unable to connect Mongoose:', err);
});

const adminSchema = new mongoose.Schema({
  username: String,
  password: String
});

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  imageLink: String,
  adminId: String,
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  courseId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  }]
});

const Admin = mongoose.model('admin', adminSchema);
const Course = mongoose.model('Courses', courseSchema);
const User = mongoose.model('Users', userSchema);

module.exports = {
  Admin,
  Course,
  User
};

