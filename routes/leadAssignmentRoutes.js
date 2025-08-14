const express = require("express");
const router = express.Router();
const {
  AssignLeads,
  GetAssignments,
  DeleteAssignment,
  updateStatus,
} = require("../controllers/LeadAssignmentController");
const authenticate = require("../middleware/authMiddleware");
const {
  isAdmin,
  isConsultant,
  isAdminOrConsultant,
} = require("../middleware/roleMiddleware");

router.post("/assign", authenticate, isAdmin, AssignLeads);
router.get("/all", authenticate, isAdmin, GetAssignments);
router.put("/update-status", authenticate, isAdminOrConsultant, updateStatus);

// routes/leadAssignmentRoutes.js
router.delete("/delete/:id", authenticate, isConsultant, DeleteAssignment);

module.exports = router;
