"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class EmailRecipient extends Model {
    static associate(models) {
      EmailRecipient.belongsTo(models.EmailCampaign, {
        foreignKey: "campaignId",
        as: "campaign",
        onDelete: "CASCADE",
      });
    }
  }

  EmailRecipient.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      campaignId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false },
      sent: { type: DataTypes.BOOLEAN, defaultValue: false },
      sentAt: { type: DataTypes.DATE },
    },
    {
      sequelize,
      modelName: "EmailRecipient",
      timestamps: true,
    }
  );

  return EmailRecipient;
};
