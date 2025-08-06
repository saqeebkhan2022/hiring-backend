// routes/jobApplicationRoute.js
const express = require("express");
const router = express.Router();
const JobApplicationController = require("../controllers/JobApplicationController");
const authenticate = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

// Create application
router.post("/apply", JobApplicationController.applyToJob);

router.get("/check", JobApplicationController.checkIfAlreadyApplied);

// Admin: Get all job applications with job and consultant details
router.get(
  "/applications",
  authenticate,
  isAdmin,
  JobApplicationController.getAllApplications
);

module.exports = router;
