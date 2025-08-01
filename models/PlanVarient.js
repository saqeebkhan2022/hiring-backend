"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class PlanVariant extends Model {
    static associate(models) {
      // Each variant belongs to a specific Plan
      PlanVariant.belongsTo(models.Plan, {
        foreignKey: "planId",
        as: "plan", // Optional alias
      });

      // One variant can be assigned to many consultants
      PlanVariant.hasMany(models.Consultant, {
        foreignKey: "planVariantId",
        as: "consultants", // Optional alias
      });
    }
  }

  PlanVariant.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      planId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Plans", // Should match tableName if explicitly defined
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      duration_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      job_post_limit: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
      },
      lead_view_limit: {
        type: DataTypes.INTEGER,
        defaultValue: 50,
      },
      call_credit_limit: {
        type: DataTypes.INTEGER,
        defaultValue: 20,
        comment:
          "Number of call credits consultant gets with this plan variant",
      },
      call_access: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "PlanVariant",
      tableName: "PlanVariants", // Optional explicit table name
      timestamps: true,
    }
  );

  return PlanVariant;
};
