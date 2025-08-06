const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authenticate = require("../middleware/authMiddleware");
const {
  isAdmin,
  isConsultant,
  isAdminOrConsultant,
} = require("../middleware/roleMiddleware");

router.get(
  "/payment-history",
  authenticate,
  isAdmin,
  paymentController.getAllPayments
);

// Create Razorpay order
router.post(
  "/create-order",
  authenticate,
  isAdminOrConsultant,
  paymentController.createOrder
);

// Verify payment and upgrade plan
router.post(
  "/verify-payment",
  authenticate,
  isAdminOrConsultant,
  paymentController.verifyPayment
);

router.post(
  "/failure",
  authenticate,
  isAdminOrConsultant,
  paymentController.paymentFailure
);

router.get(
  "/total-paid",
  authenticate,
  isAdmin,
  paymentController.getTotalPaid
);

router.get(
  "/monthly-earnings",

  paymentController.getMonthlyEarnings
);

module.exports = router;
