const mongoose = require('mongoose');
const Subject = require('./models/Subject');
require('dotenv').config();


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error:', err));


const subjects = [
  // Year 1 - Semester 1
  { name: 'Programming in C', code: 'BCA101', year: 1, semester: 1 },
  { name: 'Mathematics for Computing', code: 'BCA102', year: 1, semester: 1 },
  { name: 'Digital Logic and Computer Organization', code: 'BCA103', year: 1, semester: 1 },
  { name: 'Web Technologies', code: 'BCA104', year: 1, semester: 1 },
  { name: 'Computer Fundamentals and Office Automation', code: 'BCA105', year: 1, semester: 1 },
  { name: 'Communication Skills', code: 'BCA106', year: 1, semester: 1 },

  // Year 1 - Semester 2
  { name: 'Object-Oriented Programming with C++', code: 'BCA201', year: 1, semester: 2 },
  { name: 'Database Management Systems', code: 'BCA202', year: 1, semester: 2 },
  { name: 'Operating Systems', code: 'BCA203', year: 1, semester: 2 },
  { name: 'Discrete Mathematics', code: 'BCA204', year: 1, semester: 2 },
  { name: 'Python Programming', code: 'BCA205', year: 1, semester: 2 },
  { name: 'Business Communication', code: 'BCA206', year: 1, semester: 2 },

  // Year 2 - Semester 3
  { name: 'Data Structures and Algorithms', code: 'BCA301', year: 2, semester: 3 },
  { name: 'Software Engineering', code: 'BCA302', year: 2, semester: 3 },
  { name: 'Java Programming', code: 'BCA303', year: 2, semester: 3 },
  { name: 'Computer Networks', code: 'BCA304', year: 2, semester: 3 },
  { name: 'Linux & Shell Programming', code: 'BCA305', year: 2, semester: 3 },
  { name: 'Probability and Statistics', code: 'BCA306', year: 2, semester: 3 },

  // Year 2 - Semester 4
  { name: 'Advanced Java & J2EE', code: 'BCA401', year: 2, semester: 4 },
  { name: 'Design & Analysis of Algorithms', code: 'BCA402', year: 2, semester: 4 },
  { name: 'AI & Machine Learning', code: 'BCA403', year: 2, semester: 4 },
  { name: 'Cloud Computing', code: 'BCA404', year: 2, semester: 4 },
  { name: 'Software Testing', code: 'BCA405', year: 2, semester: 4 },
  { name: 'Introduction to Data Science', code: 'BCA406', year: 2, semester: 4 },

  // Year 3 - Semester 5
  { name: 'Web Application Development', code: 'BCA501', year: 3, semester: 5 },
  { name: 'Mobile Application Development', code: 'BCA502', year: 3, semester: 5 },
  { name: 'Data Mining & Warehousing', code: 'BCA503', year: 3, semester: 5 },
  { name: 'Internet of Things', code: 'BCA504', year: 3, semester: 5 },
  { name: 'Cybersecurity', code: 'BCA505', year: 3, semester: 5 },
  { name: 'Big Data Analytics', code: 'BCA506', year: 3, semester: 5 },

  // Year 3 - Semester 6
  { name: 'ML with Python', code: 'BCA601', year: 3, semester: 6 },
  { name: 'Blockchain Technology', code: 'BCA602', year: 3, semester: 6 },
  { name: 'DevOps & Cloud Deployment', code: 'BCA603', year: 3, semester: 6 },
  { name: 'Project Management', code: 'BCA604', year: 3, semester: 6 },
  { name: 'Full-Stack Development', code: 'BCA605', year: 3, semester: 6 },
  { name: 'Final Year Project', code: 'BCA606', year: 3, semester: 6 },
];

// Insert subjects into the database
Subject.insertMany(subjects)
  .then(() => {
    console.log('✅ All BCA subjects inserted successfully!');
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error('❌ Error inserting subjects:', err);
    mongoose.disconnect();
  });
