const express = require("express");
const router = express.Router();
const LeadController = require("../controllers/CallHistoryController");

// CRUD Routes for Leads
router.get("/", LeadController.getAllLeads);
router.post("/", LeadController.createLead);
router.get("/:id", LeadController.getLeadById);
router.put("/:id", LeadController.updateLead);
router.delete("/:id", LeadController.deleteLead);

module.exports = router;
