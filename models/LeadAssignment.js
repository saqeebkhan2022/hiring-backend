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
      lockStatus: {
        type: DataTypes.ENUM("Locked", "Unlocked"),
        defaultValue: "Locked",
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "Pending",
          "UnderReview",
          "Interview",
          "Medical",
          "Shortlisted",
          "Rejected",
          "Completed"
        ),
        defaultValue: "Pending",
        allowNull: false,
      },
      assignmentStatus: {
        type: DataTypes.ENUM("New", "Old", "Reassigned"),
        defaultValue: "New",
        allowNull: false,
      },
      unlockedAt: {
        type: DataTypes.DATE,
        allowNull: true,
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
