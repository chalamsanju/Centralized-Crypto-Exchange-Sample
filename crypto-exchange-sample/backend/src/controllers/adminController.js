const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Order = require("../models/Order");
const P2PTrade = require("../models/P2PTrade");

// Admin check middleware
function ensureAdmin(req, res) {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ error: "Forbidden: Admins only" });
    return false;
  }
  return true;
}

// Fetch all users
exports.getUsers = async (req, res) => {
  if (!ensureAdmin(req, res)) return;

  try {
    const users = await User.findAll({
      attributes: ["id", "email", "role", "createdAt"],
    });
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Fetch all wallets with user info
exports.getWallets = async (req, res) => {
  if (!ensureAdmin(req, res)) return;

  try {
    const wallets = await Wallet.findAll({
      include: { model: User, attributes: ["id", "email"] },
    });
    res.json(wallets);
  } catch (err) {
    console.error("Error fetching wallets:", err);
    res.status(500).json({ error: "Failed to fetch wallets" });
  }
};

// Fetch all orders with user info
exports.getOrders = async (req, res) => {
  if (!ensureAdmin(req, res)) return;

  try {
    const orders = await Order.findAll({
      include: { model: User, attributes: ["id", "email"] },
    });
    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// Fetch all P2P trades with buyer and seller info
exports.getP2P = async (req, res) => {
  if (!ensureAdmin(req, res)) return;

  try {
    const trades = await P2PTrade.findAll({
      include: [
        { model: User, as: "Seller", attributes: ["id", "email"] },
        { model: User, as: "Buyer", attributes: ["id", "email"] },
      ],
    });
    res.json(trades);
  } catch (err) {
    console.error("Error fetching P2P trades:", err);
    res.status(500).json({ error: "Failed to fetch P2P trades" });
  }
};

// Fetch all transactions together for admin dashboard
exports.getTransactions = async (req, res) => {
  if (!ensureAdmin(req, res)) return;

  try {
    const wallets = await Wallet.findAll({
      include: { model: User, attributes: ["id", "email"] },
    });
    const orders = await Order.findAll({
      include: { model: User, attributes: ["id", "email"] },
    });
    const p2p = await P2PTrade.findAll({
      include: [
        { model: User, as: "Seller", attributes: ["id", "email"] },
        { model: User, as: "Buyer", attributes: ["id", "email"] },
      ],
    });

    // Calculate total balances per currency
    const totalBalances = wallets.reduce((acc, w) => {
      acc[w.currency] = (acc[w.currency] || 0) + w.balance;
      return acc;
    }, {});

    res.json({ totalBalances, wallets, orders, p2p });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};
