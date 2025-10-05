const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { User, Role, Consultant } = require("../models"); // Removed Plan & PlanVariant
const passwordResetOtpTemplate = require("../templates/passwordResetOtpTemplate");
const passwordUpdateSucessTemplate = require("../templates/PasswordUpdateSucessTemplate");
const passwordResetLinkTemplate = require("../templates/passwordResetLinkTemplate");
const sendEmail = require("../utils/mailer");
const { Op } = require("sequelize");


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
          attributes: ["id"], // Removed planExpiresAt
        },
      ],
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found with this email" });
    }

    if (!user.verified) {
      return res.status(401).json({ message: "Unauthorised Access" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const consultant = user.Consultant;
    const consultantId = consultant?.id || null;

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
      return res
        .status(404)
        .json({ message: "User not found with this email" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const tokenExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = tokenExpiry;
    await user.save();

    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;

    const emailHtml = passwordResetLinkTemplate({
      name: user.name,
      resetUrl,
    });

    await sendEmail(user.email, "Password Reset Link", emailHtml);

    res
      .status(200)
      .json({ success: true, message: "Password reset link sent to email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const verifyTokenAndResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpiry: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    await user.save();

    const emailHtml = passwordUpdateSucessTemplate({ name: user.name });
    await sendEmail(user.email, "Password Updated", emailHtml);

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Verify token error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { login, forgotPassword, verifyTokenAndResetPassword };
