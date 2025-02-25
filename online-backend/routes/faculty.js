const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Faculty = require("../models/Faculty");
const Course = require('../models/Course');




router.post("/add-faculty", async (req, res) => {
    try {
      const newFaculty = new Faculty({
        ...req.body,
        experience: parseInt(req.body.experience),
        joiningDate: new Date(req.body.joiningDate),
      });
  
      await newFaculty.save();
      res.status(201).json({ message: "Faculty added successfully!" });
    } catch (error) {
      res.status(500).json({ error: "Error adding faculty" });
    }
  });
  
  
  router.get('/all-faculty', async (req, res) => {
    try {
      const faculty = await Faculty.find();
      res.json(faculty);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching faculty data' });
    }
  });
  
  
  router.put('/update-faculty/:id', async (req, res) => {
    try {
      await Faculty.findByIdAndUpdate(req.params.id, req.body);
      res.json({ message: 'Faculty updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error updating faculty' });
    }
  });
  
  
  router.delete('/delete-faculty/:id', async (req, res) => {
    try {
      await Faculty.findByIdAndDelete(req.params.id);
      res.json({ message: 'Faculty deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting faculty' });
    }
  });
  


  router.get("/all-students/:facultyId", async (req, res) => {
    try {
      const faculty = await Faculty.findById(req.params.facultyId);
      if (!faculty) {
        return res.status(404).json({ message: "Faculty not found" });
      }
  
      const students = await students.find({ course: faculty.department });
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Server Error", error });
    }
  });
  

  router.get("/faculty-details", async (req, res) => {
    try {
      const faculty = await Faculty.findOne(); // Fetch first faculty
      if (!faculty) {
        return res.status(404).json({ message: "Faculty not found" });
      }
      res.json({ 
        name: `${faculty.firstName} ${faculty.lastName}`, 
        branch: faculty.department 
      });
    } catch (error) {
      console.error("Error fetching faculty details:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // 📌 Faculty ke assigned courses fetch karna
router.get("/faculty-courses/:facultyId", async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.facultyId).populate(
      "assignedCourses"
    );
    if (!faculty) return res.status(404).json({ error: "Faculty not found" });
    res.json(faculty.assignedCourses);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 Selected Course ke available years fetch karna
router.get("/course-years/:courseId", async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const availableYears = [...new Set(course.subjects.map((s) => s.year))];
    res.json(availableYears);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 Selected Year ke available semesters fetch karna
router.get("/course-semesters/:courseId/:year", async (req, res) => {
  try {
    const { courseId, year } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const availableSemesters = [
      ...new Set(
        course.subjects
          .filter((s) => s.year == year)
          .map((s) => s.semester)
      ),
    ];
    res.json(availableSemesters);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 Selected Semester ke available subjects fetch karna
router.get("/course-subjects/:courseId/:year/:semester", async (req, res) => {
  try {
    const { courseId, year, semester } = req.params;
    const course = await Course.findById(courseId).populate("subjects.subjects");
    if (!course) return res.status(404).json({ error: "Course not found" });

    const subjects = course.subjects
      .filter((s) => s.year == year && s.semester == semester)
      .flatMap((s) => s.subjects);

    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});



router.post('/faculty-login', async (req, res) => {
  const { email, password } = req.body;

  try {
      const faculty = await Faculty.findOne({ email });

      if (!faculty) {
          return res.status(404).json({ message: 'Faculty not found' });
      }

      // Direct string comparison since no hashing is used
      if (faculty.password !== password) {
          return res.status(400).json({ message: 'Invalid credentials' });
      }

      res.json({ message: 'Faculty login successful', faculty });
  } catch (error) {
      res.status(500).json({ message: 'Server error' });
  }
});

  
  
module.exports = router;  