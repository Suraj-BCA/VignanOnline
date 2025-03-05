const mongoose = require("mongoose");

const registeredStudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  otp: { type: String },
  otpExpires: { type: Date },
});

module.exports = mongoose.model("RegisteredStudent", registeredStudentSchema);
