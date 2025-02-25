const express = require('express');
const router = express.Router();
const Enquiry = require('../models/Enquiry'); 

router.post("/submit-enquiry", async (req, res) => {
    try {
      const { name, email, mobile, state, city, program, elective, consent } =
        req.body;
  
      const newEnquiry = new Enquiry({
        name,
        email,
        mobile,
        state,
        city,
        program,
        elective,
        consent,
      });
  
      await newEnquiry.save();
      res.status(201).json({ message: "Enquiry submitted successfully!" });
    } catch (error) {
      res.status(500).json({ error: "Internal server error!" });
    }
  });
  

  module.exports = router;  