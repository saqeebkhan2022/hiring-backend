"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Consultant, {
        foreignKey: "consultantId",
      });

      Payment.belongsTo(models.PlanVariant, {
        foreignKey: "planVariantId",
      });
    }
  }

  Payment.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      consultantId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      planVariantId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING,
        defaultValue: "INR",
      },
      razorpayOrderId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      razorpayPaymentId: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.ENUM("pending", "paid", "failed"),
        defaultValue: "pending",
      },
      failureReason: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Payment",
    }
  );

  return Payment;
};
