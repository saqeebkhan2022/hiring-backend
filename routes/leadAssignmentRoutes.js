const express = require("express");
const router = express.Router();
const {
  AssignLeads,
  GetAssignments,
  DeleteAssignment,
  updateStatus,
  GetTotalLeadCountByConsultant,
  GetLeadStatusCountsByConsultant,
} = require("../controllers/LeadAssignmentController");

const authenticate = require("../middleware/authMiddleware");
const {
  isAdmin,
  isConsultant,
  isAdminOrConsultant,
} = require("../middleware/roleMiddleware");

// Admin assigns leads
router.post("/assign", authenticate, isAdmin, AssignLeads);

// Admin view all assignments
router.get("/all", authenticate, isAdmin, GetAssignments);

// Update status (Admin or Consultant)
router.put("/update-status", authenticate, isAdminOrConsultant, updateStatus);

// Soft delete assignment (Consultant)
router.delete("/delete/:id", authenticate, isConsultant, DeleteAssignment);

// ✅ Consultant: Get total lead count
router.get(
  "/consultant/:consultantId/total-leads",
  authenticate,
  isConsultant,
  GetTotalLeadCountByConsultant
);

// ✅ Consultant: Get status-wise lead counts
router.get(
  "/consultant/:consultantId/status-counts",
  authenticate,
  isConsultant,
  GetLeadStatusCountsByConsultant
);

module.exports = router;
