const db = require("../models");
const LeadAssignment = db.LeadAssignment;
const Consultant = db.Consultant;
const Lead = db.Lead;

// const AssignLeads = async (req, res) => {
//   9;
//   try {
//     const { consultantId, leadIds } = req.body;

//     if (!consultantId || !Array.isArray(leadIds) || leadIds.length === 0) {
//       return res.status(400).json({ message: "Invalid payload." });
//     }

//     const results = [];
//     const skipped = [];

//     for (const leadId of leadIds) {
//       // Check if already assigned
//       const existing = await LeadAssignment.findOne({
//         where: { consultantId, leadId },
//       });

//       if (existing) {
//         skipped.push(leadId);
//         continue;
//       }

//       const newAssignment = await LeadAssignment.create({
//         consultantId,
//         leadId,
//         count: 1,
//       });

//       results.push(newAssignment);
//     }

//     res.status(200).json({
//       message:
//         results.length > 0
//           ? "Leads assigned successfully."
//           : "Selected leads were already assigned.",
//       assigned: results,
//       skipped,
//     });
//   } catch (error) {
//     console.error("Error assigning leads:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

const AssignLeads = async (req, res) => {
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
        where: { consultantId, leadId, isDeleted: false },
      });

      if (existing) {
        skipped.push(leadId);
        continue;
      }

      // Create assignment with Locked status
      const newAssignment = await LeadAssignment.create({
        consultantId,
        leadId,
        count: 1,
        lockStatus: "Locked", // Lock initially
        status: "Pending", // Default status
        assignmentStatus: "New", // New assignment
      });

      results.push(newAssignment);
    }

    return res.status(200).json({
      message:
        results.length > 0
          ? "Leads assigned successfully."
          : "Selected leads were already assigned.",
      assigned: results,
      skipped,
    });
  } catch (error) {
    console.error("Error assigning leads:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Unlock Lead (Consultant)
const unlockLead = async (req, res) => {
  try {
    const { consultantId, leadId } = req.body;

    if (!consultantId || !leadId) {
      return res
        .status(400)
        .json({ message: "ConsultantId and LeadId required." });
    }

    const assignment = await LeadAssignment.findOne({
      where: {
        consultantId,
        leadId,
        lockStatus: "Locked",
        isDeleted: false,
      },
    });

    if (!assignment) {
      return res.status(404).json({ message: "Locked assignment not found." });
    }

    const consultant = await Consultant.findByPk(consultantId);

    if (!consultant || consultant.leadCredits <= 0) {
      return res.status(400).json({ message: "Insufficient lead credits." });
    }

    // Unlock lead and update timestamp
    await assignment.update({
      lockStatus: "Unlocked",
      unlockedAt: new Date(),
    });

    // Deduct lead credit
    await consultant.update({
      leadCredits: consultant.leadCredits - 1,
    });

    return res.status(200).json({
      message: "Lead unlocked successfully.",
      assignment,
      remainingCredits: consultant.leadCredits - 1,
    });
  } catch (error) {
    console.error("Unlock error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const GetAssignments = async (req, res) => {
  try {
    const all = await LeadAssignment.findAll({
      where: { isDeleted: false, lockStatus: "Unlocked" },
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

const GetTotalLeadCountByConsultant = async (req, res) => {
  try {
    const { consultantId } = req.params;

    const totalCount = await LeadAssignment.count({
      where: { consultantId, isDeleted: false },
    });

    return res.status(200).json({ consultantId, total: totalCount });
  } catch (error) {
    console.error("Error fetching total lead count:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const GetLeadStatusCountsByConsultant = async (req, res) => {
  try {
    const { consultantId } = req.params;

    const stats = await LeadAssignment.findAll({
      where: { consultantId, isDeleted: false },
      attributes: [
        "status",
        [db.Sequelize.fn("COUNT", db.Sequelize.col("id")), "count"],
      ],
      group: ["status"],
    });

    // Prepare response
    const result = {
      consultantId,
      total: 0,
      Rejected: 0,
      UnderReview: 0,
      Shortlisted: 0,
      Pending: 0,
      Medical: 0,
      Completed: 0,
    };

    stats.forEach((row) => {
      const status = row.get("status");
      const count = parseInt(row.get("count"), 10);
      result[status] = count;
      result.total += count;
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching lead status counts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  AssignLeads,
  GetAssignments,
  DeleteAssignment,
  updateStatus,
  GetTotalLeadCountByConsultant,
  GetLeadStatusCountsByConsultant,
};
