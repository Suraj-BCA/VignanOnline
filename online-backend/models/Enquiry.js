const mongoose = require('mongoose');


const enquirySchema = new mongoose.Schema({
    name: String,
    email: String,
    mobile: String,
    state: String,
    city: String,
    program: String,
    elective: String,
    consent: Boolean,
  });

module.exports = mongoose.model("Enquiry", enquirySchema);
