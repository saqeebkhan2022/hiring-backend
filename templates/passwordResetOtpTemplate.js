module.exports = ({ name, otp }) => `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2 style="color: #008080;">Password Reset Request</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>We received a request to reset your password. Please use the following One-Time Password (OTP) to proceed:</p>
    <h3 style="color: #008080; text-align: center; background-color: #f0f0f0; padding: 15px; border-radius: 5px;">${otp}</h3>
    <p>This OTP is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
    <br/>
    <p>Regards,<br/>DesertHire Team</p>
  </div>
`;
