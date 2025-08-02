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

// Create a new call history entry
const createCallHistory = async (req, res) => {
  try {
    const {
      name,
      phone,
      status,
      duration,
      creditUsed,
      lastCall,
      attempts,
      consultantId,
    } = req.body;

    // Basic validation
    if (!name || !phone || !status || !consultantId) {
      return res.status(400).json({
        error: "Name, phone, status, and consultantId are required fields.",
      });
    }

    const newRecord = await CallHistory.create({
      name,
      phone,
      status,
      duration,
      creditUsed,
      lastCall,
      attempts,
      consultantId,
    });

    res.status(201).json(newRecord);
  } catch (error) {
    console.error("Error creating call history:", error);
    res.status(500).json({ error: "Failed to create call history record." });
  }
};

// Get a single call history record by ID
const getCallHistoryById = async (req, res) => {
  try {
    const record = await CallHistory.findByPk(req.params.id);
    if (!record)
      return res.status(404).json({ error: "Call history not found" });
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update call history by ID
const updateCallHistory = async (req, res) => {
  try {
    const record = await CallHistory.findByPk(req.params.id);
    if (!record)
      return res.status(404).json({ error: "Call history not found" });
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
    if (!record)
      return res.status(404).json({ error: "Call history not found" });
    await record.destroy();
    res.status(200).json({ message: "Call history deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get call history by consultantId
const getCallHistoriesByConsultantId = async (req, res) => {
  try {
    const { consultantId } = req.params;

    if (!consultantId) {
      return res.status(400).json({ error: "consultantId is required" });
    }

    const records = await CallHistory.findAll({
      where: { consultantId },
    });

    res.status(200).json(records);
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
  getCallHistoriesByConsultantId,
};
