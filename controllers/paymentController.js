const razorpay = require("../utils/razorpay");
const {
  Payment,
  Consultant,
  PlanVariant,
  Plan,
  PlanUpgradeHistory,
} = require("../models");
const sendEmail = require("../utils/mailer");
const paymentSuccessTemplate = require("../templates/paymentSuccessTemplate");
const paymentFailureTemplate = require("../templates/paymentFailureTemplate");

const moment = require("moment");

const createOrder = async (req, res) => {
  try {
    const { consultantId, planVariantId } = req.body;

    // 🛑 Validate request body
    if (!consultantId || !planVariantId) {
      return res
        .status(400)
        .json({ message: "consultantId and planVariantId are required." });
    }

    // ✅ Find the selected plan variant
    const variant = await PlanVariant.findByPk(planVariantId, {
      include: {
        model: require("../models").Plan,
        as: "plan",
      },
    });

    if (!variant) {
      return res.status(404).json({ message: "Plan variant not found." });
    }

    // ✅ Optional: Check if consultant exists
    const consultant = await Consultant.findByPk(consultantId);
    if (!consultant) {
      return res.status(404).json({ message: "Consultant not found." });
    }

    // ✅ Create Razorpay order
    const order = await razorpay.orders.create({
      amount: variant.price * 100, // Razorpay takes paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    // ✅ Save payment record in DB
    await Payment.create({
      consultantId,
      planVariantId,
      amount: variant.price,
      currency: "INR",
      razorpayOrderId: order.id,
      status: "created",
    });

    // ✅ Return order to frontend
    res.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan: {
        title: variant.plan?.title || "N/A",
        duration_days: variant.duration_days,
        price: variant.price,
      },
    });
  } catch (err) {
    console.error("Order creation failed:", err);
    res.status(500).json({ message: "Failed to create payment order" });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId } = req.body;

    // Step 1: Find the payment
    const payment = await Payment.findOne({ where: { razorpayOrderId } });
    if (!payment)
      return res.status(404).json({ message: "Payment record not found" });

    // Step 2: Mark payment as paid
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.status = "paid";
    await payment.save();

    // Step 3: Fetch consultant with current plan details
    const consultant = await Consultant.findByPk(payment.consultantId, {
      include: {
        model: PlanVariant,
        as: "planVariant",
        include: { model: Plan, as: "plan" },
      },
    });

    if (!consultant)
      return res.status(404).json({ message: "Consultant not found" });

    const currentVariant = consultant.planVariant;
    const currentPlan = currentVariant?.plan;

    // Step 4: Fetch the new plan variant and its plan
    const newVariant = await PlanVariant.findByPk(payment.planVariantId, {
      include: { model: Plan, as: "plan" },
    });

    if (!newVariant || !newVariant.plan) {
      return res.status(400).json({ message: "New plan variant not found" });
    }

    // Step 5: Upgrade Logic
    const currentPlanTitle = currentPlan?.title || "";
    const newPlanTitle = newVariant.plan.title;
    const currentDuration = currentVariant?.duration_days || 0;
    const newDuration = newVariant.duration_days;

    if (currentPlanTitle === "Premium" && newPlanTitle === "Standard") {
      return res.status(400).json({
        message: "Downgrade from Premium to Standard is not allowed.",
      });
    }

    if (currentPlanTitle === newPlanTitle && newDuration <= currentDuration) {
      return res.status(400).json({
        message:
          "Cannot downgrade or assign same/shorter duration variant in the same plan.",
      });
    }

    const now = moment();
    const purchasedAt = moment(consultant.planPurchasedAt || now);
    const daysUsed = now.diff(purchasedAt, "days");

    let remainingDays;
    if (currentPlanTitle !== newPlanTitle) {
      remainingDays = newDuration;
    } else {
      remainingDays = Math.max(newDuration - daysUsed, 0);
    }

    // Step 6: Update consultant plan
    const oldVariantId = currentVariant?.id || null;

    consultant.planVariantId = newVariant.id;
    consultant.planPurchasedAt = now.toDate();
    consultant.planExpiresAt = now.add(remainingDays, "days").toDate();
    await consultant.save();

    // Step 7: Log history
    await PlanUpgradeHistory.create({
      consultantId: consultant.id,
      oldPlanVariantId: oldVariantId,
      newPlanVariantId: newVariant.id,
      changedAt: new Date(),
    });

    // Step 8: Send success email
    const html = paymentSuccessTemplate({
      name: consultant.name || "Consultant",
      plan: newPlanTitle,
      duration: newDuration,
      amount: payment.amount,
    });

    if (consultant.email) {
      await sendEmail(
        consultant.email,
        "Payment Successful & Plan Upgraded",
        html
      );
    } else {
      console.warn("Consultant email not found, skipping email send.");
    }

    res
      .status(200)
      .json({ message: "Payment verified and plan upgraded successfully." });
  } catch (err) {
    console.error("Payment verification failed:", err);

    // Try sending failure email if consultant exists
    if (req.body.email) {
      const html = paymentFailureTemplate({ name: "Consultant" });
       await sendEmail(
        consultant.email,
        "Payment Failed",
        html
      );
    }

    res.status(500).json({
      message: "Payment verification or plan upgrade failed",
      error: err.message,
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
};
