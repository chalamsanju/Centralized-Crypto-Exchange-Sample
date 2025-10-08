const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const Order = sequelize.define(
  "Order",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    side: { type: DataTypes.STRING, allowNull: false }, // buy or sell
    pair: { type: DataTypes.STRING, allowNull: false }, // BTC/USDT
    price: { type: DataTypes.FLOAT, allowNull: false },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    remaining: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: "open" },
  },
  { timestamps: true }
);

User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

module.exports = Order;
