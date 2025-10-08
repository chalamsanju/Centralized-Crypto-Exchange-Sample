const express = require("express");
const walletCtrl = require("../controllers/walletController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();
router.get("/", auth, walletCtrl.getWallets);
router.post("/deposit", auth, walletCtrl.deposit);
router.post("/send", auth, walletCtrl.send);

module.exports = router;
