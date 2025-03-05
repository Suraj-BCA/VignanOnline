require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require("body-parser");
const path = require("path");
const Student = require("./models/Student"); 
const QRCode = require("qrcode");


const app = express();
app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error:', err));


app.use(cors()); 
app.use(bodyParser.json({ limit: "100mb" })); 
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));


const dashboardRoutes = require("./routes/dashboardcount"); 
app.use("/", dashboardRoutes);


const uplodeRoutes = require("./routes/uploadStudent"); 
app.use("/", uplodeRoutes);


const studentRoutes = require("./routes/student"); 
app.use("/", studentRoutes);

const facultyRoutes = require("./routes/faculty"); 
app.use("/", facultyRoutes);

const attendanceRoutes = require("./routes/attendance");
app.use("/", attendanceRoutes);


const loginRoutes = require("./routes/login"); 
app.use("/", loginRoutes);

const userRoutes = require("./routes/register"); 
app.use("/", userRoutes);

const courseRoutes = require("./routes/courses"); 
app.use("/", courseRoutes);



const subjectRoutes = require("./routes/subject"); 
app.use("/", subjectRoutes);


const enquiryRoutes = require("./routes/enquiry"); 
app.use("/", enquiryRoutes);



const uploadRoutes = require("./routes/upload");
const multer = require('multer');
app.use(uploadRoutes);


const uploadSubjectRoutes = require("./routes/uploadSubjects"); 
app.use("/upload-subjects", uploadSubjectRoutes);

const UploadMarksRoutes = require("./routes/UploadMarks"); 
app.use("/", UploadMarksRoutes);

const registeredStudentRoute = require("./routes/registeredStudentRoutes"); 
app.use("/registered-students", registeredStudentRoute);


app.use("/uploads", express.static(path.join(__dirname, "uploads")));



app.post('/create-order', (req, res) => {
  const { amount, currency, receipt } = req.body;

  if (!amount || !currency || !receipt) {
    return res.status(400).json({ error: 'Amount, currency, and receipt are required' });
  }

  const orderId = `order_${Math.floor(Math.random() * 1000000)}`;
  res.status(200).json({ orderId, amount, currency, receipt });
});

app.post('/generate-qr', async (req, res) => {
  const { upiId, amount } = req.body;

  if (!upiId || !amount) {
    return res.status(400).json({ error: 'UPI ID and amount are required' });
  }

  try {
    const upiLink = `upi://pay?pa=${upiId}&pn=RecipientName&am=${amount}&cu=INR`;

    const qrCodeDataURL = await QRCode.toDataURL(upiLink);

    res.status(200).json({ qrCode: qrCodeDataURL });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

app.post('/confirm-payment', (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  setTimeout(() => {
    res.status(200).json({ success: true, message: 'Payment confirmed' });
  }, 2000); 
});

app.post("/check-payment-status", async (req, res) => {
  const { orderId } = req.body;
  
  try {
    const paymentStatus = await checkPayment(orderId); 
    if (paymentStatus === "PAID") {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.error("Payment check failed:", error);
    res.status(500).json({ success: false });
  }
});




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
