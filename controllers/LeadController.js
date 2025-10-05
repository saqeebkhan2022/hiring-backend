const path = require("path");
const {
  Lead,
  Job,
  Consultant,
  JobApplication,
  LeadAssignment,
} = require("../models");

// GET all leads
const getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.findAll({
      // attributes: [
      //   "id",
      //   "name",
      //   "phone",
      //   "email",
      //   "position",
      //   "status",
      //   "documents",
      //   "jobId",
      //   "experianceRequired",
      //   "consultantId",
      //   "createdAt",
      // ],
      include: [{ model: Job, attributes: ["jobTitle", "leadAmount"] }],
      order: [["createdAt", "DESC"]],
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

// GET leads by consultantId
const getLeadsAssignByConsultantId = async (req, res) => {
  try {
    const { consultantId } = req.params;

    const assignments = await LeadAssignment.findAll({
      where: { consultantId, isDeleted: false },
      include: [
        {
          model: Lead,
          include: [
            {
              model: Job,
              attributes: ["jobTitle", "leadAmount"], // Optional if useful to show job info
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!assignments.length) {
      return res
        .status(404)
        .json({ message: "No leads found for this consultant." });
    }

    res.status(200).json(assignments);
  } catch (error) {
    console.error("Error fetching assigned leads:", error);
    res.status(500).json({ error: "Failed to fetch assigned leads." });
  }
};

// ✅ createLead in controllers/LeadController.js

const createLead = async (req, res) => {
  try {
    const { name, phone, email, position, status, jobId } = req.body;

    // 🔐 Check if same phone already applied to same job
    const existing = await Lead.findOne({ where: { phone, jobId } });
    if (existing) {
      return res.status(400).json({
        message: "This number has already been used to apply for this job.",
      });
    }

    // ✅ Find consultantId from Job
    const job = await Job.findByPk(jobId);
    const consultantId = job?.consultantId || null;

    // ✅ Process uploaded documents
    const documents = {};
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        const key = file.fieldname.replace("documents[", "").replace("]", "");
        documents[key] = `/uploads/${path.basename(file.path)}`;
        // When switching to S3, replace this with the S3 URL
      });
    }

    const lead = await Lead.create({
      name,
      phone,
      email,
      position,
      status: "Pending",
      jobId,
      consultantId,
      documents,
    });
    const application = await JobApplication.findOne({
      where: { number: phone, jobId },
    });

    if (application) {
      await application.update({ isLeadCreated: true });
    }

    res.status(201).json({ message: "Lead created successfully", lead });
  } catch (error) {
    console.error("Create Lead Error:", error);
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

// GET counts of leads by status in one API
const getLeadStatusSummary = async (req, res) => {
  try {
    const [underReview, shortlisted, rejected] = await Promise.all([
      Lead.count({ where: { status: "Under Review" } }),
      Lead.count({ where: { status: "Shortlisted" } }),
      Lead.count({ where: { status: "Rejected" } }),
    ]);

    res.status(200).json({
      underReview,
      shortlisted,
      rejected,
    });
  } catch (error) {
    console.error("Error fetching lead status summary:", error);
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
  getLeadStatusSummary,
  getLeadsAssignByConsultantId,
};
