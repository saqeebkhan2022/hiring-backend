"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Plan extends Model {
    static associate(models) {
      // ✅ Correct foreign key and alias
      Plan.hasMany(models.PlanVariant, {
        foreignKey: "planId",
        as: "variants", // Alias used in your controller includes
      });
    }
  }

  Plan.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Plan",
      tableName: "Plans", // Optional: explicit table name
      timestamps: true,   // createdAt & updatedAt
    }
  );

  return Plan;
};
