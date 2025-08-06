const { Job } = require("../models");

// Create a new job (Consultant only)
const createJob = async (req, res) => {
  try {
    const consultantId = req.user.consultantId || req.user.id;

    if (!consultantId) {
      return res.status(400).json({
        message: "Consultant ID missing from token. Please re-login.",
      });
    }

    const jobData = {
      ...req.body,
      consultantId,
    };

    const job = await Job.create(jobData);

    res.status(201).json({
      message: "Job created successfully.",
      job,
    });
  } catch (error) {
    console.error("Create Job Error:", error);
    res.status(500).json({
      message: "Failed to create job.",
      error: error.message,
    });
  }
};

// Get all jobs for logged-in consultant (excluding deleted)
const getAllJobs = async (req, res) => {
  try {
    const consultantId = req.user?.consultantId || req.user?.id;

    const jobs = await Job.findAll({
      where: {
        isDeleted: false,
        ...(consultantId ? { consultantId } : {}), // only filter if consultantId exists
      },
    });

    return res.status(200).json(jobs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch jobs." });
  }
};

// Get job by ID (Consultant only)
const getJobById = async (req, res) => {
  try {
    const consultantId = req.user.consultantId || req.user.id;
    const job = await Job.findOne({
      where: { id: req.params.id, consultantId, isDeleted: false },
    });
    if (!job) return res.status(404).json({ message: "Job not found." });
    return res.status(200).json(job);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch job." });
  }
};

// Update job (Consultant only)
const updateJob = async (req, res) => {
  try {
    const consultantId = req.user.consultantId || req.user.id;
    const job = await Job.findOne({
      where: { id: req.params.id, consultantId, isDeleted: false },
    });
    if (!job)
      return res
        .status(404)
        .json({ message: "Job not found or already deleted." });

    await job.update(req.body);
    return res.status(200).json({ message: "Job updated successfully.", job });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Failed to update job." });
  }
};

// Soft delete job
const deleteJob = async (req, res) => {
  try {
    const consultantId = req.user.consultantId || req.user.id;
    const job = await Job.findOne({
      where: { id: req.params.id, consultantId, isDeleted: false },
    });
    if (!job)
      return res
        .status(404)
        .json({ message: "Job not found or already deleted." });

    await job.update({ isDeleted: true });

    return res
      .status(200)
      .json({ message: "Job deleted successfully (soft delete)." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete job." });
  }
};

// ✅ Public job listing (no auth)
const getPublicJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({
      where: { isDeleted: false },
      // attributes: [
      //   "jobTitle",
      //   "company",
      //   "location",
      //   "salaryRange",
      //   "applicationDeadline",
      //   "quantity",
      //   "visaStatus",
      //   "createdAt",
      // ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(jobs);
  } catch (error) {
    console.error("Public Job Fetch Error:", error);
    return res.status(500).json({ message: "Failed to fetch public jobs." });
  }
};

module.exports = {
  createJob,
  updateJob,
  deleteJob,
  getAllJobs,
  getJobById,
  getPublicJobs,
};
