// models/PlanUpgradeHistory.js
"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class PlanUpgradeHistory extends Model {
    static associate(models) {
      PlanUpgradeHistory.belongsTo(models.Consultant, {
        foreignKey: "consultantId",
        as: "consultant",
      });

      PlanUpgradeHistory.belongsTo(models.PlanVariant, {
        foreignKey: "oldPlanVariantId",
        as: "oldVariant",
      });

      PlanUpgradeHistory.belongsTo(models.PlanVariant, {
        foreignKey: "newPlanVariantId",
        as: "newVariant",
      });
    }
  }

  PlanUpgradeHistory.init(
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
      oldPlanVariantId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      newPlanVariantId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      changedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "PlanUpgradeHistory",
      tableName: "PlanUpgradeHistories",
    }
  );

  return PlanUpgradeHistory;
};
