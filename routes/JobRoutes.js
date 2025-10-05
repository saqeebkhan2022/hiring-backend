const express = require("express");
const router = express.Router();
const JobController = require("../controllers/JobController");
const authenticate = require("../middleware/authMiddleware");
const {
  isAdminOrConsultant,
  isConsultant,
} = require("../middleware/roleMiddleware");

// ✅ Public route (no token required)
router.get("/jobs/public-jobs", JobController.getPublicJobs);

router.get("/jobs/featured/public-jobs", JobController.getFeaturedPublicJobs);

// ✅ Authenticated routes
router.post("/jobs", authenticate, JobController.createJob);

router.get("/jobs", JobController.getAllJobs);
// routes/jobRoutes.js
router.get(
  "/my-jobs/:consultantId",
  authenticate,
  isAdminOrConsultant,
  JobController.getJobsByConsultantId
);

router.patch("/toggle-featured/:id", JobController.toggleFeaturedJob);
router.get("/jobs/:id", JobController.getJobById);
router.put("/jobs/:id", JobController.updateJob);
router.delete("/jobs/delete/:consultantId/:id", JobController.deleteJob);

module.exports = router;
