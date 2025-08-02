const express = require("express");
const router = express.Router();
const {
  AssignLeads,
  GetAssignments,
} = require("../controllers/LeadAssignmentController");
const authenticate = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

router.post("/assign", authenticate, isAdmin, AssignLeads);
router.get("/all", authenticate, isAdmin, GetAssignments);

module.exports = router;
