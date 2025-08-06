"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class LeadAssignment extends Model {
    static associate(models) {
      LeadAssignment.belongsTo(models.Consultant, {
        foreignKey: {
          name: "consultantId",
          allowNull: false,
        },
        onDelete: "CASCADE",
      });
      LeadAssignment.belongsTo(models.Lead, {
        foreignKey: {
          name: "leadId",
          allowNull: false,
        },
        onDelete: "CASCADE",
      });
    }
  }

  LeadAssignment.init(
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
      leadId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "LeadAssignment",
      indexes: [
        {
          unique: true,
          fields: ["consultantId", "leadId"],
        },
      ],
    }
  );

  return LeadAssignment;
};
