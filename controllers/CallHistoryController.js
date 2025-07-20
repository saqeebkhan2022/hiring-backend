const { CallHistory } = require("../models");

// Get all leads
const getAllLeads = async (req, res) => {
  try {
    const leads = await CallHistory.findAll();
    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new lead
const createLead = async (req, res) => {
  try {
    const newLead = await CallHistory.create(req.body);
    res.status(201).json(newLead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single lead by ID
const getLeadById = async (req, res) => {
  try {
    const lead = await CallHistory.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.status(200).json(lead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update lead by ID
const updateLead = async (req, res) => {
  try {
    const lead = await CallHistory.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    await lead.update(req.body);
    res.status(200).json(lead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete lead by ID
const deleteLead = async (req, res) => {
  try {
    const lead = await CallHistory.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    await lead.destroy();
    res.status(200).json({ message: "Lead deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllLeads,
  createLead,
  updateLead,
  deleteLead,
  getLeadById,
};
