const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { User, Role, Consultant, Plan, PlanVariant } = require("../models");
const passwordResetOtpTemplate = require("../templates/passwordResetOtpTemplate");
const passwordUpdateSucessTemplate = require("../templates/PasswordUpdateSucessTemplate");
const sendEmail = require("../utils/mailer");
const passwordResetLinkTemplate = require("../templates/passwordResetLinkTemplate");
const { Op } = require("sequelize");

// Utility to calculate remaining days from today to expiry date
function getRemainingDays(expiryDate) {
  const today = new Date();
  const expires = new Date(expiryDate);
  const diffTime = expires.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Round up to full days
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Role,
          attributes: ["name"],
        },
        {
          model: Consultant,
          attributes: ["id", "planExpiresAt"],
          include: [
            {
              model: PlanVariant,
              as: "planVariant",
              attributes: ["id", "price", "duration_days", "call_access"],
              include: [
                {
                  model: Plan,
                  as: "plan",
                  attributes: ["id", "title"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found with this email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const consultant = user.Consultant;
    const consultantId = consultant?.id || null;
    const planExpiry = consultant?.planExpiresAt || null;
    const daysLeft = planExpiry ? getRemainingDays(planExpiry) : null;
    const loginBlocked = daysLeft !== null && daysLeft < 0;

    const token = jwt.sign(
      {
        userId: user.id,
        consultantId: consultantId,
        name: user.name,
        email: user.email,
        role: user.Role.name,
        verified: user.verified,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const planVariant = consultant?.planVariant
      ? {
          id: consultant.planVariant.id,
          price: consultant.planVariant.price,
          duration_days: consultant.planVariant.duration_days,
          call_access: consultant.planVariant.call_access,
          plan: {
            id: consultant.planVariant.plan?.id,
            title: consultant.planVariant.plan?.title,
          },
        }
      : null;

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.Role.name,
        verified: user.verified,
        consultantId,
        planVariant,
        planExpiry,
        daysLeft,
        loginBlocked,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        message: "User not found with this email",
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash the token before saving (for security)
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set token expiry (10 min from now)
    const tokenExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Save hashed token and expiry in DB
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = tokenExpiry;
    await user.save();

    // Create reset URL
    const passwordResetOtp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

    const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;

    // Email HTML
    const emailHtml = passwordResetLinkTemplate({
      name: user.name,
      resetUrl,
    });

    await sendEmail(user.email, "Password Reset Link", emailHtml);

    res.status(200).json({
      success: true,
      message: "Password reset link sent to email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const verifyTokenAndResetPassword = async (req, res) => {
  try {
    const { token } = req.params; // now coming from URL
    const { password } = req.body; // only password from body

    // Hash token from request
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user by hashed token & check expiry
    const user = await User.findOne({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpiry: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password & clear reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    await user.save();

    // Send confirmation email
    const emailHtml = passwordUpdateSucessTemplate({ name: user.name });
    await sendEmail(user.email, "Password Updated", emailHtml);

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Verify token error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { login, forgotPassword, verifyTokenAndResetPassword };
