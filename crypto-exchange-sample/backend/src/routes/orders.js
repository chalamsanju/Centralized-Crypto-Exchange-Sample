const express = require("express");
const { placeOrder, listOrders } = require("../controllers/orderController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Protected routes
router.post("/place", auth, placeOrder);
router.get("/list", auth, listOrders);

module.exports = router;
