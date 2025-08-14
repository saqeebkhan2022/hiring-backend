const db = require("../models");
const LeadAssignment = db.LeadAssignment;
const Consultant = db.Consultant;
const Lead = db.Lead;

const AssignLeads = async (req, res) => {
  
  9;
  try {
    const { consultantId, leadIds } = req.body;

    if (!consultantId || !Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ message: "Invalid payload." });
    }

    const results = [];
    const skipped = [];

    for (const leadId of leadIds) {
      // Check if already assigned
      const existing = await LeadAssignment.findOne({
        where: { consultantId, leadId },
      });

      if (existing) {
        skipped.push(leadId); 
        continue;
      }

      const newAssignment = await LeadAssignment.create({
        consultantId,
        leadId,
        count: 1,
      });

      results.push(newAssignment);
    }

    res.status(200).json({
      message:
        results.length > 0
          ? "Leads assigned successfully."
          : "Selected leads were already assigned.",
      assigned: results,
      skipped,
    });
  } catch (error) {
    console.error("Error assigning leads:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const GetAssignments = async (req, res) => {
  try {
    const all = await LeadAssignment.findAll({
      include: [
        { model: Consultant, attributes: ["id", "name", "email"] },
        { model: Lead, attributes: ["id", "name", "email", "phone"] },
      ],
    });

    res.status(200).json({ assignments: all });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const DeleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await LeadAssignment.findByPk(id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found." });
    }

    if (assignment.isDeleted) {
      return res.status(400).json({ message: "Already deleted." });
    }

    await assignment.update({ isDeleted: true });

    return res.status(200).json({ message: "Assignment deleted (soft)." });
  } catch (error) {
    console.error("Soft delete error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id, consultantId, status } = req.body;

    if (!id || !consultantId || !status) {
      return res
        .status(400)
        .json({ message: "id, consultantId, and status are required." });
    }

    const assignment = await LeadAssignment.findOne({
      where: {
        // Find the LeadAssignment by its primary key (id) and consultantId (to ensure consultant owns it)

        id,
        consultantId,
        isDeleted: false,
      },
    });

    if (!assignment) {
      return res
        .status(404)
        .json({ message: "Assignment not found or access denied." });
    }

    // Update the status
    await assignment.update({ status });

    return res
      .status(200)
      .json({ message: "Status updated successfully.", assignment });
  } catch (error) {
    console.error("Error updating status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  AssignLeads,
  GetAssignments,
  DeleteAssignment,
  updateStatus,
};
