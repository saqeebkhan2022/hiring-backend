const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authenticate = require("../middleware/authMiddleware");
const { isAdmin ,isConsultant} = require("../middleware/roleMiddleware");

// Create Razorpay order
router.post("/create-order", authenticate, isConsultant, isAdmin, paymentController.createOrder);

// Verify payment and upgrade plan
router.post("/verify-payment", authenticate, isConsultant, isAdmin, paymentController.verifyPayment);

router.post("/failure", authenticate, isConsultant, isAdmin, paymentController.paymentFailure);


module.exports = router;
