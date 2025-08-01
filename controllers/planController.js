const { Plan, PlanVariant } = require("../models");

// Create new plan
const createPlan = async (req, res) => {
  try {
    const plan = await Plan.create(req.body);
    res.status(201).json({
      message: "Plan created successfully",
      plan,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all plans with variants
const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.findAll({
      include: {
        model: PlanVariant,
        as: "variants",
      },
    });
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single plan by ID
const getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findByPk(req.params.id, {
      include: {
        model: PlanVariant,
        as: "variants",
      },
    });

    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a plan
const updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findByPk(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    await plan.update(req.body);
    res.status(200).json({
      message: "Plan updated successfully",
      plan,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a plan
const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findByPk(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    await plan.destroy();
    res.status(200).json({ message: "Plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  deletePlan,
};
