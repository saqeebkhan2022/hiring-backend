// controllers/CallController.js
const twilio = require("twilio");
const { CallHistory } = require("../models");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const makeCall = async (req, res) => {
  try {
    let { toNumber, name, consultantId } = req.body;

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
      url: "http://demo.twilio.com/docs/voice.xml",
      to: toNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
      statusCallback: `${process.env.BASE_URL}/api/calls/status`,
      statusCallbackEvent: ["completed"],
      statusCallbackMethod: "POST",
    });

    // Save initial call record
    await CallHistory.create({
      name,
      phone: toNumber,
      status: "initiated",
      callSid: call.sid,
      consultantId,
      lastCall: new Date(),
      attempts: 1, // first attempt
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

module.exports = { makeCall };
