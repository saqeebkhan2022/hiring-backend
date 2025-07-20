const express = require("express");
const router = express.Router();
const consultantController = require("../controllers/ConsultantController");

router.post("/", consultantController.default.AddConsultant);
router.get("/", consultantController.default.AllConsultant);

module.exports = router;
