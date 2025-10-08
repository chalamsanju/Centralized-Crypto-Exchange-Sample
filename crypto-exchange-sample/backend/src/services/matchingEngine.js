const Order = require("../models/Order");
const Wallet = require("../models/Wallet");
const Trade = require("../models/Trade");

async function tryMatchIncoming(order) {
  const oppositeSide = order.side === "buy" ? "sell" : "buy";
  const match = await Order.findOne({
    where: {
      side: oppositeSide,
      pair: order.pair,
      price: order.price,
      status: "open",
    },
  });

  if (!match) return null;
  const filledAmount = Math.min(order.remaining, match.remaining);

  order.remaining -= filledAmount;
  match.remaining -= filledAmount;
  if (order.remaining <= 0) order.status = "filled";
  else order.status = "partial";
  if (match.remaining <= 0) match.status = "filled";
  else match.status = "partial";

  await order.save();
  await match.save();

  const [base, quote] = order.pair.split("/");

  let buyOrder = order.side === "buy" ? order : match;
  let sellOrder = order.side === "sell" ? order : match;

  // Update buyer/seller wallets
  const buyerWallet = await Wallet.findOne({
    where: { userId: buyOrder.userId, currency: base },
  });
  const sellerWallet = await Wallet.findOne({
    where: { userId: sellOrder.userId, currency: base },
  });
  const sellerQuoteWallet = await Wallet.findOne({
    where: { userId: sellOrder.userId, currency: quote },
  });

  if (!buyerWallet)
    await Wallet.create({
      userId: buyOrder.userId,
      currency: base,
      balance: filledAmount,
    });
  else {
    buyerWallet.balance =
      parseFloat(buyerWallet.balance) + parseFloat(filledAmount);
    await buyerWallet.save();
  }

  if (sellerWallet) {
    sellerWallet.balance =
      parseFloat(sellerWallet.balance) - parseFloat(filledAmount);
    await sellerWallet.save();
  }

  const totalQuote = filledAmount * order.price;
  if (!sellerQuoteWallet)
    await Wallet.create({
      userId: sellOrder.userId,
      currency: quote,
      balance: totalQuote,
    });
  else {
    sellerQuoteWallet.balance =
      parseFloat(sellerQuoteWallet.balance) + parseFloat(totalQuote);
    await sellerQuoteWallet.save();
  }

  const trade = await Trade.create({
    buyOrderId: buyOrder.id,
    sellOrderId: sellOrder.id,
    price: order.price,
    amount: filledAmount,
  });

  return trade;
}

module.exports = { tryMatchIncoming };
