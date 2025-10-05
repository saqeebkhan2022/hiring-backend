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
const kycRoutes = require("./routes/KycRoutes");
const callRoutes = require("./routes/callRoutes");
const PositionAmountRoutes = require("./routes/positionAmountRoutes");
const path = require("path");
const app = express();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

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
app.use("/api", kycRoutes);
app.use("/api", callRoutes);
app.use("/api/position-amount", PositionAmountRoutes);

// Twilio Voice Webhook
app.post("/api/voice", (req, res) => {
  res.type("text/xml");
  res.send(`
    <Response>
      <Say voice="alice">Hello! This is a test call from your Node application using Twilio.</Say>
    </Response>
  `);
});

module.exports = app;
