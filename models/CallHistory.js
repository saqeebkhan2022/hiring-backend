"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CallHistory extends Model {
    static associate(models) {
      // A call history belongs to one consultant
      CallHistory.belongsTo(models.Consultant, {
        foreignKey: "consultantId",
        onDelete: "CASCADE",
      });
    }
  }

  CallHistory.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING, allowNull: false },
      notes: { type: DataTypes.STRING, allowNull: true },
      phone: { type: DataTypes.STRING, allowNull: false },
      status: { type: DataTypes.STRING, allowNull: false },
      duration: { type: DataTypes.STRING },
      creditUsed: { type: DataTypes.STRING },
      lastCall: { type: DataTypes.DATEONLY },
      attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
      callSid: { type: DataTypes.STRING, allowNull: false },
      consultantId: {
        type: DataTypes.UUID,
        allowNull: true, // Allow null temporarily (can change to false later)
        references: {
          model: "Consultants",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "CallHistory",
    }
  );

  return CallHistory;
};
