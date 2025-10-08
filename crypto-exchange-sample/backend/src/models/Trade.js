const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Trade = sequelize.define(
  "Trade",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    buyOrderId: { type: DataTypes.INTEGER },
    sellOrderId: { type: DataTypes.INTEGER },
    price: { type: DataTypes.FLOAT },
    amount: { type: DataTypes.FLOAT },
  },
  {
    timestamps: true,
  }
);

module.exports = Trade;
