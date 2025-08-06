const express = require("express");
const router = express.Router();
const JobController = require("../controllers/JobController");
const authenticate = require("../middleware/authMiddleware");
const { isAdminOrConsultant } = require("../middleware/roleMiddleware");

// ✅ Public route (no token required)
router.get("/jobs/public-jobs", JobController.getPublicJobs);

// ✅ Authenticated routes
router.post("/jobs", authenticate, JobController.createJob);
router.get("/jobs", JobController.getAllJobs);
router.get("/jobs/:id", JobController.getJobById);
router.put("/jobs/:id", JobController.updateJob);
router.delete("/jobs/:id", JobController.deleteJob);

module.exports = router;
