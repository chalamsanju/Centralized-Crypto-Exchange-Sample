const P2PTrade = require("../models/P2PTrade");
const Wallet = require("../models/Wallet");
const User = require("../models/User");

// Create offer (Seller)
exports.createOffer = async (req, res) => {
  try {
    const { currency, amount } = req.body;
    if (!currency || !amount)
      return res.status(400).json({ error: "Missing fields" });

    const wallet = await Wallet.findOne({
      where: { userId: req.user.id, currency },
    });
    if (!wallet || wallet.balance < amount)
      return res.status(400).json({ error: "Insufficient funds" });

    // Lock funds in escrow
    wallet.balance -= parseFloat(amount);
    await wallet.save();

    const trade = await P2PTrade.create({
      sellerId: req.user.id,
      currency,
      amount,
    });
    res.json(trade);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all offers (Marketplace)
exports.getOffers = async (req, res) => {
  try {
    const offers = await P2PTrade.findAll({
      include: [
        { model: User, as: "Seller", attributes: ["email"] },
        { model: User, as: "Buyer", attributes: ["email"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Accept offer (Buyer)
exports.acceptOffer = async (req, res) => {
  try {
    const { tradeId } = req.body;
    const trade = await P2PTrade.findByPk(tradeId);
    if (!trade || trade.status !== "open")
      return res.status(400).json({ error: "Trade cannot be accepted" });
    if (trade.sellerId === req.user.id)
      return res.status(400).json({ error: "Cannot accept your own trade" });

    trade.buyerId = req.user.id;
    trade.status = "accepted";
    await trade.save();

    res.json(trade);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Complete trade (Seller or Buyer)
exports.completeTrade = async (req, res) => {
  try {
    const { tradeId } = req.body;
    const trade = await P2PTrade.findByPk(tradeId);
    if (!trade || trade.status !== "accepted")
      return res.status(400).json({ error: "Trade cannot be completed" });

    // Transfer crypto to buyer wallet
    let buyerWallet = await Wallet.findOne({
      where: { userId: trade.buyerId, currency: trade.currency },
    });
    if (!buyerWallet)
      buyerWallet = await Wallet.create({
        userId: trade.buyerId,
        currency: trade.currency,
        balance: 0,
      });

    buyerWallet.balance += trade.amount;
    await buyerWallet.save();

    trade.status = "completed";
    await trade.save();

    res.json({ message: "Trade completed successfully", trade });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
