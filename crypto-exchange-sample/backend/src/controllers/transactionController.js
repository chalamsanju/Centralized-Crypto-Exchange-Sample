const Transaction = require("../models/Transaction");
const { Op } = require("sequelize");

// Get all transactions for logged-in user
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: {
        [Op.or]: [{ fromUserId: req.user.id }, { toUserId: req.user.id }],
      },
      order: [["createdAt", "DESC"]],
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
