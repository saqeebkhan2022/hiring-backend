const express = require("express");
const router = express.Router();
const CallHistoryController = require("./CallHistoryController");

// Routes for Call History
router.get("/", CallHistoryController.getAllCallHistory);
router.post("/", CallHistoryController.createCallHistory);
router.get("/:id", CallHistoryController.getCallHistoryById);
router.put("/:id", CallHistoryController.updateCallHistory);
router.delete("/:id", CallHistoryController.deleteCallHistory);


module.exports = router;
