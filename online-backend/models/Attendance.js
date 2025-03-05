const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  branch: { type: String, required: true }, 
  year: { type: String, required: true }, 
  semester: { type: String, required: true },
  date: { type: Date, required: true }, 
  attendance: [
    {
      rollNumber: { type: String, required: true }, 
      status: { type: String, enum: ["Present", "Absent"], required: true }, 
    },
  ],
});


module.exports = mongoose.model("Attendance", attendanceSchema);
