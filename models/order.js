const { DataTypes } = require('sequelize');
const {db} = require('../config/db');

const Order = db.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false }
}, {
  timestamps: true
});

module.exports = Order;
