const express = require("express");
const router = express.Router();

const kycController = require("../controllers/KYCCotroller");

// === KYC OTP & Verification ===

// Send OTPs (phone, email, aadhar, pan if provided)
router.post("/send-otps", kycController.sendVerificationOtps);

// Verify individual OTP (type = phone/email/aadhar/pan)
router.post("/verify-otp", kycController.verifyOtp);

// Submit full KYC (after OTP verification)
router.post("/submit", kycController.submitKyc);

// === Admin / CRUD ===
// GET /api/kyc?status=verified
router.get("/verified", kycController.getVerifiedKyc);
router.get("/kyc", kycController.getAllKyc); // all pending KYC
// router.get("/:id", kycController.getKycById); // get by ID
router.put("/:id", kycController.updateKyc); // update
router.delete("/:id", kycController.deleteKyc); // delete

module.exports = router;
