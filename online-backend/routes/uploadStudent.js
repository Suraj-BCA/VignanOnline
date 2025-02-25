const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const fs = require("fs");
const Student = require("../models/Student");
const Course = require("../models/Course");

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/upload-students", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      console.log("❌ No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const courseId = req.body.courseId;
    if (!courseId) {
      console.log("❌ Course ID is required");
      return res.status(400).json({ error: "Course ID is required" });
    }

    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    console.log("📄 Excel Data:", data);

    // Process each row in the Excel sheet
    const savedStudents = [];
    for (const row of data) {
      try {
        const {
          firstName,
          lastName,
          email,
          phone,
          rollNumber,
          year,
          semester,
          password,
          dob,
          gender,
          fatherName,
          motherName,
          address,
        } = row;

        console.log("🔍 Processing Row:", row);

        // Validate required fields
        if (!email || !rollNumber) {
          console.log("❌ Missing required fields in row:", row);
          continue;
        }

        // Check if the student already exists
        const existingEmail = await Student.findOne({ email });
        const existingRollNumber = await Student.findOne({ rollNumber });

        if (existingEmail || existingRollNumber) {
          console.log("❌ Student with this email or roll number already exists:", row);
          continue;
        }

        // Create a new student
        const newStudent = new Student({
          firstName,
          lastName,
          email,
          phone,
          rollNumber,
          year,
          semester,
          password,
          joiningDate: new Date(), // Set joining date to the current date
          dob,
          gender,
          fatherName,
          motherName,
          address,
          course: courseId,
        });

        console.log("💾 Saving Student:", newStudent);

        // Save the student to the database
        await newStudent.save();
        savedStudents.push(newStudent);

        console.log("✅ Student Saved:", newStudent);
      } catch (rowError) {
        console.error("❌ Error Processing Row:", rowError.message);
      }
    }

    // Delete the uploaded file after processing
    fs.unlinkSync(filePath);

    // Send success response
    res.status(201).json({
      message: "✅ Students uploaded successfully!",
      savedStudents,
    });
  } catch (error) {
    console.error("🔥 Server Error:", error.message);
    res.status(500).json({ error: "Failed to upload students", details: error.message });
  }
});

module.exports = router;