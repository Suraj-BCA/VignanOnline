const express = require("express");
const router = express.Router();
const User = require("../models/User");
// const Student = require('../models/Student');

router.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required!" });
    }

    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password!" });
    }

    res.status(200).json({ message: "Login successful!" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in user", error });
  }
});

// router.post("/student-login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const student = await student.findOne({ email });

//     if (!student) {
//       return res.status(404).json({ error: "Student not found" });
//     }

//     if (student.password !== password) {
//       return res.status(400).json({ error: "Incorrect password" });
//     }

//     // Generate a token (you can use JWT or any other method)
//     const token = generateToken(student);  // Implement this function

//     res.status(200).json({ message: "Login successful!", student, token });
//   } catch (error) {
//     console.error("🔥 Server Error:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

module.exports = router;
