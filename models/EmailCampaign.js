"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class EmailCampaign extends Model {
    static associate(models) {
      EmailCampaign.hasMany(models.EmailRecipient, {
        foreignKey: "campaignId",
        as: "recipients",
        onDelete: "CASCADE",
      });
    }
  }

  EmailCampaign.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING, allowNull: false }, // Campaign name
      subject: { type: DataTypes.STRING, allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: false }, // HTML content
      status: {
        type: DataTypes.ENUM("draft", "sending", "sent"),
        defaultValue: "draft",
      },
      sentAt: { type: DataTypes.DATE },
    },
    {
      sequelize,
      modelName: "EmailCampaign",
      timestamps: true,
    }
  );

  return EmailCampaign;
};
