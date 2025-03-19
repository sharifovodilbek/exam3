const { db } = require("../config/db");
const { DataTypes } = require("sequelize");

const Region = db.define(
  "Region",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Region;
