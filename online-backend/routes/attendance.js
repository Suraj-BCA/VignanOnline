const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");

router.post("/save", async (req, res) => {
  try {
    const { branch, year, semester, date, attendance } = req.body;

    if (!branch || !year || !semester || !date || !attendance.length) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const existingAttendance = await Attendance.findOne({ branch, year, semester, date });

    if (existingAttendance) {
      existingAttendance.attendance = attendance;
      await existingAttendance.save();
      return res.json({ message: "Attendance updated successfully." });
    }

    const newAttendance = new Attendance({ branch, year, semester, date, attendance });
    await newAttendance.save();
    res.json({ message: "Attendance saved successfully." });

  } catch (error) {
    console.error("Error saving attendance:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

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

  console.log("Query Parameters:", { branch, year, semester, rollNumber });

  if (!branch || !year || !semester || !rollNumber) {
    return res.status(400).json({ error: "Branch, year, semester, and rollNumber are required." });
  }

  try {
    const attendanceRecords = await Attendance.find({ branch, year, semester });

    console.log("Attendance Records:", attendanceRecords);

    if (!attendanceRecords.length) {
      return res.status(404).json({ message: "No attendance records found." });
    }

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

    console.log("Total Classes:", totalClasses);
    console.log("Attended Classes:", attendedClasses);

    const attendancePercentage = totalClasses > 0 ? ((attendedClasses / totalClasses) * 100).toFixed(2) : 0;

    console.log("Attendance Percentage:", attendancePercentage);

    res.json({ percentage: attendancePercentage });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
