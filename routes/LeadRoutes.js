const express = require("express");
const router = express.Router();
const LeadController = require("../controllers/LeadController");
const authenticate = require("../middleware/authMiddleware");
const {
  isAdmin,
  isConsultant,
  isAdminOrConsultant,
} = require("../middleware/roleMiddleware");

router.post("/", LeadController.createLead);
router.get("/count", LeadController.TotalLeadCount);
router.get("/:id", LeadController.getLeadById);
router.get("/", LeadController.getAllLeads);
router.put("/:id", LeadController.updateLead);
router.delete("/:id", LeadController.deleteLead);

router.post(
  "/assign",
  LeadController.assignLeadsToConsultant
);

router.get(
  "/count",
  authenticate,
  isAdminOrConsultant,
  LeadController.TotalLeadCount
);
router.get(
  "/count/status-summary",
  authenticate,
  isAdminOrConsultant,
  LeadController.getLeadStatusSummary
);

module.exports = router;
