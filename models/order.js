const { db } = require("../config/db");
const { DataTypes } = require("sequelize");

const Order = db.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

  },
  {
    timestamps: true,
  }
);

module.exports = Order;
