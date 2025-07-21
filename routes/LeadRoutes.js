const express = require("express");
const router = express.Router();
const LeadController = require("../controllers/LeadController");

router.get("/", LeadController.getAllLeads);
router.post("/assign", LeadController.assignLeadsToConsultant);

module.exports = router;
