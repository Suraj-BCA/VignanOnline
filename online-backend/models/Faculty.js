const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    facultyId: String,
    department: String,
    designation: String,
    joiningDate: Date,
    password: String,
  });
  
  const Faculty = mongoose.model("Faculty", FacultySchema);

  module.exports = Faculty;






 