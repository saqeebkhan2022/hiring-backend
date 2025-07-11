// app.js
const express = require("express");
const cors = require("cors");
const consultant = require("./routes/consultantRoutes");
const authRoutes = require("./routes/authRoutes");

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

module.exports = app;
