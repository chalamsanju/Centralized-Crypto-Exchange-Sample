const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const Wallet = sequelize.define(
  "Wallet",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    currency: { type: DataTypes.STRING, allowNull: false },
    balance: { type: DataTypes.FLOAT, defaultValue: 0 },
  },
  {
    timestamps: true,
  }
);

User.hasMany(Wallet, { foreignKey: "userId" });
Wallet.belongsTo(User, { foreignKey: "userId" });

module.exports = Wallet;
