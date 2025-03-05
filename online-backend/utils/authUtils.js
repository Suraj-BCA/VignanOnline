const jwt = require("jsonwebtoken");

const generateToken = (student) => {
  const payload = {
    id: student._id, 
    email: student.email, 
  };

  const token = jwt.sign(payload, "your-secret-key", {
    expiresIn: "1h", 
  });

  return token;
};

module.exports = generateToken;