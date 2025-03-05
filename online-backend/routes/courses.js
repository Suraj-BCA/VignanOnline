const express = require('express');
const router = express.Router();
const Course = require('../models/Course');  

router.get("/courses/:courseId/years-and-semesters", async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const years = [...new Set(course.subjects.map((s) => s.year))]; // Unique years
    const semesters = [...new Set(course.subjects.map((s) => s.semester))]; // Unique semesters

    res.json({ years, semesters });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/courses/:courseId/subjects", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { year, semester } = req.query;

    console.log("Fetching subjects for:", { courseId, year, semester }); // Debugging

    const course = await Course.findById(courseId).populate("subjects.subjects");

    if (!course) return res.status(404).json({ message: "Course not found" });

    console.log("Course found:", course); // Debugging

    const subjectsForSemester = course.subjects.filter(
      (entry) => entry.year == year && entry.semester == semester
    );

    console.log("Subjects for semester:", subjectsForSemester); // Debugging

    if (subjectsForSemester.length === 0) {
      return res.json({ subjects: [] });
    }

    const allSubjects = subjectsForSemester.flatMap((entry) => entry.subjects);
    res.json({ subjects: allSubjects });
  } catch (error) {
    console.error("Error fetching subjects:", error); // Debugging
    res.status(500).json({ error: error.message });
  }
});

router.get("/courses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📌 Fetching Course ID:", id);
    
    const course = await Course.findById(id); 

    if (!course) {
      return res.status(404).json({ error: "Course not found" }); 
    }

    res.json(course);
  } catch (error) {
    console.error("❌ Error fetching course:", error);
    res.status(500).json({ error: "Server error" }); 
  }
});

router.post("/courses", async (req, res) => {
  try {
    console.log("📥 Incoming Course Data:", req.body); 

    const { name, description } = req.body; 
    if (!name) {
      return res.status(400).json({ error: "Course name is required" });
    }

    const newCourse = new Course({ name, description }); 
    await newCourse.save(); 

    res.status(201).json({ message: "Course added successfully!", course: newCourse });
  } catch (error) {
    console.error("🔥 Server Error:", error.message);
    res.status(500).json({ error: "Failed to add course", details: error.message });
  }
});

router.post("/add-course", async (req, res) => {
  console.log("🛠️ Received Course Data:", req.body); 

  try {
    const newCourse = new Course(req.body);
    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (error) {
    console.error("🔥 Server Error:", error);
    res.status(400).json({ error: "Failed to add course", details: error.message });
  }
});

router.get('/courses', async (req, res) => {
  try {
    
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching courses', error });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description, duration, fees, image,enquiryUrl } = req.body;
    const newCourse = new Course({ name, description, duration, fees, image ,enquiryUrl});
    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(400).json({ message: 'Error adding course', error });
  }
});

router.put("/courses/:id", async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCourse) return res.status(404).json({ error: "Course not found" });
    res.json(updatedCourse);
  } catch (error) {
    res.status(400).json({ error: "Failed to update course", details: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting course', error });
  }
});

router.get("/course-details/:courseId", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate("subjects");

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json({
      _id: course._id,
      name: course.name,
      image: course.image,
      description: course.description,
      subjects: course.subjects,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

module.exports = router;
