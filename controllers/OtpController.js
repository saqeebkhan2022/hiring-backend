const { Otp } = require("../models");

// save
await Otp.create({
  tempId,
  phoneOtp,
  emailOtp,
  aadharOtp,
  panOtp,
  expiry: new Date(Date.now() + 10 * 60 * 1000),
});

// verify
const storedOtp = await Otp.findOne({ where: { tempId } });
if (!storedOtp || storedOtp.expiry < Date.now()) {
  return res.status(400).json({ message: "Invalid or expired OTP" });
}
