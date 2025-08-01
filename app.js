const express = require("express");
require("dotenv").config();
const cors = require("cors");
const consultant = require("./routes/consultantRoutes");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/JobRoutes");
const CallHistoryRoutes = require("./routes/CallHistoryRoutes");
const leadRoutes = require("./routes/LeadRoutes");
const roleRoutes = require("./routes/roleRoutes");
const userRoutes = require("./routes/userRoutes");
const LeadAssignmentRoutes = require("./routes/leadAssignmentRoutes");
const applyToJob = require("./routes/jobApplicationRoute");
const planRoutes = require("./routes/planRoutes");
const planVariantRoutes = require("./routes/planVariantRoutes");
const planUpgradeHistoryRoutes = require("./routes/planUpgradeHistoryRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/consultant", consultant);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api", jobRoutes);
app.use("/api", applyToJob);
app.use("/api/callhistory", CallHistoryRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/lead-assignment", LeadAssignmentRoutes);
app.use("/api", roleRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/plan-variant", planVariantRoutes);
app.use("/api/plan-upgrade", planUpgradeHistoryRoutes);
app.use("/api/payment", paymentRoutes);

module.exports = app;
