// controllers/JobApplicationController.js
const { where } = require("sequelize");
const { JobApplication, Job, Consultant } = require("../models");

const applyToJob = async (req, res) => {
  try {
    const { name, number, jobId, consultantId } = req.body;

    if (!name || !number || !jobId || !consultantId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingApplication = await JobApplication.findOne({
      where: { number, jobId },
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied to this job with the same number.",
      });
    }

    const application = await JobApplication.create({
      name,
      number,
      jobId,
      consultantId,
    });

    res.status(201).json({
      message: "Application submitted successfully.",
      application,
    });
  } catch (error) {
    console.error("Apply to Job Error:", error);
    res.status(500).json({ message: "Failed to apply to job." });
  }
};

const getAllApplications = async (req, res) => {
  try {
    const applications = await JobApplication.findAll({
      include: [
        {
          model: Job,
          attributes: ["id", "jobTitle", "location"],
        },
        {
          model: Consultant,
          attributes: ["id", "name", "email"],
        },
      ],
      where: {
        isLeadCreated: false,
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(applications);
  } catch (error) {
    console.error("Get Applications Error:", error);
    res.status(500).json({ message: "Failed to fetch applications." });
  }
};

const checkIfAlreadyApplied = async (req, res) => {
  try {
    const { number, jobId } = req.query;

    // 🔐 Validate input
    if (!number || !jobId) {
      return res.status(400).json({ message: "Missing number or jobId" });
    }

    // 🔎 Check if a job application with same number and job exists
    const existing = await JobApplication.findOne({
      where: { number, jobId },
    });

    return res.status(200).json({ exists: !!existing });
  } catch (error) {
    console.error("❌ Error checking duplicate application:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  applyToJob,
  getAllApplications,
  checkIfAlreadyApplied,
};
