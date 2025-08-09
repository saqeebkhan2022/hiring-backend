const express = require("express");
const router = express.Router();
const kycController = require("../controllers/KYCCotroller");

// KYC Routes
// create get all and getKycById routes
router.get("/", kycController.getAllKyc);
router.get("/:id", kycController.getKycById);
router.post("/send-otps", kycController.sendVerificationOtps);
router.post("/submit-kyc", kycController.submitKyc);

module.exports = router;
