const express = require("express");
const router = express.Router();
const {
  AssignLeads,
  GetAssignments,
} = require("../controllers/LeadAssignmentController");

router.post("/assign", AssignLeads);
router.get("/all", GetAssignments);

module.exports = router;
