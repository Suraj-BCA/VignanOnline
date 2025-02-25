require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require("body-parser");
const path = require("path");
const Student = require("./models/Student"); 

const app = express();
app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error:', err));






  app.get('/userprofile/:id', async (req, res) => {
      try {
        const userId = req.params.id;
        const user = await Student.findById(userId);
    
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        res.status(200).json(user);
      } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Error fetching user details' });
      }
    });


    app.get('/subjects/:year/:sem', async (req, res) => {
      try {
        const { year, sem } = req.params;
        console.log(`Fetching subjects for Year: ${year}, Semester: ${sem}`);
    
        const subjects = await Subject.find({ year, semester: sem });
    
        if (!subjects.length) {
          return res.status(404).json({ message: 'No subjects found for this semester' });
        }
    
        res.json(subjects);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        res.status(500).json({ message: 'Error fetching subjects', error: error.message });
      }
    });
    










app.use(cors()); 
app.use(bodyParser.json({ limit: "50mb" })); 








app.put("/edit-course/:id", async (req, res) => {
  const { name, duration, description, image } = req.body;

  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { name, duration, description, image },
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.status(200).json({ message: "Course updated successfully!", course: updatedCourse });
  } catch (err) {
    res.status(500).json({ error: "Error updating course", details: err.message });
  }
});

app.delete("/delete-course/:id", async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);

    if (!deletedCourse) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.status(200).json({ message: "Course deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting course", details: err.message });
  }
});

app.post('/enter-marks', async (req, res) => {
  try {
    const { studentId, courseId, semester, marks } = req.body;

    if (!studentId || !courseId || !semester || !marks) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    const totalMarks = marks.reduce((sum, subject) => {
      return sum + subject.T1 + subject.T2 + subject.T3 + subject.T4 + subject.T5 + subject.externalMarks;
    }, 0);

    const newMarksEntry = new Marks({
      studentId,
      courseId,
      semester,
      marks,
      total: totalMarks
    });

    await newMarksEntry.save();
    res.status(201).json({ message: 'Marks entered successfully!' });
  } catch (error) {
    console.error('Error entering marks:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

app.get('/get-marks/:studentId', async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const marks = await Marks.find({ studentId }).populate('courseId');

    if (!marks.length) {
      return res.status(404).json({ message: 'No marks found for this student' });
    }

    res.status(200).json(marks);
  } catch (error) {
    console.error('Error fetching marks:', error);
    res.status(500).json({ message: 'Error fetching marks' });
  }
});


app.get('/student-marks/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const marks = await Marks.find({ studentId }).populate('subjectId', 'name code');
    res.json(marks);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching marks' });
  }
});


app.put('/update-marks/:id', async (req, res) => {
  try {
    const { marks } = req.body;
    const id = req.params.id;

    const totalMarks = marks.reduce((sum, subject) => {
      return sum + subject.T1 + subject.T2 + subject.T3 + subject.T4 + subject.T5 + subject.externalMarks;
    }, 0);

    const updatedMarks = await Marks.findByIdAndUpdate(id, { marks, total: totalMarks }, { new: true });

    if (!updatedMarks) {
      return res.status(404).json({ message: 'Marks entry not found' });
    }

    res.json({ message: 'Marks updated successfully!', updatedMarks });
  } catch (error) {
    res.status(500).json({ message: 'Error updating marks' });
  }
});


app.delete('/delete-marks/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const deletedMarks = await Marks.findByIdAndDelete(id);

    if (!deletedMarks) {
      return res.status(404).json({ message: 'Marks entry not found' });
    }

    res.json({ message: 'Marks deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting marks' });
  }
});





app.post("/students", async (req, res) => {
  const student = new Student(req.body);
  await student.save();
  res.send(student);
});

app.get("/students/:courseId", async (req, res) => {
  const students = await Student.find({ course: req.params.courseId });
  res.send(students);
});

app.post("/subjects", async (req, res) => {
  const subject = new Subject(req.body);
  await subject.save();
  res.send(subject);
});



app.post("/marks", async (req, res) => {
  const marks = new Marks(req.body);
  await marks.save();
  res.send(marks);
});

app.get("/marks/:studentId", async (req, res) => {
  const marks = await Marks.find({ studentId: req.params.studentId }).populate("subjectId");
  res.send(marks);
});






app.get('/subjects/:courseId/:year/:semester', async (req, res) => {
  const { courseId, year, semester } = req.params;
  const subjects = await Subject.find({ course: courseId, year, semester });
  res.json(subjects);
});

// Add a new subject
app.post('/subjects', async (req, res) => {
  try {
    const subject = new Subject(req.body);
    await subject.save();
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: 'Error adding subject' });
  }
});

// Update marks
app.post('/marks', async (req, res) => {
  try {
    const marks = new Marks(req.body);
    await marks.save();
    res.status(201).json({ message: 'Marks added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding marks' });
  }
});



const dashboardRoutes = require("./routes/dashboardcount"); 
app.use("/", dashboardRoutes);


const uplodeRoutes = require("./routes/uploadStudent"); 
app.use("/", uplodeRoutes);


const studentRoutes = require("./routes/student"); 
app.use("/", studentRoutes);

const facultyRoutes = require("./routes/faculty"); 
app.use("/", facultyRoutes);

const attendanceRoutes = require("./routes/attendance");
app.use("/", attendanceRoutes);


const loginRoutes = require("./routes/login"); 
app.use("/", loginRoutes);

const userRoutes = require("./routes/register"); 
app.use("/", userRoutes);

const courseRoutes = require("./routes/courses"); 
app.use("/", courseRoutes);



const subjectRoutes = require("./routes/subject"); 
app.use("/", subjectRoutes);


const enquiryRoutes = require("./routes/enquiry"); 
app.use("/", enquiryRoutes);



const uploadRoutes = require("./routes/upload");
const multer = require('multer');
app.use(uploadRoutes);


const uploadSubjectRoutes = require("./routes/uploadSubjects"); 
app.use("/upload-subjects", uploadSubjectRoutes);

const UploadMarksRoutes = require("./routes/UploadMarks"); 
app.use("/", UploadMarksRoutes);



app.use("/uploads", express.static(path.join(__dirname, "uploads")));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
