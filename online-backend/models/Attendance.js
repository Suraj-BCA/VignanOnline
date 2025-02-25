const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  branch: { type: String, required: true }, // BCA
  year: { type: String, required: true }, // 1, 2, or 3
  semester: { type: String, required: true }, // 1 or 2
  date: { type: Date, required: true }, // Use Date instead of String
  attendance: [
    {
      rollNumber: { type: String, required: true }, // Student's roll number
      status: { type: String, enum: ["Present", "Absent"], required: true }, // Attendance status
    },
  ],
});


module.exports = mongoose.model("Attendance", attendanceSchema);
