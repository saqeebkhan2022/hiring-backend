const express = require("express");
const router = express.Router();
const JobController = require("../controllers/JobController");

// Create
router.post("/jobs", JobController.createJob);

// Read
router.get("/jobs", JobController.getAllJobs);
router.get("/jobs/:id", JobController.getJobById);

// Update
router.put("/jobs/:id", JobController.updateJob);

// Delete
router.delete("/jobs/:id", JobController.deleteJob);

module.exports = router;
