const { Sequelize, DataTypes } = require("sequelize");

// Connect to DB
const sequelize = new Sequelize(
  process.env.DB_NAME || "exchange",
  process.env.DB_USER || "postgres",
  process.env.DB_PASS || "password",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres", // or "mysql"
    logging: false,
  }
);

// User Model
const Users = sequelize.define("Users", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: "user" },
});

module.exports = { sequelize, Users };
