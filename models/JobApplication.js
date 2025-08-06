"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class JobApplication extends Model {
    static associate(models) {
      JobApplication.belongsTo(models.Job, {
        foreignKey: "jobId",
        onDelete: "CASCADE",
      });
      JobApplication.belongsTo(models.Consultant, {
        foreignKey: "consultantId",
        onDelete: "CASCADE",
      });
    }
  }

  JobApplication.init(
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
      number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      jobId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      consultantId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      isLeadCreated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "JobApplication",
    }
  );

  return JobApplication;
};
