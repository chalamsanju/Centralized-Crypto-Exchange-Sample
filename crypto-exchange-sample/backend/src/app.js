const express = require("express");
const cors = require("cors");
require("dotenv").config();
const sequelize = require("./config/db");

const authRoutes = require("./routes/auth");
const walletRoutes = require("./routes/wallets");
const orderRoutes = require("./routes/orders");
const p2pRoutes = require("./routes/p2p");
const adminRoutes = require("./routes/admin");

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:3001" })); // React frontend
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/wallets", walletRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/p2p", p2pRoutes);
app.use("/api/admin", adminRoutes);

// Sync DB
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("✅ Database synced");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
})();

module.exports = app;
