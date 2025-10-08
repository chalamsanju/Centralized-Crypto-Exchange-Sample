const Wallet = require("../models/Wallet");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

// Ensure wallet exists for user/currency
async function ensureWallet(userId, currency) {
  let w = await Wallet.findOne({ where: { userId, currency } });
  if (!w) w = await Wallet.create({ userId, currency, balance: 0 });
  return w;
}

// Get all wallets for logged-in user
exports.getWallets = async (req, res) => {
  try {
    const wallets = await Wallet.findAll({ where: { userId: req.user.id } });
    res.json(wallets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Deposit funds
exports.deposit = async (req, res) => {
  try {
    const { currency, amount } = req.body;
    if (!currency || amount == null)
      return res.status(400).json({ error: "Missing fields" });

    const wallet = await ensureWallet(req.user.id, currency);
    wallet.balance = parseFloat(wallet.balance) + parseFloat(amount);
    await wallet.save();

    // Log transaction
    await Transaction.create({
      type: "deposit",
      currency,
      amount: parseFloat(amount),
      fromUserId: null,
      toUserId: req.user.id,
    });

    res.json({ message: "Deposit successful", wallet });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Send funds to another user
exports.send = async (req, res) => {
  try {
    const { toEmail, currency, amount } = req.body;
    if (!toEmail || !currency || amount == null)
      return res.status(400).json({ error: "Missing fields" });

    const receiver = await User.findOne({ where: { email: toEmail } });
    if (!receiver) return res.status(404).json({ error: "Receiver not found" });

    const senderWallet = await ensureWallet(req.user.id, currency);
    if (parseFloat(senderWallet.balance) < parseFloat(amount))
      return res.status(400).json({ error: "Insufficient funds" });

    const receiverWallet = await ensureWallet(receiver.id, currency);

    // Update balances
    senderWallet.balance =
      parseFloat(senderWallet.balance) - parseFloat(amount);
    receiverWallet.balance =
      parseFloat(receiverWallet.balance) + parseFloat(amount);

    await senderWallet.save();
    await receiverWallet.save();

    // Log transactions
    await Transaction.create({
      type: "send",
      currency,
      amount: parseFloat(amount),
      fromUserId: req.user.id,
      toUserId: receiver.id,
    });

    await Transaction.create({
      type: "receive",
      currency,
      amount: parseFloat(amount),
      fromUserId: req.user.id,
      toUserId: receiver.id,
    });

    res.json({ message: "Transfer successful", senderWallet, receiverWallet });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Receive wallets (same as getWallets, kept for backward compatibility)
exports.receive = async (req, res) => {
  try {
    const wallet = await Wallet.findAll({ where: { userId: req.user.id } });
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
