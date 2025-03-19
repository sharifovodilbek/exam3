const { db } = require("../config/db");
const { DataTypes } = require("sequelize");

const orderItem = db.define(
  "orderItem",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    count:{
        type:DataTypes.INTEGER,
        allowNull:false
    }
  },
  {
    timestamps: true,
  }
);

module.exports = orderItem;
