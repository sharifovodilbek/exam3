const { db } = require("../config/db");
const { DataTypes } = require("sequelize");

const Comment = db.define(
  "Comment",
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
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    star: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Comment;
