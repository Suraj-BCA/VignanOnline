const express = require('express');
const router = express.Router();
const User = require("../models/User")

router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required!' });
      }
  
      const user = await User.findOne({ email, password });
      if (!user) {
        return res.status(400).json({ message: 'Invalid email or password!' });
      }
  
      res.status(200).json({ message: 'Login successful!' });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Error logging in user', error });
    }
  });

  module.exports=router;