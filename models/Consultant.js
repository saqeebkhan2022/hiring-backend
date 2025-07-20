"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Consultant extends Model {
    static associate(models) {
      Consultant.belongsTo(models.User, {
        foreignKey: { allowNull: false },
        onDelete: "CASCADE",
      });
    }
  }

  Consultant.init(
    {
      name: { type: DataTypes.STRING, allowNull: false },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isEmail: true },
      },
      company: DataTypes.STRING,
      phone: DataTypes.STRING,
      photo: DataTypes.STRING,
      aadhar: DataTypes.STRING,
      pan: DataTypes.STRING,
      signature: DataTypes.STRING,
      policeClearance: DataTypes.STRING,
      verified: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      sequelize,
      modelName: "Consultant",
    }
  );

  return Consultant;
};
