const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function (req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Malformed token" });

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );

    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user; // ✅ include role
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
