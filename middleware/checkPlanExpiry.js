// middlewares/checkPlanExpiry.js
const { Consultant } = require("../models");

// Helper to calculate days remaining
function getRemainingDays(expiryDate) {
  const today = new Date();
  const expires = new Date(expiryDate);
  const diffTime = expires.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Round up
}

const checkPlanExpiry = async (req, res, next) => {
  try {
    const consultantId = req.user.consultantId; // make sure `req.user` exists from previous auth middleware

    if (!consultantId) {
      return res
        .status(403)
        .json({ message: "Consultant ID not found in token" });
    }

    const consultant = await Consultant.findByPk(consultantId);

    if (!consultant || !consultant.planExpiresAt) {
      return res
        .status(403)
        .json({ message: "Consultant plan not found or missing expiry" });
    }

    const daysLeft = getRemainingDays(consultant.planExpiresAt);

    if (daysLeft < 0) {
      return res
        .status(403)
        .json({ message: "Plan has expired. Please renew to continue." });
    }

    // Attach plan info to request if needed in the controller
    req.plan = {
      planExpiresAt: consultant.planExpiresAt,
      daysLeft,
    };

    next();
  } catch (err) {
    console.error("checkPlanExpiry error:", err);
    res.status(500).json({ message: "Error checking plan expiry" });
  }
};

module.exports = checkPlanExpiry;
