const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contains userId and role
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};

const isConsultant = (req, res, next) => {
  if (req.user?.role !== "consultant") {
    return res.status(403).json({ message: "Access denied: Consultants only" });
  }
  next();
};

const isJobSeeker = (req, res, next) => {
  if (req.user?.role !== "jobseeker") {
    return res.status(403).json({ message: "Access denied: Job Seekers only" });
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  isConsultant,
  isJobSeeker,
};
