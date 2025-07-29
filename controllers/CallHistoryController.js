const { CallHistory } = require("../models");

// Get all call history entries
const getAllCallHistory = async (req, res) => {
  try {
    const history = await CallHistory.findAll();
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new call history record
const createCallHistory = async (req, res) => {
  try {
    const newRecord = await CallHistory.create(req.body);
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } 
};

// Get a single call history record by ID
const getCallHistoryById = async (req, res) => {
  try {
    const record = await CallHistory.findByPk(req.params.id);
    if (!record) return res.status(404).json({ error: "Call history not found" });
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update call history by ID
const updateCallHistory = async (req, res) => {
  try {
    const record = await CallHistory.findByPk(req.params.id);
    if (!record) return res.status(404).json({ error: "Call history not found" });
    await record.update(req.body);
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete call history by ID
const deleteCallHistory = async (req, res) => {
  try {
    const record = await CallHistory.findByPk(req.params.id);
    if (!record) return res.status(404).json({ error: "Call history not found" });
    await record.destroy();
    res.status(200).json({ message: "Call history deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllCallHistory,
  createCallHistory,
  getCallHistoryById,
  updateCallHistory,
  deleteCallHistory,
};
