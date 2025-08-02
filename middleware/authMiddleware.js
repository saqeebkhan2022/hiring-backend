const jwt = require("jsonwebtoken");
const { User, Role } = require("../models");

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "Access denied. No token." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      include: [{ model: Role, attributes: ["name"] }],
    });

    if (!user) return res.status(401).json({ message: "Invalid token user." });

    req.user = {
      id: user.id,
      email: user.email,
      role: user.Role.name,
      verified: user.verified,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = authenticate;
