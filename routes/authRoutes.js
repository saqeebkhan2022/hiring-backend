const express = require("express");
const router = express.Router();
const {
  login,
  forgotPassword,
  verifyTokenAndResetPassword,
} = require("../controllers/authController");

router.post("/login", login);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", verifyTokenAndResetPassword);

module.exports = router;
