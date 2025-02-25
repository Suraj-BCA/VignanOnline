const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const fs = require("fs");
const Subject = require("../models/Subject");
const Course = require("../models/Course");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/", upload.single("file"), async (req, res) => {
  console.log("📥 Received File:", req.file ? req.file.filename : "❌ No file received!");
  console.log("📥 Received Body:", req.body);

  if (!req.file) {
    return res.status(400).json({ message: "❌ No file uploaded" });
  }
  if (!req.body.course) {
    return res.status(400).json({ message: "❌ Course ID is missing" });
  }

  const courseId = req.body.course;
  const filePath = req.file.path;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      fs.unlinkSync(filePath);
      return res.status(404).json({ message: "❌ Course not found" });
    }

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!Array.isArray(data) || data.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: "❌ Uploaded Excel file is empty" });
    }

    const subjects = await Subject.insertMany(
      data.map((row) => ({
        name: row.name.trim(),
        code: row.code.trim(),
        year: parseInt(row.year),
        semester: parseInt(row.semester),
        course: courseId,
      })),
      { ordered: false }
    );

    for (const subject of subjects) {
      const existingGroup = course.subjects.find(
        (g) => g.year === subject.year && g.semester === subject.semester
      );

      if (existingGroup) {
        existingGroup.subjects.push(subject._id);
      } else {
        course.subjects.push({ year: subject.year, semester: subject.semester, subjects: [subject._id] });
      }
    }

    await course.save();
    fs.unlinkSync(filePath);

    res.json({
      message: "✅ Subjects uploaded and linked to course successfully!",
      subjects,
    });
  } catch (error) {
    console.error("❌ Error processing file:", error);
    res.status(500).json({ message: "❌ Server error", error: error.message });
  }
});

module.exports = router;
