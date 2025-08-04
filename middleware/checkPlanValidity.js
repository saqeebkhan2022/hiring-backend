const { Consultant } = require("../models");

const checkPlanValidity = async (req, res, next) => {
  try {
    const consultantId = req.user.consultantId || req.user.id;

    if (!consultantId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No consultant ID" });
    }

    const consultant = await Consultant.findByPk(consultantId);

    if (!consultant) {
      return res.status(404).json({ message: "Consultant not found" });
    }

    const expiryDate = new Date(consultant.planExpiresAt);
    const now = new Date();

    if (expiryDate < now) {
      return res.status(403).json({
        message: "Your plan has expired. Please renew to access this feature.",
        planExpired: true,
      });
    }

    // Optional: attach plan info
    req.consultant = consultant;
    next();
  } catch (err) {
    console.error("Error in checkPlanValidity middleware:", err);
    res.status(500).json({
      message: "Internal server error while checking plan validity",
      error: err.message,
    });
  }
};

module.exports = checkPlanValidity;
