const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Course = require("../models/Course");
const subject = require("../models/Subject");
const multer = require('multer');

const mongoose = require("mongoose")

router.get("/all-students", async (req, res) => {
  try {
    console.log("Fetching students...");
    const students = await Student.find().populate("course");
    console.log("Students fetched:", students);

    if (!students) {
      return res.status(404).json({ error: "No students found" });
    }
    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error.message); // Log detailed error
    res
      .status(500)
      .json({ error: "Error fetching students", details: error.message });
  }
});


router.get('/students', async (req, res) => {
  const { courseId, courseName, year, semester } = req.query;

  // Validate query parameters
  if ((!courseId && !courseName) || !year || !semester) {
    return res.status(400).json({ error: 'Missing query parameters: courseId or courseName, year, and semester are required.' });
  }

  try {
    let course;
    if (courseId) {
      // Use courseId directly
      course = { _id: new mongoose.Types.ObjectId(courseId) };
    } else {
      // Find course by name
      course = await Course.findOne({ name: courseName });
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }
    }

    // Find students by course ID, year, and semester
    const students = await Student.find({
      course: course._id,
      year: parseInt(year),
      semester: parseInt(semester),
    });

    res.status(200).json({ students });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


const upload = multer({ dest: "uploads/" });

const storage = multer.diskStorage({
  destination: "./uploads/", // Folder where images will be stored
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
  },
});


router.put("/student-profile/:email", upload.single("image"), async (req, res) => {
  try {
    const { email } = req.params;
    let updateData = JSON.parse(req.body.studentData); // Get other profile fields

    // If an image was uploaded, update the image field
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`; // Save image path
    }

    // Update student in database
    const updatedStudent = await Student.findOneAndUpdate(
      { email },
      { $set: updateData },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(updatedStudent); // Return updated student data
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/student-dashboard/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { type } = req.query; // Read query param: `?type=image`

    const student = await Student.findOne({ email })
      .populate("course") // Fetch course details
      .populate("marks.subject") // Fetch subject names in marks
      .exec();

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 🔹 If `type=image`, return only the student's image URL
    if (type === "image") {
      return res.json({
        image: student.image
          ? `http://localhost:5000/uploads/${student.image.replace(/^\/uploads\//, "")}`
          : "/default-avatar.png",
      });
    }

    // 🔹 Default: Return full student data
    res.json(student);
  } catch (error) {
    console.error("❌ Error fetching student details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/student-profile/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // Populate course details
    const student = await Student.findOne({ email }).populate("course");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    console.error("❌ Error fetching student profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


router.get("/get-marks/:email/:year/:semester", async (req, res) => {
  try {
    const { email, year, semester } = req.params;

    // Find the student by email
    const student = await Student.findOne({ email })
      .populate({
        path: "marks.subject",
        model: "Subject", // Ensure this matches your Subject model name
      });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Find subjects for the selected year and semester
    const subjects = await subject.find({
      course: student.course,
      year: Number(year),
      semester: Number(semester),
    });

    // Map subjects to marks data
    const marksData = subjects.map((subject) => {
      // Find the corresponding marks entry for the subject
      const markEntry = student.marks.find(
        (mark) => mark.subject._id.toString() === subject._id.toString()
      );

      // Return the subject and scores
      return {
        subject: { name: subject.name },
        module1: markEntry?.module1 || { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0 },
        module2: markEntry?.module2 || { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0 },
        external: markEntry?.external || 0,
      };
    });

    console.log("Marks Data:", marksData); // Debugging
    res.json(marksData);
  } catch (error) {
    console.error("❌ Error fetching marks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/api/get-marks/:rollNumber/:year/:semester", async (req, res) => {
  try {
    const { rollNumber, year, semester } = req.params;

    console.log(`📢 Fetching marks for Roll ${rollNumber}, Year ${year}, Semester ${semester}`);

    // Find the student and populate the marks with subject details
    const student = await Student.findOne({ rollNumber }).populate({
      path: "marks.subject",
      model: "Subject", // ✅ Make sure it's linked to the Subject model
      select: "name year semester", // ✅ Only fetch needed fields
    });

    if (!student) {
      console.log("❌ Student not found.");
      return res.status(404).json({ error: "Student not found!" });
    }

    // ✅ Filter only marks where the subject matches the requested year & semester
    const filteredMarks = student.marks.filter(
      (mark) =>
        mark.subject && // Ensure subject exists
        mark.subject.year === parseInt(year) && // ✅ Filter by year
        mark.subject.semester === parseInt(semester) // ✅ Filter by semester
    );

    if (filteredMarks.length === 0) {
      console.log(`❌ No marks found for Year ${year}, Semester ${semester}`);
      return res.status(404).json({ error: "Marks not found for this semester!" });
    }

    console.log("📢 Marks Found:", filteredMarks);
    res.json(filteredMarks);
  } catch (error) {
    console.error("❌ Error fetching marks:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});





router.get("/student/:rollNumber", async (req, res) => {
  try {
    const { rollNumber } = req.params;
    const student = await Student.findOne({ rollNumber })
      .populate("course") // Populate course details
      .populate("marks.subject"); // Populate subject details

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/get-marks/:rollNumber/:year/:semester", async (req, res) => {
  try {
    const { rollNumber, year, semester } = req.params;

    const student = await Student.findOne({ rollNumber })
      .populate("marks.subject"); // Populate subject details

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Filter marks for the specified year and semester
    const marks = student.marks.filter(
      (mark) => mark.year === parseInt(year) && mark.semester === parseInt(semester)
    );

    res.status(200).json(marks);
  } catch (error) {
    console.error("Error fetching marks:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/grades", async (req, res) => {
  try {
    // Fetch all unique grades from the students' marks
    const grades = await Student.aggregate([
      { $unwind: "$marks" }, // Unwind the marks array
      { $group: { _id: "$marks.grade" } }, // Group by grade
      { $project: { _id: 0, grade: "$_id" } }, // Project only the grade field
    ]);

    // Extract grades from the result
    const gradeList = grades.map((g) => g.grade);

    res.status(200).json(gradeList);
  } catch (error) {
    console.error("❌ Error fetching grades:", error);
    res.status(500).json({ message: "Error fetching grades" });
  }
});


router.get("/students/grade/:grade", async (req, res) => {
  const { grade } = req.params;

  try {
    // Find students who have at least one subject with the specified grade
    const students = await Student.find({
      "marks.grade": grade,
    }).populate("marks.subject", "name"); // Populate subject details

    if (students.length === 0) {
      return res.status(404).json({ message: "No students found with this grade" });
    }

    res.status(200).json(students);
  } catch (error) {
    console.error("❌ Error fetching students by grade:", error);
    res.status(500).json({ message: "Error fetching students by grade" });
  }
});

router.post("/add-student", async (req, res) => {
  try {
    console.log("📥 Incoming Student Data:", req.body); 

    const {
      firstName,
      lastName,
      email,
      phone,
      rollNumber,
      courseId,
      year,
      semester,
      password,
      joiningDate,
      dob,
      gender,
      fatherName,
      motherName,
      address,
    } = req.body;

    if (!courseId) {
      console.log("❌ Missing Course ID");
      return res.status(400).json({ error: "Course ID is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      console.log("❌ Course not found for ID:", courseId);
      return res.status(404).json({ error: "Course not found" });
    }

    const existingEmail = await Student.findOne({ email });
    if (existingEmail) {
      console.log("❌ Student with this Email already exists!");
      return res
        .status(400)
        .json({ error: "Student with this Email already exists!" });
    }

    const existingStudent = await Student.findOne({ rollNumber });
    if (existingStudent) {
      console.log("❌ Student with this Roll Number already exists!");
      return res
        .status(400)
        .json({ error: "Student with this Roll Number already exists!" });
    }

    const newStudent = new Student({
      firstName,
      lastName,
      email,
      phone,
      rollNumber,
      year,
      semester,
      password,
      joiningDate,
      dob,
      gender,
      fatherName,
      motherName,
      address,
      course: courseId,
    });

    // Save the student to the database
    await newStudent.save();

    // Add the student to the course's students array
    await Course.findByIdAndUpdate(courseId, {
      $push: { students: newStudent._id },
    });

    // Send success response
    res
      .status(201)
      .json({ message: "✅ Student added successfully!", student: newStudent });
  } catch (error) {
    console.error("🔥 Server Error:", error.message);
    res
      .status(500)
      .json({ error: "Failed to add student", details: error.message });
  }
});


router.post("/upload-student", async (req, res) => {
  try {
    const students = req.body; // Excel se data aaya

    const errors = [];
    const savedStudents = [];

    for (const student of students) {
      const existingEmail = await Student.findOne({ email: student.email });
      const existingRoll = await Student.findOne({ rollNumber: student.rollNumber });

      if (existingEmail || existingRoll) {
        errors.push({
          email: student.email,
          rollNumber: student.rollNumber,
          error: "❌ Duplicate Entry",
        });
      } else {
        const newStudent = new Student(student);
        await newStudent.save();
        savedStudents.push(newStudent);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors, message: "❌ Some students were duplicates and not added." });
    }

    res.status(201).json({ message: "✅ Students uploaded successfully!", savedStudents });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/api/years", async (req, res) => {
  const { branch } = req.query;

  try {
    const years = await Student.distinct("year", { branch }); // Fetch distinct years for the selected branch
    res.status(200).json(years);
  } catch (error) {
    console.error("Error fetching years:", error);
    res.status(500).json({ message: "Failed to fetch years." });
  }
});

router.get("/api/branches", async (req, res) => {
  try {
    const branches = await branches.find({}, { name: 1 }); // Fetch only branch names
    res.status(200).json(branches);
  } catch (error) {
    console.error("Error fetching branches:", error);
    res.status(500).json({ message: "Failed to fetch branches." });
  }
});

router.get("/students-with-i-grade", async (req, res) => {
  const { branch, year, semester } = req.query;

  try {
    const students = await Student.aggregate([
      {
        $match: { branch, year: parseInt(year), semester: parseInt(semester) },
      },
      {
        $lookup: {
          from: "marks",
          localField: "rollNumber",
          foreignField: "rollNumber",
          as: "marks",
        },
      },
      {
        $unwind: "$marks",
      },
      {
        $match: {
          "marks.year": parseInt(year),
          "marks.semester": parseInt(semester),
          "marks.grade": "I",
        },
      },
      {
        $group: {
          _id: "$_id",
          rollNumber: { $first: "$rollNumber" },
          firstName: { $first: "$firstName" },
          lastName: { $first: "$lastName" },
          year: { $first: "$year" },
          semester: { $first: "$semester" },
          branch: { $first: "$branch" },
        },
      },
    ]);

    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students with 'I' grade:", error);
    res.status(500).json({ message: "Failed to fetch students." });
  }
});


router.get("/student/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("course", "name")
      .populate({ path: "marks.subject", select: "name" });

    console.log("✅ Student Data Sent:", student);
    res.json(student);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching student details",
      details: error.message,
    });
  }
});

router.put("/student/:id/marks", async (req, res) => {
  try {
    const { year, semester, marks } = req.body;
    console.log("🛠 Incoming Update Request:", JSON.stringify(req.body, null, 2));

    if (!year || !semester || !marks || !Array.isArray(marks)) {
      return res.status(400).json({ error: "Invalid request format" });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    if (!Array.isArray(student.marks)) {
      student.marks = [];
    }

    marks.forEach(({ subject, ...scores }) => {
      if (!subject || !mongoose.Types.ObjectId.isValid(subject)) {
        console.error("❌ Skipping invalid subject ID:", subject, scores);
        return;
      }

      const subjectId = new mongoose.Types.ObjectId(subject);
      console.log("📌 Searching for subjectId:", subjectId.toString());

      const existingMark = student.marks.find(
        (m) => m.subject && m.subject.toString() === subjectId.toString()
      );

      if (existingMark) {
        existingMark.scores = { ...existingMark.scores, ...scores };
      } else {
        student.marks.push({ subject: subjectId, scores });
      }
    });

    await student.save();
    res.json({ message: "Marks updated successfully", student });
  } catch (error) {
    console.error("❌ Error updating marks:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});




router.get("/add-student/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).populate("students");

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json({ students: course.students });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching students", details: error.message });
  }
});


router.get("/student/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("course", "name") // Fetch Course Name
      .populate({ path: "marks.subject", select: "name" }); // Fetch Subject Names

    if (!student) {
      return res.status(404).json({ message: "Student not found!" });
    }
    res.json(student);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching student details",
        details: error.message,
      });
  }
});

router.put("/update-student/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = req.body;

    // ✅ Ensure course is an ObjectId
    if (updateData.course && typeof updateData.course === "string") {
      const courseData = await Course.findOne({ name: updateData.course });
      if (courseData) {
        updateData.course = courseData._id; // Convert to ObjectId
      } else {
        return res.status(400).json({ error: "Invalid Course Name" });
      }
    }

    // Fetch the existing student document
    const existingStudent = await Student.findById(id);
    if (!existingStudent) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Preserve the marks array
    updateData.marks = existingStudent.marks;

    console.log("📝 Final Update Data:", updateData);

    // Update the student document
    const updatedStudent = await Student.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.json(updatedStudent);
  } catch (error) {
    console.error("🔥 Error updating student:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.delete("/delete-student/:id", async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);

    if (!deletedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Remove Student from Course
    await Course.findByIdAndUpdate(deletedStudent.course, {
      $pull: { students: deletedStudent._id },
    });

    res.json({ message: "Student deleted successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error deleting student", details: error.message });
  }
});


router.post("/student-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    if (student.password !== password) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    res.status(200).json({ message: "Login successful!", student });
  } catch (error) {
    console.error("🔥 Server Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/student-dashboard/:email", async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.params.email })
      .populate({
        path: "course",
        populate: { path: "subjects" }, // Populate subjects inside course
      });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({
      firstName: student.firstName,
      lastName: student.lastName,
      course: student.course,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});




router.post("/get-student", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const student = await Student.findOne({ email }).populate("course");

    if (!student) return res.status(404).json({ error: "Student not found" });

    res.json({ student, course: student.course });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch student data" });
  }
});


router.get("/all-students/:facultyId", async (req, res) => {
  try {
    const faculty = await faculty.findById(req.params.facultyId);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    const students = await students.find({ course: faculty.department });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});



router.post("/update-marks", async (req, res) => {
  try {
    const { branch, year, semester, subject, marks } = req.body;

    for (const rollNumber in marks) {
      await Student.updateOne(
        { rollNumber, branch, year, semester },
        { $set: { [`marks.${subject}`]: marks[rollNumber] } }
      );
    }

    res.json({ message: "Marks updated successfully" });
  } catch (error) {
    console.error("Error updating marks:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


router.get("/student/students", async (req, res) => {
  try {
    const { branch, year, semester } = req.query;
    
    if (!branch || !year || !semester) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const students = await Student.find({ branch, year, semester });

    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/student/update-marks", async (req, res) => {
  const { rollNumber, subject, module, scores, year, semester } = req.body;

  if (!rollNumber || !subject || !module || !scores || typeof scores !== "object" || !year || !semester) {
    return res.status(400).json({ message: "Missing or invalid required fields" });
  }

  try {
    // Find the student
    const student = await Student.findOne({ rollNumber });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find the index of the subject inside marks array for the specific year and semester
    const subjectIndex = student.marks.findIndex(
      (mark) => mark.subject.toString() === subject && mark.year === year && mark.semester === semester
    );

    if (subjectIndex === -1) {
      // If the subject is not found for the given year and semester, add a new entry
      const newMark = {
        subject,
        year,
        semester,
        module1: { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0 },
        module2: { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0 },
        external: 0,
      };

      // Update scores for the new subject
      if (module === "Module 1") {
        newMark.module1 = { ...newMark.module1, ...scores };
      } else if (module === "Module 2") {
        newMark.module2 = { ...newMark.module2, ...scores };
      } else if (module === "External") {
        newMark.external = scores.external || 0;
      }

      // Add the new mark to the marks array
      student.marks.push(newMark);
    } else {
      // Update the existing subject entry for the given year and semester
      if (module === "Module 1") {
        student.marks[subjectIndex].module1 = { ...student.marks[subjectIndex].module1, ...scores };
      } else if (module === "Module 2") {
        student.marks[subjectIndex].module2 = { ...student.marks[subjectIndex].module2, ...scores };
      } else if (module === "External") {
        student.marks[subjectIndex].external = scores.external || 0;
      }
    }

    // Save the updated marks
    await student.save();
    res.status(200).json({ message: "Marks updated successfully", student });

  } catch (error) {
    console.error("Error updating marks:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});


router.put("/update-marks", async (req, res) => {
  const { studentId, subjectId, year, semester, module1, module2, external } = req.body;

  try {
    // Find the student by ID
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Find the specific mark entry for the subject, year, and semester
    const mark = student.marks.find(
      (m) =>
        m.subject.toString() === subjectId &&
        m.year === year &&
        m.semester === semester
    );

    if (!mark) {
      return res.status(404).json({ error: "Mark entry not found" });
    }

    // Update marks
    if (module1) mark.module1 = module1;
    if (module2) mark.module2 = module2;
    if (external) mark.external = external;

    // Save the updated marks
    await student.save();

    // Calculate and save the grade
    await calculateAndSaveGrade(studentId, subjectId, year, semester);

    res.json({ message: "Marks and grade updated successfully" });
  } catch (error) {
    console.error("❌ Error updating marks:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/student-info", async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({
      name: student.name,
      course: student.course,
      year: student.year,
      semester: student.semester,
    });
  } catch (error) {
    console.error("Error fetching student info:", error);
    res.status(500).json({ error: "Server error" });
  }
});


// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// Upload Route for Excel File
router.post("/student/upload-marks", async (req, res) => {
  const { branch, year, semester, subject, marks } = req.body;

  // Validate input
  if (!branch || !year || !semester || !subject || !marks) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    // Update student marks for the given subject
    for (const rollNumber in marks) {
      const scores = marks[rollNumber];

      await Student.updateOne(
        { rollNumber, "marks.subject": subject },
        { $set: { "marks.$.scores": scores } }
      );
    }

    res.json({ message: "Marks uploaded successfully." });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Failed to upload marks." });
  }
});

router.get("/students/i-grade/:courseId", async (req, res) => {
  const { courseId } = req.params; // Get courseId from URL params

  try {
    // Validate courseId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ error: "Invalid course ID" });
    }

    // Fetch students with the specified courseId
    const students = await Student.find({ course: courseId })
      .populate("course", "name") // Populate the course name
      .populate("marks.subject", "name"); // Populate the subject name

    // Filter students with "I" grade in any subject
    const iGradeStudents = students.filter((student) =>
      student.marks.some((mark) => mark.grade === "I")
    );

    res.json(iGradeStudents);
  } catch (error) {
    console.error("Error fetching students with 'I' grade:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.put("/student/calculate-grade", async (req, res) => {
  const { studentId, subjectId, year, semester } = req.body;

  try {
    console.log("✅ Calculate Grade API hit");
    console.log("Received Data:", { studentId, subjectId, year, semester });

    const student = await Student.findById(studentId);
    if (!student) {
      console.log("❌ Student not found");
      return res.status(404).json({ error: "Student not found" });
    }

    const mark = student.marks.find(
      (m) =>
        m.subject.toString() === subjectId &&
        m.year === year &&
        m.semester === semester
    );

    console.log("🔍 Mark Entry:", mark);

    if (!mark) {
      console.log("❌ Mark entry not found");
      return res.status(404).json({ error: "Mark entry not found" });
    }

    // Retrieve module and external marks
    const module1 = mark.module1 || { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0 };
    const module2 = mark.module2 || { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0 };
    const external = mark.external || 0;

    console.log("📌 Module1:", module1);
    console.log("📌 Module2:", module2);
    console.log("📌 External Marks:", external);

    // Calculate internal marks
    const internalMarks =
      (module1.T1 + module1.T2 + module1.T3 + module1.T4 + module1.T5 +
       module2.T1 + module2.T2 + module2.T3 + module2.T4 + module2.T5) / 2;

    const totalMarks = internalMarks + external;

    console.log("📝 Internal Marks:", internalMarks);
    console.log("📝 Total Marks:", totalMarks);

    // Determine grade
    let grade = "I";
    if (totalMarks >= 95) grade = "O";
    else if (totalMarks >= 85) grade = "S";
    else if (totalMarks >= 80) grade = "A";
    else if (totalMarks >= 70) grade = "B";
    else if (totalMarks >= 60) grade = "C";
    else if (totalMarks >= 50) grade = "D";

    console.log("🎯 Calculated Grade:", grade);

    // Update grade
    mark.grade = grade;
    await student.save();

    res.json({ message: "Grade updated successfully", grade });
  } catch (error) {
    console.error("❌ Error updating grade:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




module.exports = router;
