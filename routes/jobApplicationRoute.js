const express = require("express");
const router = express.Router();
const JobApplicationController = require("../controllers/JobApplicationController");
const authenticate = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

router.post("/apply", JobApplicationController.applyToJob);
router.get("/applications",authenticate, isAdmin ,JobApplicationController.getAllApplications);


module.exports = router;
