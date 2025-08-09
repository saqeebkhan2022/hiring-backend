
"use strict";

const { KYC } = require("../models");
const sendSms = require("../utils/sendSMS");
const sendEmail = require("../utils/mailer"); 
const generateOTP = require("../utils/generateOTP");
const otpStore = require("../utils/otpStore");



exports.sendVerificationOtps = async (req, res, next) => {
  try {
    const { phone, aadhar, email, pan } = req.body;

    // Validate that at least a phone number and email are provided
    if (!phone || !email) {
      return res
        .status(400)
        .json({ message: "Phone number and email are required." });
    }

    // Generate OTPs for all provided fields
    const phoneOtp = generateOTP();
    const emailOtp = generateOTP();
    const aadharOtp = aadhar ? generateOTP() : null;
    const panOtp = pan ? generateOTP() : null;
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    // Generate a unique temporary ID for this session
    const tempId = generateOTP();

    // Store the generated OTPs and expiry time in our temporary store
    otpStore.set(tempId, {
      phoneOtp,
      emailOtp,
      aadharOtp,
      panOtp,
      otpExpiry,
    });

    // Send phone OTP via Twilio
    await sendSms(
      phone,
      `Your verification code for DesertHire is: ${phoneOtp}. It is valid for 10 minutes.`
    );

    // Send email OTP via Nodemailer
    const emailSubject = "Email Verification OTP for DesertHire";
    const emailHtml = `
      <h1>Hello,</h1>
      <p>Your email verification code is: <strong>${emailOtp}</strong></p>
      <p>This code is valid for 10 minutes.</p>
    `;
    await sendEmail(email, emailSubject, emailHtml);

    // If Aadhar is provided, send Aadhar OTP
    if (aadhar) {
      await sendSms(
        phone, // Assuming Aadhar service provides a way to send OTPs, for this example we use the same phone number
        `Your Aadhar verification code for DesertHire is: ${aadharOtp}.`
      );
    }

    // If PAN is provided, send PAN OTP
    if (pan) {
      await sendSms(
        phone, // Assuming PAN service provides a way to send OTPs, for this example we use the same phone number
        `Your PAN verification code for DesertHire is: ${panOtp}.`
      );
    }

    return res.status(200).json({
      message:
        "Verification codes sent. Please submit them to complete the process.",
      tempId,
    });
  } catch (error) {
    console.error("Error in sendVerificationOtps:", error);
    next(error);
  }
};

/**
 * Controller function to handle the final submission of KYC data after OTPs are verified.
 * This is the second step of the KYC process.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 */
exports.submitKyc = async (req, res, next) => {
  try {
    const {
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
      // OTPs and tempId are now part of the request body for verification
      phoneOtp,
      emailOtp,
      aadharOtp,
      panOtp,
      tempId,
    } = req.body;

    // 1. Verify the temporary ID and OTPs
    const storedOtps = otpStore.get(tempId);
    if (!storedOtps || storedOtps.otpExpiry < Date.now()) {
      return res
        .status(400)
        .json({ message: "Invalid or expired session. Please resend OTPs." });
    }

    // Check if the provided OTPs match the stored ones
    const isPhoneOtpValid = storedOtps.phoneOtp === phoneOtp;
    const isEmailOtpValid = storedOtps.emailOtp === emailOtp;
    const isAadharOtpValid = !aadhar || storedOtps.aadharOtp === aadharOtp; // Aadhar OTP is optional
    const isPanOtpValid = !pan || storedOtps.panOtp === panOtp; // PAN OTP is optional

    if (
      !isPhoneOtpValid ||
      !isEmailOtpValid ||
      !isAadharOtpValid ||
      !isPanOtpValid
    ) {
      return res
        .status(400)
        .json({ message: "One or more OTPs are incorrect." });
    }

    // 2. If OTPs are valid, create the final KYC record
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
      // Since OTPs were verified, we can set the verified status directly
      isPhoneVerified: true,
      emailVerified: true,
      aadharVerified: !!aadhar, // Sets to true if aadhar exists, false otherwise
      aadharVerificationStatus: aadhar ? "verified" : "pending",
      panVerified: !!pan, // Sets to true if pan exists, false otherwise
      panVerificationStatus: pan ? "verified" : "pending",
      status: "pending", // Still needs manual review
    });

    // 3. Clear the temporary OTP data
    otpStore.delete(tempId);

    // Send a final confirmation email to the user
    const emailSubject = "KYC Application Submitted";
    const emailHtml = `
      <h1>Hello ${name},</h1>
      <p>Thank you for submitting your verified KYC application. We will review your documents and update your status shortly.</p>
    `;
    await sendEmail(email, emailSubject, emailHtml);

    return res.status(201).json({
      message: "KYC application submitted and verified successfully.",
      kycId: newKyc.id,
    });
  } catch (error) {
    console.error("Error in submitKyc:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(409)
        .json({
          message:
            "A user with this email, company, or aadhar number already exists.",
        });
    }
    next(error);
  }
};
