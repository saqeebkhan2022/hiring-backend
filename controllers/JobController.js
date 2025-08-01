const { Job } = require("../models");

const createJob = async (req, res) => {
  try {
    const consultantId = req.user.consultantId;
    const job = await Job.create({
      ...req.body,
      consultantId,
    });
    return res.status(201).json(job);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Failed to create job.", error });
  }
};

const getAllJobs = async (req, res) => {
  try {
    const consultantId = req.user.consultantId;
    const jobs = await Job.findAll({ where: { consultantId } });
    return res.status(200).json(jobs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch jobs." });
  }
};

const getJobById = async (req, res) => {
  try {
    const consultantId = req.user.consultantId;
    const job = await Job.findOne({
      where: { id: req.params.id, consultantId },
    });
    if (!job) return res.status(404).json({ message: "Job not found." });
    return res.status(200).json(job);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch job." });
  }
};

const updateJob = async (req, res) => {
  try {
    const consultantId = req.user.consultantId;
    const job = await Job.findOne({
      where: { id: req.params.id, consultantId },
    });
    if (!job) return res.status(404).json({ message: "Job not found." });
    await job.update(req.body);
    return res.status(200).json(job);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Failed to update job." });
  }
};

const deleteJob = async (req, res) => {
  try {
    const consultantId = req.user.consultantId;
    const job = await Job.findOne({
      where: { id: req.params.id, consultantId },
    });
    if (!job) return res.status(404).json({ message: "Job not found." });
    await job.destroy();
    return res.status(200).json({ message: "Job deleted successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete job." });
  }
};

module.exports = {
  createJob,
  updateJob,
  deleteJob,
  getAllJobs,
  getJobById,
};
