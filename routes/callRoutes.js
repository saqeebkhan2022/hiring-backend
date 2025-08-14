const express = require("express");
const callController = require("../controllers/CallController");
const authenticate = require("../middleware/authMiddleware");
const { isConsultant } = require("../middleware/roleMiddleware");

const router = express.Router();

// Protected route: only consultants can call
router.post("/call", callController.makeCall);

module.exports = router;
