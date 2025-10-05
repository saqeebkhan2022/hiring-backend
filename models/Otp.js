"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Otp extends Model {}

  Otp.init(
    {
      tempId: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      phoneOtp: DataTypes.STRING,
      emailOtp: DataTypes.STRING,
      aadharOtp: DataTypes.STRING,
      panOtp: DataTypes.STRING,
      expiry: DataTypes.DATE,
      isPhoneVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
      isEmailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
      isAadharVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
      isPanVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      sequelize,
      modelName: "Otp",
      tableName: "Otps",
      timestamps: true,
    }
  );

  return Otp;
};
