"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PositionAmount extends Model {
    static associate(models) {
      // One position can belong to multiple leads
      PositionAmount.hasMany(models.Lead, {
        foreignKey: "position",
        sourceKey: "position",
        as: "leads",
        constraints: false,
      });
    }
  }

  PositionAmount.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      position: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // one amount per position
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0, // store in paise
      },
    },
    {
      sequelize,
      modelName: "PositionAmount",
      tableName: "PositionAmounts",
      timestamps: true,
      paranoid: true,
    }
  );

  return PositionAmount;
};
