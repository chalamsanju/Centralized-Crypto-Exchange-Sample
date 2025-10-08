// routes/p2p.js
const express = require("express");
const router = express.Router();
const p2pCtrl = require("../controllers/p2pController");
const auth = require("../middleware/authMiddleware");

router.get("/offers", auth, p2pCtrl.getOffers);
router.post("/offer", auth, p2pCtrl.createOffer);
router.post("/accept", auth, p2pCtrl.acceptOffer);
router.post("/complete", auth, p2pCtrl.completeTrade);

module.exports = router;
