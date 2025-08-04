const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Role, Consultant, Plan, PlanVariant } = require("../models");

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
        name: user.name,
        email: user.email,
        role: user.Role.name,
        verified: user.verified,
        consultantId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 👇 Refactor planVariant response structure
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
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.Role.name,
        verified: user.verified,
        consultantId,
        planVariant, // 👈 Correct field name here
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
