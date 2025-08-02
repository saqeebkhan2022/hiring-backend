const express = require("express");
const router = express.Router();
const JobController = require("../controllers/JobController");
const authenticate = require("../middleware/authMiddleware");
const {
  isAdmin,
  isConsultant,
  isAdminOrConsultant,
} = require("../middleware/roleMiddleware");

// Create
router.post(
  "/jobs",
  authenticate,
  isAdminOrConsultant,
  JobController.createJob
);

// Read
router.get(
  "/jobs",
  authenticate,
  isAdminOrConsultant,
  JobController.getAllJobs
);

router.get(
  "/jobs/:id",
  authenticate,
  isAdminOrConsultant,
  JobController.getJobById
);

// Update
router.put(
  "/jobs/:id",
  authenticate,
  isAdminOrConsultant,
  JobController.updateJob
);

// Delete
router.delete(
  "/jobs/:id",
  authenticate,
  isAdminOrConsultant,
  JobController.deleteJob
);

module.exports = router;
