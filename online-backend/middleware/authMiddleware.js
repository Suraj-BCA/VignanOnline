const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  console.log("Token received:", token); 

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  jwt.verify(token, "your-secret-key", (err, decoded) => {
    if (err) {
      console.error("Token verification failed:", err);
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    console.log("Decoded token:", decoded); 
    req.user = decoded;
    next();
  });
};

module.exports = verifyToken;