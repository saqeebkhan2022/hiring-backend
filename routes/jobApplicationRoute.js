const express = require("express");
const router = express.Router();
const JobApplicationController = require("../controllers/JobApplicationController");

router.post("/apply", JobApplicationController.applyToJob);

module.exports = router;
