"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Job extends Model {
    static associate(models) {
      Job.belongsTo(models.Consultant, {
        foreignKey: {
          name: "consultantId",
          allowNull: false,
        },
        onDelete: "CASCADE",
      });
    }
  }

  Job.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      consultantId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Consultants",
          key: "id",
        },
      },
      jobTitle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      company: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      experienceRequired: {
        type: DataTypes.STRING,
      },
      salaryRange: {
        type: DataTypes.STRING,
      },
      jobType: {
        type: DataTypes.STRING,
      },
      visaStatus: {
        type: DataTypes.STRING,
      },
      qualification: {
        type: DataTypes.STRING,
      },
      dutyHours: {
        type: DataTypes.STRING, // Example: "8 hours/day"
      },
      overtime: {
        type: DataTypes.STRING, // Example: "2 hours/day"
      },
      ageLimit: {
        type: DataTypes.STRING, // Example: "21 - 35"
      },
      gender: {
        type: DataTypes.STRING,
      },
      applicationDeadline: {
        type: DataTypes.DATEONLY, // Format: yyyy-mm-dd
      },
      accommodationProvided: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      transportationProvided: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      foodProvided: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      jobDescription: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Job",
    }
  );

  return Job;
};
