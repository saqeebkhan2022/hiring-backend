"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Lead extends Model {
    static associate(models) {
      Lead.belongsTo(models.Job, { foreignKey: "jobId" });
      Lead.belongsTo(models.Consultant, { foreignKey: "consultantId" });

      // Link Lead to PositionAmount based on position name (string)
      Lead.belongsTo(models.PositionAmount, {
        foreignKey: "position",
        targetKey: "position",
        as: "positionAmount",
        constraints: false, // prevents foreign key UUID mismatch
      });
    }
  }

  Lead.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING, allowNull: false },
      phone: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false },
      position: { type: DataTypes.STRING, allowNull: false }, // ensure not null
      status: { type: DataTypes.STRING },
      experienceRequired: { type: DataTypes.STRING },
      documents: { type: DataTypes.JSON },
      jobId: { type: DataTypes.UUID },

      paymentStatus: {
        type: DataTypes.ENUM("pending", "paid", "failed"),
        defaultValue: "pending",
      },
      consultantId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Consultants",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "Lead",
      timestamps: true,
      paranoid: true,
    }
  );

  return Lead;
};
