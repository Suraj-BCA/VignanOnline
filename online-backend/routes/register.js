const express = require('express');
const router = express.Router();
const User = require('../models/User');



router.post('/register', async (req, res) => {
    try {
      const { username, email, phone, password } = req.body;
  
      if (!username || !email || !phone || !password) {
        return res.status(400).json({ message: 'All fields are required!' });
      }
  
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/;
  
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format!' });
      }
  
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          message:
            'Password must be at least 6 characters long, include one uppercase letter, one lowercase letter, one special character, and one number.',
        });
      }
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists!' });
      }
  
      const newUser = new User({ username, email, phone, password });
      await newUser.save();
  
      res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  });

  module.exports = router;
  