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
    });
    res.status(200).json(variants);
  } catch (error) {
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
    // Get current consultant and their current plan + variant
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

    // Get the new plan variant
    const newVariant = await PlanVariant.findByPk(newPlanVariantId, {
      include: {
        model: Plan,
        as: "plan",
      },
    });

    if (!newVariant || !newVariant.plan) {
      return res.status(400).json({ message: "New plan variant not found" });
    }

    const currentPlanTitle = currentPlan?.title || "";
    const newPlanTitle = newVariant.plan.title;
    const currentDuration = currentVariant?.duration_days || 0;
    const newDuration = newVariant.duration_days;

    // ❌ Disallow downgrade (Premium → Standard)
    if (currentPlanTitle === "Premium" && newPlanTitle === "Standard") {
      return res.status(400).json({
        message: "Downgrade from Premium to Standard is not allowed.",
      });
    }

    // ❌ Disallow same plan with same or shorter duration
    if (currentPlanTitle === newPlanTitle && newDuration <= currentDuration) {
      return res.status(400).json({
        message:
          "Cannot downgrade or assign same/shorter duration variant in the same plan.",
      });
    }

    // ✅ Calculate remaining days
    const now = moment();
    const purchasedAt = moment(consultant.planPurchasedAt || now);
    const daysUsed = now.diff(purchasedAt, "days");

    let remainingDays;
    if (currentPlanTitle !== newPlanTitle) {
      // Upgrading from Standard → Premium: reset to full duration
      remainingDays = newDuration;
    } else {
      // Same plan title but longer duration: subtract days used
      remainingDays = Math.max(newDuration - daysUsed, 0);
    }

    // ✅ Update consultant plan
    consultant.planVariantId = newVariant.id;
    consultant.planPurchasedAt = now.toDate();
    consultant.planExpiresAt = now.add(remainingDays, "days").toDate();

    await consultant.save();

    // ✅ Log upgrade in history
    await PlanUpgradeHistory.create({
      consultantId: consultant.id,
      oldPlanVariantId: currentVariant?.id || null,
      newPlanVariantId: newVariant.id,
      changedAt: new Date(),
    });

    // ✅ Success response
    res.status(200).json({
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
    res.status(500).json({
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
