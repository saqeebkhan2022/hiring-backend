"use strict";

// const Otp = require("../models/Otp");
// const KYC = require("../models/KYC");
const { KYC, Otp } = require("../models");
const sendSms = require("../utils/sendSMS");
const sendEmail = require("../utils/mailer");
const generateOTP = require("../utils/generateOTP");

// 1. Send OTPs
const sendVerificationOtps = async (req, res, next) => {
  try {
    const { phone, email, aadhar, pan } = req.body;

    // Require at least one field
    if (!phone && !email && !aadhar && !pan) {
      return res
        .status(400)
        .json({ message: "Provide at least one field to verify." });
    }

    const now = new Date();

    // Fetch latest OTP session
    let otpRecord = await Otp.findOne({
      order: [["createdAt", "DESC"]],
    });

    // If no session exists or expired, create a new session
    if (!otpRecord || otpRecord.expiry < now) {
      otpRecord = await Otp.create({
        tempId: generateOTP(), // new tempId for this session
        phoneOtp: null,
        emailOtp: null,
        aadharOtp: null,
        panOtp: null,
        expiry: new Date(now.getTime() + 10 * 60 * 1000), // 10 minutes
        isPhoneVerified: false,
        isEmailVerified: false,
        isAadharVerified: false,
        isPanVerified: false,
      });
    }

    // Generate OTPs only for requested fields that are not verified yet
    if (phone && !otpRecord.isPhoneVerified) {
      otpRecord.phoneOtp = generateOTP();
    }
    if (email && !otpRecord.isEmailVerified) {
      otpRecord.emailOtp = generateOTP();
    }
    if (aadhar && !otpRecord.isAadharVerified) {
      otpRecord.aadharOtp = generateOTP();
    }
    if (pan && !otpRecord.isPanVerified) {
      otpRecord.panOtp = generateOTP();
    }

    // Extend expiry
    otpRecord.expiry = new Date(now.getTime() + 10 * 60 * 1000);
    await otpRecord.save();

    // Send OTPs
    if (phone && otpRecord.phoneOtp) {
      await sendSms(phone, `Your phone OTP is ${otpRecord.phoneOtp}`);
    }
    if (email && otpRecord.emailOtp) {
      await sendEmail(
        email,
        "Email Verification OTP",
        `<p>Your OTP is: ${otpRecord.emailOtp}</p>`
      );
    }
    if (aadhar && otpRecord.aadharOtp) {
      // optionally send via SMS if you have a number
    }
    if (pan && otpRecord.panOtp) {
      // optionally send via SMS or email
    }

    // Return tempId to frontend (use same tempId for all fields)
    return res.status(200).json({
      message: "Verification code(s) sent. Please submit them to verify.",
      tempId: otpRecord.tempId,
    });
  } catch (error) {
    console.error("Error in sendVerificationOtps:", error);
    next(error);
  }
};
//
// 2. Verify OTP (stepwise)
//
const verifyOtp = async (req, res) => {
  try {
    const { tempId, type, otp } = req.body;

    const otpRecord = await Otp.findOne({ where: { tempId } });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid session. Resend OTPs." });
    }

    if (otpRecord.expiry < new Date()) {
      return res.status(400).json({ message: "OTP session expired." });
    }

    let isValid = false;

    switch (type) {
      case "phone":
        isValid = otpRecord.phoneOtp === otp;
        if (isValid) otpRecord.isPhoneVerified = true;
        break;
      case "email":
        isValid = otpRecord.emailOtp === otp;
        if (isValid) otpRecord.isEmailVerified = true;
        break;
      case "aadhar":
        isValid = otpRecord.aadharOtp === otp;
        if (isValid) otpRecord.isAadharVerified = true;
        break;
      case "pan":
        isValid = otpRecord.panOtp === otp;
        if (isValid) otpRecord.isPanVerified = true;
        break;
      default:
        return res.status(400).json({ message: "Invalid verification type." });
    }

    if (!isValid) {
      return res.status(400).json({ message: "Incorrect OTP." });
    }

    await otpRecord.save();

    return res.status(200).json({
      message: `${type} OTP verified successfully.`,
      verified: true,
    });
  } catch (error) {
    console.error("Error in verifyOtp:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//
// 3. Submit KYC (after OTPs verified)
//
const submitKyc = async (req, res, next) => {
  const {
    tempId,
    name,
    company,
    email,
    phone,
    aadhar,
    pan,
    licenseNumber,
    licenseExpiryDate,
    signature,
    policeClearance,
    licenseDocument,
  } = req.body;

  const otpRecord = await Otp.findOne({ where: { tempId } });
  if (!otpRecord)
    return res
      .status(400)
      .json({ message: "Session expired. Please resend OTPs." });

  if (!otpRecord.isPhoneVerified || !otpRecord.isEmailVerified) {
    return res
      .status(400)
      .json({ message: "Phone and Email must be verified." });
  }

  const newKyc = await KYC.create({
    name,
    company,
    email,
    phone,
    aadhar,
    pan,
    licenseNumber,
    licenseExpiryDate,
    signature,
    policeClearance,
    licenseDocument,
    isPhoneVerified: true,
    emailVerified: true,
    aadharVerified: !!aadhar && otpRecord.isAadharVerified,
    panVerified: !!pan && otpRecord.isPanVerified,
    status: "pending",
  });

  await otpRecord.destroy();
  await sendEmail(
    email,
    "KYC Submitted",
    `<h1>Hello ${name}</h1><p>Your KYC has been submitted.</p>`
  );

  return res
    .status(201)
    .json({ message: "KYC submitted successfully.", kycId: newKyc.id });
};

//
// 4. Admin: Get all pending KYC
//
const getAllKyc = async (req, res) => {
  try {
    const allKyc = await KYC.findAll({
      where: { status: "pending" },
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json(allKyc);
  } catch (error) {
    console.error("Error fetching KYC records:", error);
    res.status(500).json({ message: "Failed to fetch KYC records." });
  }
};

//
// 5. Get KYC by ID
//
// const getKycById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const kyc = await KYC.findByPk(id);
//     if (!kyc) return res.status(404).json({ message: "KYC record not found" });
//     return res.status(200).json(kyc);
//   } catch (error) {
//     console.error(`Error fetching KYC record:`, error);
//     res.status(500).json({ message: "Failed to fetch KYC record." });
//   }
// };

const getVerifiedKyc = async (req, res) => {
  try {
    const kycs = await KYC.findAll({
      where: { verified: true }, // only verified KYC
      order: [["createdAt", "DESC"]],
      attributes: ["id", "name", "email", "phone", "company"],
    });
    return res.status(200).json(kycs);
  } catch (error) {
    console.error("Error fetching KYC records:", error);
    return res.status(500).json({ message: "Failed to fetch KYC records." });
  }
};

//
// 6. Update KYC
//
const updateKyc = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const kyc = await KYC.findByPk(id);
    if (!kyc) return res.status(404).json({ message: "KYC not found." });

    await kyc.update(updateData);
    return res.status(200).json({ message: "KYC updated successfully.", kyc });
  } catch (error) {
    console.error("Error updating KYC:", error);
    res.status(500).json({ message: "Failed to update KYC." });
  }
};

//
// 7. Delete KYC
//
const deleteKyc = async (req, res) => {
  try {
    const { id } = req.params;
    const kyc = await KYC.findByPk(id);
    if (!kyc) return res.status(404).json({ message: "KYC not found." });

    await kyc.destroy();
    return res.status(200).json({ message: "KYC deleted successfully." });
  } catch (error) {
    console.error("Error deleting KYC:", error);
    res.status(500).json({ message: "Failed to delete KYC." });
  }
};

module.exports = {
  sendVerificationOtps,
  verifyOtp,
  submitKyc,
  getAllKyc,
  getVerifiedKyc,
  // getKycById,
  updateKyc,
  deleteKyc,
};
