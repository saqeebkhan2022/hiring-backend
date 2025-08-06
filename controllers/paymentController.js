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
const { Op, fn, col, literal } = require("sequelize");
const moment = require("moment");

const createOrder = async (req, res) => {
  try {
    const { consultantId, planVariantId, amount } = req.body;

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
      amount: amount, // Razorpay takes paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    // ✅ Save payment record in DB
    await Payment.create({
      consultantId,
      planVariantId,
      amount: amount,
      currency: "INR",
      razorpayOrderId: order.id,
      status: "pending",
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

    // Step 3: Fetch consultant and current plan details
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
    const currentPlanTitle = currentPlan?.title || "";
    const currentDuration = currentVariant?.duration_days || 0;

    // Step 4: Fetch the new plan variant
    const newVariant = await PlanVariant.findByPk(payment.planVariantId, {
      include: { model: Plan, as: "plan" },
    });

    if (!newVariant || !newVariant.plan) {
      return res.status(400).json({ message: "New plan variant not found" });
    }

    const newPlanTitle = newVariant.plan.title;
    const newDuration = newVariant.duration_days;

    const now = moment();
    const purchasedAt = moment(consultant.planPurchasedAt || now);
    const expiresAt = moment(consultant.planExpiresAt || now);
    const isExpired = now.isAfter(expiresAt);
    const daysUsed = now.diff(purchasedAt, "days");

    // ❌ Downgrade from Premium to Standard not allowed unless plan is expired
    if (
      !isExpired &&
      currentPlanTitle === "Premium" &&
      newPlanTitle === "Standard"
    ) {
      return res.status(400).json({
        message:
          "Downgrade from Premium to Standard is not allowed while current plan is active.",
      });
    }

    // ❌ Same plan & shorter/equal duration not allowed if not expired
    if (
      !isExpired &&
      currentPlanTitle === newPlanTitle &&
      newDuration <= currentDuration
    ) {
      return res.status(400).json({
        message:
          "Cannot assign same or shorter duration in the same plan while current plan is active.",
      });
    }

    // ✅ Calculate new duration
    let remainingDays;
    if (isExpired || currentPlanTitle !== newPlanTitle) {
      remainingDays = newDuration;
    } else {
      remainingDays = Math.max(newDuration - daysUsed, 0);
    }

    // Step 5: Update consultant plan
    const oldVariantId = currentVariant?.id || null;

    consultant.planVariantId = newVariant.id;
    consultant.planPurchasedAt = now.toDate();
    consultant.planExpiresAt = now.clone().add(remainingDays, "days").toDate();
    await consultant.save();

    // Step 6: Log history
    await PlanUpgradeHistory.create({
      consultantId: consultant.id,
      oldPlanVariantId: oldVariantId,
      newPlanVariantId: newVariant.id,
      changedAt: new Date(),
    });

    // Step 7: Send success email
    const html = paymentSuccessTemplate({
      name: consultant.name || "Consultant",
      plan: newPlanTitle,
      duration: newDuration,
      amount: payment.amount / 100,
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

    res.status(200).json({
      message: "Payment verified and plan upgraded successfully.",
      consultant: {
        id: consultant.id,
        name: consultant.name,
        email: consultant.email,
        role: "Consultant",
        verified: consultant.verified,
        loginBlocked: consultant.loginBlocked,
        plan: {
          title: newVariant.plan.title,
          duration_days: newDuration,
          call_access: newVariant.call_access,
          price: payment.amount,
        },
        planExpiry: consultant.planExpiresAt,
        consultantId: consultant.id,
      },
    });
  } catch (err) {
    console.error("Payment verification failed:", err);

    // Step 8: Attempt failure email
    if (req.body.email) {
      const html = paymentFailureTemplate({
        name: "Consultant",
        amount: Payment.amount,
      });
      await sendEmail(req.body.email, "Payment Failed", html);
    }

    res.status(500).json({
      message: "Payment verification or plan upgrade failed",
      error: err.message,
    });
  }
};

const paymentFailure = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      reason,
      description,
      source,
      step,
      code,
      email,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return res
        .status(400)
        .json({ message: "Missing payment/order ID in request." });
    }

    const payment = await Payment.findOne({ where: { razorpayOrderId } });

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    payment.razorpayPaymentId = razorpayPaymentId;
    payment.status = "failed";
    payment.failureReason = reason || "Unknown error";
    await payment.save();

    if (email) {
      const html = paymentFailureTemplate({
        name: "User",
        reason: reason || "Unknown",
      });

      await sendEmail(email, "Payment Failed", html);
    }

    res.status(200).json({ message: "Payment failure recorded." });
  } catch (err) {
    console.error("❌ Payment failure logging failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [
        {
          model: Consultant,
          attributes: ["name"],
        },
        {
          model: PlanVariant,
          include: [
            {
              model: Plan,
              as: "plan",
              attributes: ["title"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(payments);
  } catch (err) {
    console.error("GetAllPayments error:", err);
    res.status(500).json({ error: err.message });
  }
};

const getTotalPaid = async (req, res) => {
  try {
    const now = new Date();

    // 🔹 Current Month
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // 🔹 Previous Month
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // 🔸 This Month Total
    const thisMonthTotal = await Payment.sum("amount", {
      where: {
        status: "paid",
        createdAt: {
          [Op.gte]: startOfThisMonth,
          [Op.lt]: startOfNextMonth,
        },
      },
    });

    // 🔸 Last Month Total
    const lastMonthTotal = await Payment.sum("amount", {
      where: {
        status: "paid",
        createdAt: {
          [Op.gte]: startOfLastMonth,
          [Op.lte]: endOfLastMonth,
        },
      },
    });

    // 📈 Calculate Growth %
    let growth = 0;
    if (lastMonthTotal > 0) {
      growth = ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
    }

    res.status(200).json({
      totalPaid: thisMonthTotal || 0,
      growth: parseFloat(growth.toFixed(2)),
    });
  } catch (err) {
    console.error("GetTotalPaid error:", err);
    res.status(500).json({ error: err.message });
  }
};

const getMonthlyEarnings = async (req, res) => {
  try {
    const monthlyEarnings = await Payment.findAll({
      attributes: [
        // Group by first day of the month
        [fn("DATE_TRUNC", "month", col("createdAt")), "month"],
        [fn("SUM", col("amount")), "totalEarning"],
      ],
      where: {
        status: "paid", // Only include paid payments
      },
      group: [literal(`DATE_TRUNC('month', "createdAt")`)],
      order: [[literal(`month`), "ASC"]],
    });

    res.status(200).json(monthlyEarnings);
  } catch (error) {
    console.error("getMonthlyEarnings error:", error);
    res.status(500).json({ error: "Failed to fetch monthly earnings" });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  paymentFailure,
  getAllPayments,
  getTotalPaid,
  getMonthlyEarnings,
};
