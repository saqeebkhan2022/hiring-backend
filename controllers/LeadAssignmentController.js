const db = require("../models");
const LeadAssignment = db.LeadAssignment;
const Consultant = db.Consultant;
const Lead = db.Lead;

const AssignLeads = async (req, res) => {
  try {
    const { consultantId, leadIds } = req.body;

    if (!consultantId || !Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ message: "Invalid payload." });
    }

    const results = [];

    for (const leadId of leadIds) {
      const [assignment, created] = await LeadAssignment.findOrCreate({
        where: { consultantId, leadId },
        defaults: { count: 1 },
      });

      if (!created) {
        assignment.count += 1;
        await assignment.save();
      }

      results.push(assignment);
    }

    res.status(200).json({
      message: "Leads assigned successfully",
      assignments: results,
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



module.exports = {
  AssignLeads,
  GetAssignments,
};
