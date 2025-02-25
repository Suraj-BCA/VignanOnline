const express = require('express');
const router = express.Router();
const Student = require("../models/Student")
const Course = require("../models/Course")


router.get('/dashboard', async (req, res) => {
    try {
      const usersCount = await Student.countDocuments();
      const totalCourses = await Course.countDocuments();
      const newUsers = 5; 
  
      res.json({
        totalUsers: usersCount,
        totalCourses: totalCourses,
        newUsers: newUsers,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ message: 'Error fetching dashboard data', error });
    }
  });

  module.exports = router;