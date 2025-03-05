const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const router = express();
const upload = multer({ dest: "uploads/" });

router.post("/upload-marks", upload.single("file"), (req, res) => {
  const { courseId, year, semester, subject, moduleType, module, test } = req.body;
  const filePath = req.file.path;

  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    const headers = jsonData[0];

    const marksHeader = headers.find((header) =>
      ["T1", "T2", "T3", "T4", "T5", "External"].includes(header)
    );

    if (!marksHeader) {
      return res.status(400).json({ error: "No valid marks column found (e.g., T1, T2, External)." });
    }

    const marksIndex = headers.indexOf(marksHeader);

    const marksData = jsonData.slice(1).map((row) => ({
      rollNumber: row[0], 
      [marksHeader]: row[marksIndex], 
      courseId,
      year,
      semester,
      subject,
      moduleType,
      module,
      test,
    }));
    res.status(200).json({ message: "Marks uploaded successfully!", data: marksData });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Failed to process the file." });
  }
});

module.exports = router;