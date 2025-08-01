const { Lead, Job, Consultant } = require("../models");

// GET all leads
const getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.findAll({
      attributes: [
        "id",
        "name",
        "phone",
        "email",
        "position",
        "status",
        "documents",
        "jobId",
        "consultantId",
      ],
      include: [{ model: Job, attributes: ["jobTitle"] }],
    });

    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET single lead by ID
const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findByPk(id, {
      include: [
        { model: Job, attributes: ["jobTitle"] },
        { model: Consultant, attributes: ["name"] },
      ],
    });

    if (!lead) {
      return res.status(404).json({ message: "Lead not found." });
    }

    res.status(200).json(lead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST create a new lead
const createLead = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      position,
      status,
      documents,
      jobId,
      consultantId,
    } = req.body;

    const lead = await Lead.create({
      name,
      phone,
      email,
      position,
      status,
      documents,
      jobId,
      consultantId,
    });

    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT update an existing lead
const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const lead = await Lead.findByPk(id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found." });
    }

    await lead.update(updates);
    await lead.reload();
    res.status(200).json({ message: "Lead updated successfully.", lead });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE a lead
const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCount = await Lead.destroy({ where: { id } });

    if (deletedCount === 0) {
      return res.status(404).json({ message: "Lead not found." });
    }

    res.status(200).json({ message: "Lead deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT assign multiple leads to a consultant
const assignLeadsToConsultant = async (req, res) => {
  try {
    const { consultantId, applicantIds } = req.body;

    if (
      !consultantId ||
      !Array.isArray(applicantIds) ||
      applicantIds.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Consultant ID and applicant IDs are required." });
    }

    await Lead.update({ consultantId }, { where: { id: applicantIds } });

    res.status(200).json({
      message: "Leads successfully assigned to consultant.",
      consultantId,
      updatedLeads: applicantIds,
    });
  } catch (error) {
    console.error("Error assigning leads:", error);
    res.status(500).json({ error: error.message });
  }
};

const TotalLeadCount = async (req, res) => {
  try {
    const count = await Lead.count();
    res.status(200).json({ totalLeads: count });
  } catch (err) {
    console.error("Error counting Leads:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  assignLeadsToConsultant,
  TotalLeadCount,
};
