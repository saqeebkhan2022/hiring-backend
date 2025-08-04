const {
  Consultant,
  PlanVariant,
  Plan,
  PlanUpgradeHistory,
} = require("../models");
const moment = require("moment");

// Create new variant
const createVariant = async (req, res) => {
  try {
    const variant = await PlanVariant.create(req.body);
    res.status(201).json({
      message: "Plan variant created successfully",
      variant,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all variants with their plan
const getAllVariants = async (req, res) => {
  try {
    const variants = await PlanVariant.findAll({
      include: {
        model: Plan,
        as: "plan",
      },
      order: [
        [{ model: Plan, as: "plan" }, "title", "ASC"], // Order by plan title
        ["duration_days", "ASC"], // Then by duration
      ],
    });

    res.status(200).json(variants);
  } catch (error) {
    console.error("Error fetching plan variants:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get variant by ID
const getVariantById = async (req, res) => {
  try {
    const variant = await PlanVariant.findByPk(req.params.id, {
      include: {
        model: Plan,
        as: "plan",
      },
    });

    if (!variant) {
      return res.status(404).json({ error: "Plan variant not found" });
    }

    res.status(200).json(variant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update variant
const updateVariant = async (req, res) => {
  try {
    const variant = await PlanVariant.findByPk(req.params.id);
    if (!variant) {
      return res.status(404).json({ error: "Plan variant not found" });
    }

    await variant.update(req.body);
    res.status(200).json({
      message: "Plan variant updated successfully",
      variant,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete variant
const deleteVariant = async (req, res) => {
  try {
    const variant = await PlanVariant.findByPk(req.params.id);
    if (!variant) {
      return res.status(404).json({ error: "Plan variant not found" });
    }

    await variant.destroy();
    res.status(200).json({ message: "Plan variant deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateConsultantPlan = async (req, res) => {
  const { consultantId } = req.params;
  const { newPlanVariantId } = req.body;

  try {
    // 🔍 Get current consultant with current plan & variant
    const consultant = await Consultant.findByPk(consultantId, {
      include: {
        model: PlanVariant,
        as: "planVariant",
        include: {
          model: Plan,
          as: "plan",
        },
      },
    });

    if (!consultant) {
      return res.status(404).json({ message: "Consultant not found" });
    }

    const currentVariant = consultant.planVariant;
    const currentPlan = currentVariant?.plan;

    const currentPlanTitle = currentPlan?.title || "";
    const currentDuration = currentVariant?.duration_days || 0;

    // 🔍 Get new plan variant
    const newVariant = await PlanVariant.findByPk(newPlanVariantId, {
      include: {
        model: Plan,
        as: "plan",
      },
    });

    if (!newVariant || !newVariant.plan) {
      return res.status(400).json({ message: "New plan variant not found" });
    }

    const newPlanTitle = newVariant.plan.title;
    const newDuration = newVariant.duration_days;

    const now = moment();
    const purchasedAt = moment(consultant.planPurchasedAt || now);
    const expiresAt = moment(consultant.planExpiresAt || now);
    const isExpired = now.isAfter(expiresAt);
    const daysUsed = now.diff(purchasedAt, "days");

    // ❌ Downgrade: Premium → Standard only if plan is expired
    if (
      !isExpired &&
      currentPlanTitle === "Premium" &&
      newPlanTitle === "Standard"
    ) {
      return res.status(400).json({
        message:
          "You cannot downgrade from Premium to Standard while your current plan is still active.",
      });
    }

    // ❌ Same plan + same/shorter duration not allowed if plan is still active
    if (
      !isExpired &&
      currentPlanTitle === newPlanTitle &&
      newDuration <= currentDuration
    ) {
      return res.status(400).json({
        message:
          "Cannot assign same or shorter duration in the same plan while current plan is still active.",
      });
    }

    // ✅ Calculate new duration
    let remainingDays;
    if (isExpired || currentPlanTitle !== newPlanTitle) {
      remainingDays = newDuration; // full reset
    } else {
      remainingDays = Math.max(newDuration - daysUsed, 0);
    }

    // ✅ Update consultant plan
    consultant.planVariantId = newVariant.id;
    consultant.planPurchasedAt = now.toDate();
    consultant.planExpiresAt = now.clone().add(remainingDays, "days").toDate();
    await consultant.save();

    // ✅ Log the plan change
    await PlanUpgradeHistory.create({
      consultantId: consultant.id,
      oldPlanVariantId: currentVariant?.id || null,
      newPlanVariantId: newVariant.id,
      changedAt: new Date(),
    });

    // ✅ Send response
    return res.status(200).json({
      message: "Plan upgraded successfully",
      consultant: {
        id: consultant.id,
        newPlan: {
          title: newVariant.plan.title,
          duration_days: newVariant.duration_days,
          expiresAt: consultant.planExpiresAt,
          remainingDays,
        },
      },
    });
  } catch (error) {
    console.error("Upgrade error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  createVariant,
  getAllVariants,
  getVariantById,
  updateVariant,
  deleteVariant,
  updateConsultantPlan,
};
