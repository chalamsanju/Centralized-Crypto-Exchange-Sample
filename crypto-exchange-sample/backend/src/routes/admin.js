const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getTransactions,
  getUsers,
  getWallets,
  getOrders,
  getP2P,
} = require("../controllers/adminController");

router.use(authMiddleware); // all routes protected

router.get("/transactions", getTransactions);
router.get("/users", getUsers);
router.get("/wallets", getWallets);
router.get("/orders", getOrders);
router.get("/p2p", getP2P);

module.exports = router;
