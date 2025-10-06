const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const controller = require("../controllers/EmailCampaignController");

router.post("/campaign", controller.createCampaign);
router.post(
  "/campaign/recipients",
  upload.single("file"),
  controller.uploadRecipients
);
router.post("/campaign/send/:campaignId", controller.sendCampaign);

module.exports = router;
