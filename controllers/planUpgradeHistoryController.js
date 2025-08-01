// controllers/planUpgradeHistoryController.js
const {
  PlanUpgradeHistory,
  Consultant,
  PlanVariant,
  Plan,
  User,
} = require("../models");

const getPlanUpgradeHistory = async (req, res) => {
  try {
    const history = await PlanUpgradeHistory.findAll({
      include: [
        {
          model: Consultant,
          as: "consultant",
          include: {
            model: User,
            attributes: ["id", "name", "email"],
          },
        },
        {
          model: PlanVariant,
          as: "oldVariant",
          include: {
            model: Plan,
            as: "plan",
          },
        },
        {
          model: PlanVariant,
          as: "newVariant",
          include: {
            model: Plan,
            as: "plan",
          },
        },
      ],
      order: [["changedAt", "DESC"]],
    });

    res.status(200).json(history);
  } catch (err) {
    console.error("Upgrade report error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getPlanUpgradeHistory };
