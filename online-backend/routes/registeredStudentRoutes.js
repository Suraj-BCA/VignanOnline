const express = require("express");
const RegisteredStudent = require("../models/RegisteredStudent");
const otpStorage = new Map(); 
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    console.log("Received Data:", req.body); // Log the request body

    const { name, email, phone, course } = req.body;

    if (!phone || !course) {
      return res.status(400).json({ error: "Phone and course are required." });
    }

    const existingStudent = await RegisteredStudent.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ error: "Student already exists" });
    }

    const student = new RegisteredStudent({ name, email, phone, course });
    await student.save();

    res
      .status(201)
      .json({ message: "Student registered successfully", student });
  } catch (error) {
    res.status(500).json({ error: "Server Error: " + error.message });
  }
});


const generateOTP = (phone) => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
    otpStorage.set(phone, otp); // Store OTP against phone number
    return otp;
};

router.post("/send-login-otp", (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: "Phone number is required!" });
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  otpStorage.set(phone, otp);

  console.log(`Generated OTP for login ${phone}:`, otp);
  res.json({ success: true, message: "OTP sent successfully!" });
});

router.post("/login", (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ error: "Phone and OTP are required!" });
  }

  const storedOtp = otpStorage.get(phone);

  if (!storedOtp) {
    return res.status(400).json({ error: "No OTP found! Request a new one." });
  }

  if (storedOtp !== otp) {
    return res.status(400).json({ error: "Invalid OTP!" });
  }

  otpStorage.delete(phone); // ✅ Remove OTP after successful login
  res.json({ success: true, message: "Login successful!" });
});

router.post("/check-phone", async (req, res) => {
  const { phone } = req.body;

  try {
    const student = await RegisteredStudent.findOne({ phone });

    if (student) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    return res.status(500).json({ error: "Server error: " + error.message });
  }
});

router.post("/send-otp", (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: "Phone number is required." });
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  console.log(`Generated OTP for ${phone}:`, otp);

  otpStorage.set(phone, otp); // Store OTP in memory

  res.status(200).json({ message: "OTP sent successfully!" });
});

router.post("/verify-otp", (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ error: "Phone number and OTP are required." });
  }

  const storedOtp = otpStorage.get(phone);

  if (!storedOtp) {
    return res.status(400).json({ error: "No OTP found! Request a new one." });
  }

  if (storedOtp !== otp) {
    return res.status(400).json({ error: "Invalid OTP." });
  }

  res.status(200).json({ message: "OTP verification successful!" });
});

module.exports = router;
