const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const P2PTrade = sequelize.define("P2PTrade", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  sellerId: { type: DataTypes.INTEGER, allowNull: false },
  buyerId: { type: DataTypes.INTEGER }, // null until accepted
  currency: { type: DataTypes.STRING, allowNull: false }, // BTC/ETH/USDT
  amount: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: "open" }, // open | accepted | completed
});

// Associations
User.hasMany(P2PTrade, { foreignKey: "sellerId", as: "Sales" });
P2PTrade.belongsTo(User, { foreignKey: "sellerId", as: "Seller" });

User.hasMany(P2PTrade, { foreignKey: "buyerId", as: "Purchases" });
P2PTrade.belongsTo(User, { foreignKey: "buyerId", as: "Buyer" });

module.exports = P2PTrade;
