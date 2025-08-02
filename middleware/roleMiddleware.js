const isAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated." });
  if (req.user.role !== "Admin")
    return res.status(403).json({ message: "Admin access only." });
  next();
};

const isConsultant = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated." });
  if (req.user.role !== "Consultant")
    return res.status(403).json({ message: "Consultant access only." });
  next();
};

// roleMiddleware.js
const isAdminOrConsultant = (req, res, next) => {
  if (req.user?.role === "Admin" || req.user?.role === "Consultant") {
    next();
  } else {
    return res
      .status(403)
      .json({ message: "Access restricted to Admin or Consultant." });
  }
};

module.exports = {
  isAdmin,
  isConsultant,
  isAdminOrConsultant,
};
