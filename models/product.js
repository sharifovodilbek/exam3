const { DataTypes } = require('sequelize');
const {db} = require('../config/db');

const Product = db.define('Product', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.DECIMAL, allowNull: false },
  image: { type: DataTypes.STRING },
  categoryId: { type: DataTypes.BIGINT },
  userId: { type: DataTypes.INTEGER }
}, {
  timestamps: true
});


































module.exports = Product;
