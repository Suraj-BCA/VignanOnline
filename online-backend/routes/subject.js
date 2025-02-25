const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const Subject = require("../models/Subject");

router.post("/add-subject", async (req, res) => {
  try {
    const { name, code, year, semester, course } = req.body;

    if (!name || !code || !year || !semester || !course) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    // ✅ Ensure Course Exists
    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({ error: "Course not found!" });
    }

    const newSubject = new Subject({ name, code, year, semester, course });
    await newSubject.save();

    // ✅ Add Subject to the Correct Course & Semester
    await Course.findByIdAndUpdate(course, {
      $push: { subjects: { year, semester, subjects: newSubject._id } },
    });

    res.json({ message: "Subject added successfully!", subject: newSubject });
  } catch (error) {
    console.error("Error adding subject:", error);
    res.status(500).json({ error: "Error adding subject" });
  }
});


// router.post("/upload-subjects", async (req, res) => {
//   try {
//     console.log("Received Data:", req.body); // Debugging
//     // Your logic for handling the subject upload
//     res.status(200).json({ message: "Subjects uploaded successfully" });
//   } catch (error) {
//     console.error("Error in /upload-subjects:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });



router.get("/subjects", async (req, res) => {
  try {
    const { branch, year, semester } = req.query;

    if (!branch || !year || !semester) {
      console.error("❌ Missing required parameters:", { branch, year, semester });
      return res.status(400).json({ error: "Missing parameters" });
    }

    console.log(`🔍 Fetching Course ID for: Branch=${branch}`);

    // Find Course by Name
    const course = await Course.findOne({ name: branch });
    if (!course) {
      console.warn(`⚠️ No course found with name: ${branch}`);
      return res.status(404).json({ error: "Course not found" });
    }

    console.log(`✅ Course Found: ${course.name} (ID: ${course._id})`);

    // Convert year & semester to numbers
    const yearNum = parseInt(year);
    const semesterNum = parseInt(semester);

    if (isNaN(yearNum) || isNaN(semesterNum)) {
      console.error("❌ Invalid year or semester values:", { year, semester });
      return res.status(400).json({ error: "Year and Semester must be numbers" });
    }

    // Fetch Subjects that match Course ID, Year, and Semester
    const subjects = await Subject.find({
      course: course._id, // Now using ObjectId reference
      year: yearNum,
      semester: semesterNum
    });

    console.log("✅ Found Subjects:", subjects);

    if (subjects.length === 0) {
      console.warn("⚠️ No subjects found for this selection.");
    }

    res.json(subjects);
  } catch (error) {
    console.error("❌ Error fetching subjects:", error);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});




router.get("/:id/subjects", async (req, res) => {
  try {
    const { year, semester } = req.query;
    const subjects = await Subject.find({
      course: req.params.id,  // ✅ Match course ID
      year: Number(year),      // ✅ Match year
      semester: Number(semester) // ✅ Match semester
    });

    if (subjects.length === 0) {
      return res.status(404).json({ message: "No subjects found." });
    }

    res.json(subjects);
  } catch (error) {
    console.error("❌ Error fetching subjects:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/subjects/:id", async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    res.json(subject);
  } catch (error) {
    console.error("❌ Error fetching subject:", error);
    res.status(500).json({ error: "Server error" });
  }
});



module.exports = router;


