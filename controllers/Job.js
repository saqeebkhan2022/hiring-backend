const { Job } = require("../models");

const JobController = {
  async createJob(req, res) {
    try {
      const job = await Job.create(req.body);
      return res.status(201).json(job);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: "Failed to create job.", error });
    }
  },

  async getAllJobs(req, res) {
    try {
      const jobs = await Job.findAll();
      return res.status(200).json(jobs);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch jobs." });
    }
  },

  async getJobById(req, res) {
    try {
      const job = await Job.findByPk(req.params.id);
      if (!job) return res.status(404).json({ message: "Job not found." });
      return res.status(200).json(job);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch job." });
    }
  },

  async updateJob(req, res) {
    try {
      const job = await Job.findByPk(req.params.id);
      if (!job) return res.status(404).json({ message: "Job not found." });
      await job.update(req.body);
      return res.status(200).json(job);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: "Failed to update job." });
    }
  },

  async deleteJob(req, res) {
    try {
      const job = await Job.findByPk(req.params.id);
      if (!job) return res.status(404).json({ message: "Job not found." });
      await job.destroy();
      return res.status(200).json({ message: "Job deleted successfully." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to delete job." });
    }
  },
};

module.exports = JobController;
