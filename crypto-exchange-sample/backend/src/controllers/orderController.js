const Order = require("../models/Order");
const Wallet = require("../models/Wallet");
const { tryMatchIncoming } = require("../services/matchingEngine");

exports.placeOrder = async (req, res) => {
  try {
    const { side, pair, price, amount } = req.body;
    if (!side || !pair || !price || !amount)
      return res.status(400).json({ error: "Missing fields" });

    const [base, quote] = pair.split("/");

    if (side === "buy") {
      let quoteWallet = await Wallet.findOne({
        where: { userId: req.user.id, currency: quote },
      });
      if (!quoteWallet || parseFloat(quoteWallet.balance) < price * amount)
        return res.status(400).json({ error: "Insufficient quote balance" });

      quoteWallet.balance -= parseFloat(price * amount);
      await quoteWallet.save();
    } else {
      let baseWallet = await Wallet.findOne({
        where: { userId: req.user.id, currency: base },
      });
      if (!baseWallet || parseFloat(baseWallet.balance) < amount)
        return res.status(400).json({ error: "Insufficient base balance" });

      baseWallet.balance -= parseFloat(amount);
      await baseWallet.save();
    }

    const order = await Order.create({
      userId: req.user.id,
      side,
      pair,
      price,
      amount,
      remaining: amount,
      status: "open",
    });

    const trade = await tryMatchIncoming(order);
    if (trade) return res.json({ message: "Order matched", trade });
    return res.json({ message: "Order placed", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listOrders = async (req, res) => {
  const orders = await Order.findAll({ order: [["createdAt", "DESC"]] });
  res.json(orders);
};
