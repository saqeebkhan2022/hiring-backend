const twilio = require("twilio");
const { CallHistory, Consultant, PlanVariant } = require("../models");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// TwiML endpoint (must be exposed to the internet via ngrok)
const VOICE_URL = "https://8371e5057070.ngrok-free.app/api/call";

const makeCall = async (req, res) => {
  try {
    let { toNumber, name, consultantId, duration, notes } = req.body;

    if (!toNumber) {
      return res.status(400).json({ message: "Missing 'toNumber'" });
    }

    if (!toNumber.startsWith("+91")) {
      if (toNumber.startsWith("91")) {
        toNumber = `+${toNumber}`;
      } else {
        toNumber = `+91${toNumber}`;
      }
    }

    if (!/^\+?[1-9]\d{1,14}$/.test(toNumber)) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }

    const call = await client.calls.create({
      url: VOICE_URL, // TwiML instructions
      to: toNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
      statusCallback: `${process.env.BASE_URL}/api/calls/status`,
      statusCallbackEvent: ["completed"],
      statusCallbackMethod: "POST",
    });

    res.status(200).json({
      message: "Call initiated successfully",
      callSid: call.sid,
    });
  } catch (error) {
    console.error("Twilio Call Error:", error);
    res.status(500).json({ message: "Call failed", error: error.message });
  }
};

const endCall = async (req, res) => {
  try {
    const { toNumber, name, consultantId, duration, notes, callSid } = req.body;

    // Fetch consultant with their planVariant
    const consultant = await Consultant.findByPk(consultantId, {
      include: [{ model: PlanVariant, as: "planVariant" }],
    });

    if (!consultant || !consultant.planVariant) {
      return res.status(404).json({ message: "Consultant or plan not found" });
    }

    // Calculate call cost (₹1 per minute)
    const callCost = duration; // assuming duration is in minutes

    // Deduct call cost from consultant's call_credit_limit
    const newCallCredit =
      (consultant.planVariant.call_credit_limit || 0) - callCost;
    consultant.planVariant.call_credit_limit =
      newCallCredit >= 0 ? newCallCredit : 0;

    // Save updated planVariant
    await consultant.planVariant.save();

    // Save call details to CallHistory
    await CallHistory.create({
      name,
      phone: toNumber,
      status: "completed",
      callSid,
      consultantId,
      lastCall: new Date(),
      attempts: 1,
      duration,
      notes,
    });

    res.status(200).json({
      message: "Call ended successfully",
      callSid,
      remainingCallCredits: consultant.planVariant.call_credit_limit,
    });
  } catch (error) {
    console.error("Twilio Call Error:", error);
    res.status(500).json({ message: "Call failed", error: error.message });
  }
};

module.exports = { makeCall, endCall };
