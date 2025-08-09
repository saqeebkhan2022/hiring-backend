"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class KYC extends Model {}

  KYC.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      company: {
        type: DataTypes.STRING,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      phone: DataTypes.STRING,
      phoneOtp: DataTypes.STRING,
      isPhoneVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      otpExpiry: DataTypes.DATE,

      aadhar: {
        type: DataTypes.STRING,
        unique: true,
      },
      aadharOtp: DataTypes.STRING,
      aadharDob: DataTypes.STRING,
      address: DataTypes.STRING,
      aadharFender: DataTypes.STRING,
      aadharVerificationDate: DataTypes.DATE,
      aadharVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      aadharVerificationStatus: {
        type: DataTypes.ENUM("pending", "verified", "failed"),
        defaultValue: "pending",
      },
      aadharVerificationRef: DataTypes.STRING,

      pan: DataTypes.STRING,
      panCategory: DataTypes.STRING,
      panStatus: DataTypes.STRING,
      panDob: DataTypes.STRING,
      panVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      panVerificationStatus: {
        type: DataTypes.ENUM("pending", "verified", "failed"),
        defaultValue: "pending",
      },

      panVerificationRef: DataTypes.STRING,

      panVerificationDate: DataTypes.DATE,
      licenseNumber: DataTypes.STRING,
      licenseDocument: DataTypes.STRING,
      licenseExpiryDate: DataTypes.DATE,

      signature: DataTypes.STRING,
      policeClearance: DataTypes.STRING,
      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "active", "rejected"),
        defaultValue: "pending",
      },
    },
    {
      sequelize,
      modelName: "KYC",
      tableName: "KYCs",
      timestamps: true,
    }
  );

  return KYC;
};
