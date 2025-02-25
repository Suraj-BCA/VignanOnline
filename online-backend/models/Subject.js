const Course = require("./Course");
const Subject = require("./Subject");

const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  year: Number,
  semester: Number,
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" }
});

module.exports = mongoose.model("Subject", SubjectSchema);
