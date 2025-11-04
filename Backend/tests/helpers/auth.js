const jwt = require("jsonwebtoken");

function tokenFor(userId, role, username = "tester") {
  return jwt.sign(
    { id: userId.toString(), role, username },
    process.env.JWT_SECRET,
    {
      issuer: process.env.JWT_ISS,
      audience: process.env.JWT_AUD,
      expiresIn: "2h",
    }
  );
}

module.exports = { tokenFor };

