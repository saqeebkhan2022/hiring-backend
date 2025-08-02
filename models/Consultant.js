"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Consultant extends Model {
    static associate(models) {
      Consultant.belongsTo(models.User, {
        foreignKey: "userId",
        onDelete: "CASCADE",
      });

      Consultant.hasMany(models.CallHistory, {
        foreignKey: "consultantId",
        onDelete: "CASCADE",
      });

      Consultant.belongsTo(models.PlanVariant, {
        foreignKey: "planVariantId",
        as: "planVariant",
      });
    }
  }

  Consultant.init(
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
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // ✅ Unique
        validate: {
          isEmail: true,
        },
      },
      company: {
        type: DataTypes.STRING,
        unique: true, // ✅ Unique
      },
      phone: DataTypes.STRING,
      photo: DataTypes.STRING,
      aadhar: {
        type: DataTypes.STRING,
        unique: true, // ✅ Unique
      },
      pan: DataTypes.STRING,
      signature: DataTypes.STRING,
      policeClearance: DataTypes.STRING,
      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "active", "rejected"),
        defaultValue: "pending",
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      planVariantId: {
        type: DataTypes.UUID,
        references: {
          model: "PlanVariants",
          key: "id",
        },
        allowNull: true,
      },
      planPurchasedAt: {
        type: DataTypes.DATE,
      },
      planExpiresAt: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "Consultant",
    }
  );

  return Consultant;
};
