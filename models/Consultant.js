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

      // Consultant has one KYC record
      Consultant.belongsTo(models.KYC, {
        foreignKey: "kycId",
        onDelete: "SET NULL",
      });

      Consultant.hasMany(models.Job, {
        foreignKey: "consultantId",
        as: "jobs",
        onDelete: "CASCADE",
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
        unique: true,
        validate: {
          isEmail: true,
        },
      },

      phone: DataTypes.STRING,

      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "active", "rejected"),
        defaultValue: "pending",
      },

      isTopConsultant: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "Marks if this consultant is featured as top",
      },

      isKycDone: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      kycId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "KYCs",
          key: "id",
        },
      },

      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      leadCredits: { type: DataTypes.INTEGER, defaultValue: 0 },
      // planVariantId: {
      //   type: DataTypes.UUID,
      //   references: {
      //     model: "PlanVariants",
      //     key: "id",
      //   },
      //   allowNull: true,
      // },
      // planPurchasedAt: {
      //   type: DataTypes.DATE,
      // },
      // planExpiresAt: {
      //   type: DataTypes.DATE,
      // },
    },
    {
      sequelize,
      modelName: "Consultant",
    }
  );

  return Consultant;
};
