// app.js
const express = require("express");
const cors = require("cors");
const consultant = require("./routes/consultantRoutes");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/JobRoutes");
const CallHistoryRoutes = require("./routes/CallHistoryRoutes");
const leadRoutes = require("./routes/LeadRoutes");
const roleRoutes = require("./routes/roleRoutes");
const userRoutes = require("./routes/userRoutes");
const LeadAssignmentRoutes = require("./routes/leadAssignmentRoutes");
const applyToJob = require("./routes/jobApplicationRoutes");

const app = express();

require("dotenv").config();
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(cors());
app.use(express.json());

app.use("/api/consultant", consultant);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api", jobRoutes);
app.use("/api", applyToJob);
app.use("/api/callhistory", CallHistoryRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/lead-assignment", LeadAssignmentRoutes);
app.use("/api", roleRoutes);

module.exports = app;
