const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Role, Consultant, PlanVariant } = require("../models");

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

    // Fetch user with role and consultant's plan data
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
              as: "planVariant", // Must match your model alias
              attributes: ["price", "duration_days", "call_access"],
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const consultant = user.Consultant;
    const consultantId = consultant?.id || null;
    const planExpiry = consultant?.planExpiresAt || null;

    // Calculate how many days are left until the plan expires
    const daysLeft = planExpiry ? getRemainingDays(planExpiry) : null;

    // If plan expired, block features but still allow login
    const loginBlocked = daysLeft !== null && daysLeft < 0;

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.Role.name,
        verified: user.verified,
        consultantId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send response
    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.Role.name,
        verified: user.verified,
        consultantId,
        plan: consultant?.planVariant || null,
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

module.exports = { login };
