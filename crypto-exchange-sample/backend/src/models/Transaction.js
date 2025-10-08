const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const Transaction = sequelize.define("Transaction", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  type: { type: DataTypes.STRING, allowNull: false }, // deposit / send
  currency: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  fromUserId: { type: DataTypes.INTEGER, allowNull: true },
  toUserId: { type: DataTypes.INTEGER, allowNull: true },
});

Transaction.belongsTo(User, { as: "fromUser", foreignKey: "fromUserId" });
Transaction.belongsTo(User, { as: "toUser", foreignKey: "toUserId" });

module.exports = Transaction;
