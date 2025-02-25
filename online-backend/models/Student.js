const Course = require("./Course");
const Subject = require("./Subject");

const mongoose = require("mongoose");


const StudentSchema = new mongoose.Schema({
  rollNumber: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  address: String,
  gender: String,
  dob: Date,
  fatherName: String,
  motherName: String,
  image: String,
  joiningDate: Date,
  password: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  year: { type: Number, required: true },
  semester: { type: Number, required: true },

  marks: [
    {
      subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
      year: { type: Number, required: true },
      semester: { type: Number, required: true },
      module1: {
        T1: { type: Number, default: 0 },
        T2: { type: Number, default: 0 },
        T3: { type: Number, default: 0 },
        T4: { type: Number, default: 0 },
        T5: { type: Number, default: 0 },
      },
      module2: {
        T1: { type: Number, default: 0 },
        T2: { type: Number, default: 0 },
        T3: { type: Number, default: 0 },
        T4: { type: Number, default: 0 },
        T5: { type: Number, default: 0 },
      },
      external: { type: Number, default: 0 },
      grade: { type: String, default: "I" }, // Add grade field
    },
  ],
});
const Student = mongoose.model("Student", StudentSchema);
module.exports = Student;
