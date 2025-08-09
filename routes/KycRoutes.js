const express = require("express");
const router = express.Router();
const kycController = require("../controllers/KYCCotroller");

router.post("/send-otps", kycController.sendVerificationOtps);
router.post("/submit-kyc", kycController.submitKyc);

module.exports = router;
