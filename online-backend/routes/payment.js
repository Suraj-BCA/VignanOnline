const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: "YOUR_RAZORPAY_KEY_ID", // Replace with your Razorpay key ID
  key_secret: "YOUR_RAZORPAY_KEY_SECRET", // Replace with your Razorpay key secret
});

// Route to create a Razorpay order
app.post("/create-order", async (req, res) => {
  const { amount, currency, receipt } = req.body;

  const options = {
    amount: amount * 100, // Amount in paise (e.g., 50000 paise = ₹500)
    currency,
    receipt,
    payment_capture: 1, // Auto-capture payment
  };

  try {
    const response = await razorpay.orders.create(options);
    res.json({ orderId: response.id });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

const crypto = require("crypto");

// Route to verify payment
app.post("/verify-payment", (req, res) => {
  const { paymentId, orderId, signature } = req.body;

  // Generate the expected signature
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  // Compare the signatures
  if (expectedSignature === signature) {
    res.json({ success: true, message: "Payment verified successfully" });
  } else {
    res.status(400).json({ success: false, message: "Invalid payment signature" });
  }
});