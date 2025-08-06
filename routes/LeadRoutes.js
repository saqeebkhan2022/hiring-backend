const express = require("express");
const router = express.Router();
const LeadController = require("../controllers/LeadController");
const authenticate = require("../middleware/authMiddleware");
const {
  isAdmin,
  isConsultant,
  isAdminOrConsultant,
} = require("../middleware/roleMiddleware");
const upload = require("../middleware/multer");

// ✅ Create a new lead (requires file parsing)
router.post("/", upload.any(), LeadController.createLead);

// ✅ Total leads count
router.get(
  "/count",
  authenticate,
  isAdminOrConsultant,
  LeadController.TotalLeadCount
);

// ✅ Lead status summary
router.get(
  "/count/status-summary",
  authenticate,
  isAdminOrConsultant,
  LeadController.getLeadStatusSummary
);

// Get single lead by ID
router.get("/:id", LeadController.getLeadById);

// Get all leads
router.get("/", authenticate, isAdmin, LeadController.getAllLeads);

router.get(
  "/consultant/:consultantId",
  authenticate,
  isConsultant,
  LeadController.getLeadsAssignByConsultantId
);

// ✅ Update a lead
router.put("/:id", LeadController.updateLead);

// ✅ Delete a lead
router.delete("/:id", LeadController.deleteLead);

// ✅ Assign leads to consultant
router.post("/assign", LeadController.assignLeadsToConsultant);

module.exports = router;
