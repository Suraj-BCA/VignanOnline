const express = require("express");
const multer = require("multer");
const router = express.Router();
const Material = require("../models/Material"); // Import Material model (Create if needed)

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files in 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/upload-material", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { branch, year, semester, subject, type } = req.body;

    const newMaterial = new Material({
      branch,
      year,
      semester,
      subject,
      type,
      fileName: req.file.filename,
      filePath: req.file.path,
    });

    await newMaterial.save(); // Save file details in MongoDB
    console.log("✅ Material Saved in DB:", newMaterial);

    res.status(200).json({ message: "File uploaded successfully!", material: newMaterial });
  } catch (error) {
    console.error("❌ Error saving to database:", error);
    res.status(500).json({ error: "Failed to save file details" });
  }
});


const path = require("path");


router.get("/materials", async (req, res) => {
  try {
    const materials = await Material.find().populate("subject");

    const baseUrl = "http://localhost:5000/";
    const formattedMaterials = materials.map((material) => {
      // Extract actual file name
      let fileName = material.filePath ? path.basename(material.filePath) : "Untitled File";

      // ✅ Remove timestamp prefix (assuming it follows a pattern like '1739378098908-Filename.ext')
      fileName = fileName.replace(/^\d{13}-/, ""); // Removes 13-digit timestamp followed by '-'

      // Extract file extension
      const fileExtension = fileName.split(".").pop().toLowerCase();

      // Determine file type based on extension
      let fileType = "Unknown Type";
      if (["mp4", "mov", "avi"].includes(fileExtension)) fileType = "video";
      else if (["ppt", "pptx"].includes(fileExtension)) fileType = "ppt";
      else if (["doc", "docx"].includes(fileExtension)) fileType = "word";

      return {
        _id: material._id,
        fileName: fileName, 
        fileUrl: material.filePath ? baseUrl + material.filePath.replace(/\\/g, "/") : null, 
        fileType: fileType,
        uploadedAt: material.uploadedAt,
        subject: material.subject,
      };
    });

    res.json(formattedMaterials);
  } catch (error) {
    console.error("❌ Error fetching materials:", error);
    res.status(500).json({ error: "Failed to fetch materials" });
  }
});







module.exports = router;
