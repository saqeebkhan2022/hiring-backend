const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Role } = require("../models");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔍 Find user with role
    const user = await User.findOne({
      where: { email },
      include: { model: Role, attributes: ["name"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔐 Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // 🎟️ Generate token
    const token = jwt.sign(
      { userId: user.id, role: user.Role.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.Role.name,
        verified: user.verified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { login };
