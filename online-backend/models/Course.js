const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true , unique:true},
  description: { type: String, required: true },
  duration: { type: String, required: true },
  fees: { type: Number, required: true },
  image: { type: String },
  enquiryUrl: { type: String },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  
  subjects: [
    {
      year: Number,
      semester: Number,
      subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }]
    }
  ]
});

module.exports = mongoose.model("Course", CourseSchema);
