// routes/planUpgradeHistoryRoutes.js
const express = require("express");
const router = express.Router();
const {
  getPlanUpgradeHistory,
} = require("../controllers/planUpgradeHistoryController");

router.get("/history", getPlanUpgradeHistory);

module.exports = router;
