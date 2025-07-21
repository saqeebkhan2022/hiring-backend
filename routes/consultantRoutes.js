const express = require("express");
const router = express.Router();
const consultantController = require("../controllers/ConsultantController");

// Create consultant (also creates user)
router.post("/add", consultantController.AddConsultant);

// Get all consultants with user info
router.get("/all", consultantController.AllConsultant);

module.exports = router;
