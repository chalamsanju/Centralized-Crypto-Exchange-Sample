const express = require("express");
const { Op } = require("sequelize");
const auth = require("../middleware/authMiddleware");
const Transaction = require("../models/Transaction");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: {
        [Op.or]: [{ fromUserId: req.user.id }, { toUserId: req.user.id }],
      },
      order: [["createdAt", "DESC"]],
    });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
