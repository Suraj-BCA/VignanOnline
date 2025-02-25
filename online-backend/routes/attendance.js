const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");

// 📌 Save Attendance
router.post("/save", async (req, res) => {
  try {
    const { branch, year, semester, date, attendance } = req.body;

    if (!branch || !year || !semester || !date || !attendance.length) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findOne({ branch, year, semester, date });

    if (existingAttendance) {
      existingAttendance.attendance = attendance;
      await existingAttendance.save();
      return res.json({ message: "Attendance updated successfully." });
    }

    // Save new attendance record
    const newAttendance = new Attendance({ branch, year, semester, date, attendance });
    await newAttendance.save();
    res.json({ message: "Attendance saved successfully." });

  } catch (error) {
    console.error("Error saving attendance:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 📌 Get Attendance by Branch, Year, Semester & Date
router.get("/fetch", async (req, res) => {
  try {
    const { branch, year, semester, date } = req.query;

    if (!branch || !year || !semester || !date) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const attendanceRecord = await Attendance.findOne({ branch, year, semester, date });

    if (!attendanceRecord) {
      return res.status(404).json({ message: "No attendance found for this date." });
    }

    res.json(attendanceRecord);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/student-attendance", async (req, res) => {
  const { branch, year, semester, rollNumber } = req.query;

  console.log("Query Parameters:", { branch, year, semester, rollNumber }); // Debugging

  if (!branch || !year || !semester || !rollNumber) {
    return res.status(400).json({ error: "Branch, year, semester, and rollNumber are required." });
  }

  try {
    // Fetch all attendance records for the student's branch, year, and semester
    const attendanceRecords = await Attendance.find({ branch, year, semester });

    console.log("Attendance Records:", attendanceRecords); // Debugging

    if (!attendanceRecords.length) {
      return res.status(404).json({ message: "No attendance records found." });
    }

    // Calculate total classes and attended classes for the student
    let totalClasses = 0;
    let attendedClasses = 0;

    attendanceRecords.forEach((record) => {
      const studentAttendance = record.attendance.find(
        (att) => att.rollNumber === rollNumber
      );
      if (studentAttendance) {
        totalClasses++;
        if (studentAttendance.status === "Present") {
          attendedClasses++;
        }
      }
    });

    console.log("Total Classes:", totalClasses); // Debugging
    console.log("Attended Classes:", attendedClasses); // Debugging

    // Calculate attendance percentage
    const attendancePercentage = totalClasses > 0 ? ((attendedClasses / totalClasses) * 100).toFixed(2) : 0;

    console.log("Attendance Percentage:", attendancePercentage); // Debugging

    res.json({ percentage: attendancePercentage });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
