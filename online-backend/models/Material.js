const mongoose = require("mongoose");

const MaterialSchema = new mongoose.Schema({
  branch: String,
  year: Number,
  semester: Number,
  subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
  fileType: String, 
  filePath: String,
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Material", MaterialSchema);
