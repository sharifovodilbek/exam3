const { DataTypes } = require('sequelize');
const {db} = require('../config/db');

const Category = db.define('Category', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false }
}, {
  timestamps: true
});

module.exports = Category;
