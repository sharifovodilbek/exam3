
const { DataTypes } = require('sequelize');
const {db} = require('../config/db');

const OrderItem = db.define('OrderItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  count: { type: DataTypes.INTEGER, allowNull: false }
}, {
  timestamps: true
});

module.exports = OrderItem;
