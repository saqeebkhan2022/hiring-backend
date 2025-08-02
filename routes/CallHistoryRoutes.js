const express = require("express");
const router = express.Router();
const CallHistoryController = require("../controllers/CallHistoryController");
const authenticate = require("../middleware/authMiddleware");
const { isAdmin ,isConsultant} = require("../middleware/roleMiddleware");

// Routes for Call History
router.get("/", authenticate, isAdmin, isConsultant, CallHistoryController.getAllCallHistory);
router.post("/", authenticate, isAdmin, isConsultant, CallHistoryController.createCallHistory);
router.get("/:id", authenticate, isAdmin, isConsultant, CallHistoryController.getCallHistoryById);
router.put("/:id", authenticate, isAdmin, isConsultant, CallHistoryController.updateCallHistory);
router.delete("/:id", authenticate, isAdmin, isConsultant, CallHistoryController.deleteCallHistory);
router.get("/consultant/:consultantId", authenticate, isAdmin, isConsultant, CallHistoryController.getCallHistoriesByConsultantId);

module.exports = router;
