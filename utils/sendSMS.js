require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;
const client = require("twilio")(accountSid, authToken);

const sendSms = async (phone, message) => {
  try {
    console.log(`Sending SMS to: ${phone}`);
    console.log(`Message: ${message}`);

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error("Twilio environment variables are missing.");
    }

    if (!phone.startsWith("+")) {
      throw new Error(
        `Invalid phone number format: ${phone}. It must be in E.164 format.`
      );
    }

    const messageResponse = await client.messages.create({
      body: message,
      from: fromNumber,
      to: phone,
    });

    console.log("Twilio Response:", messageResponse);
    return messageResponse.sid;
  } catch (error) {
    console.error("Twilio Error:", error);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
};

module.exports = sendSms;
