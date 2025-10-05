const { PositionAmount } = require("../models");

// GET all position amounts
const getAllPositions = async (req, res) => {
  try {
    const positions = await PositionAmount.findAll({
      order: [["position", "ASC"]],
    });
    res.status(200).json(positions);
  } catch (error) {
    console.error("GetAllPositions error:", error);
    res.status(500).json({ message: "Failed to fetch positions", error });
  }
};

// GET single position amount by ID
const getPositionById = async (req, res) => {
  try {
    const { id } = req.params;
    const position = await PositionAmount.findByPk(id);
    if (!position)
      return res.status(404).json({ message: "Position not found" });
    res.status(200).json(position);
  } catch (error) {
    console.error("GetPositionById error:", error);
    res.status(500).json({ message: "Failed to fetch position", error });
  }
};

// CREATE new position amount
const createPositionAmount = async (req, res) => {
  try {
    const { position, amount } = req.body;
    if (!position || amount == null) {
      return res
        .status(400)
        .json({ message: "Position and amount are required" });
    }

    // prevent duplicate
    const existing = await PositionAmount.findOne({ where: { position } });
    if (existing)
      return res.status(400).json({ message: "Position already exists" });

    const newPosition = await PositionAmount.create({ position, amount });
    res.status(201).json(newPosition);
  } catch (error) {
    console.error("CreatePositionAmount error:", error);
    res.status(500).json({ message: "Failed to create position", error });
  }
};

// UPDATE position amount
const updatePositionAmount = async (req, res) => {
  try {
    const { id } = req.params;
    const { position, amount } = req.body;

    const pos = await PositionAmount.findByPk(id);
    if (!pos) return res.status(404).json({ message: "Position not found" });

    if (position) pos.position = position;
    if (amount != null) pos.amount = amount;

    await pos.save();
    res.status(200).json(pos);
  } catch (error) {
    console.error("UpdatePositionAmount error:", error);
    res.status(500).json({ message: "Failed to update position", error });
  }
};

// DELETE position amount
const deletePositionAmount = async (req, res) => {
  try {
    const { id } = req.params;
    const pos = await PositionAmount.findByPk(id);
    if (!pos) return res.status(404).json({ message: "Position not found" });

    await pos.destroy();
    res.status(200).json({ message: "Position deleted successfully" });
  } catch (error) {
    console.error("DeletePositionAmount error:", error);
    res.status(500).json({ message: "Failed to delete position", error });
  }
};

module.exports = {
  getAllPositions,
  getPositionById,
  createPositionAmount,
  updatePositionAmount,
  deletePositionAmount,
};
