"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Lead extends Model {
    static associate(models) {
     
    }
  }

  Lead.init(
    {
      name: { type: DataTypes.STRING, allowNull: false },
      phone: { type: DataTypes.STRING, allowNull: false },
      status: { type: DataTypes.STRING, allowNull: false },
      duration: { type: DataTypes.STRING },
      creditUsed: { type: DataTypes.STRING },
      lastCall: { type: DataTypes.DATEONLY },
      attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    {
      sequelize,
      modelName: "CallHistory",
    }
  );

  return Lead;
};
