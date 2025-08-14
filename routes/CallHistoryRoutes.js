const express = require("express");
const router = express.Router();
const CallHistoryController = require("../controllers/CallHistoryController");
const authenticate = require("../middleware/authMiddleware");
const {
  isAdmin,
  isConsultant,
  isAdminOrConsultant,
} = require("../middleware/roleMiddleware");

// Routes for Call History
router.get(
  "/",
  authenticate,
  isAdminOrConsultant,
  CallHistoryController.getAllCallHistory
);
router.post(
  "/",
  authenticate,
  isAdminOrConsultant,
  CallHistoryController.createCallHistory
);
router.get(
  "/:id",
  authenticate,
  isAdminOrConsultant,
  CallHistoryController.getCallHistoryById
);
router.put(
  "/:id",
  authenticate,
  isAdminOrConsultant,
  CallHistoryController.updateCallHistory
);
router.delete(
  "/:id",
  authenticate,
  isAdminOrConsultant,
  CallHistoryController.deleteCallHistory
);
router.get(
  "/consultant/:consultantId",

  CallHistoryController.getCallHistoriesByConsultantId
);

module.exports = router;
