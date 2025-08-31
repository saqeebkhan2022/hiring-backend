module.exports = ({ name, plan, amount, duration }) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; max-width: 600px; margin: auto; background-color: #f9f9f9; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
    <div style="background-color: #4caf50; padding: 16px; border-radius: 8px 8px 0 0; text-align: center;">
      <h2 style="color: #fff; margin: 0;">Payment Successful</h2>
    </div>

    <div style="background-color: #ffffff; padding: 24px;">
      <p style="font-size: 16px; color: #333;">Dear <strong>${name}</strong>,</p>
      
      <p style="font-size: 15px; color: #555; line-height: 1.6;">
        We are pleased to confirm that your payment of <strong>₹${amount}</strong> for the <strong>${plan}</strong> plan has been received successfully.
      </p>

      <p style="font-size: 15px; color: #555; line-height: 1.6;">
        Your subscription is now active and will remain valid for the next <strong>${duration} days</strong>.
      </p>

      <p style="font-size: 15px; color: #555; line-height: 1.6;">
        You now have access to all the features and benefits included in your plan. We’re excited to have you on board and look forward to supporting your journey with us.
      </p>

      <p style="font-size: 15px; color: #555;">If you have any questions or need assistance, feel free to reply to this email.</p>

      <br/>
      <p style="font-size: 15px; color: #333;">Best regards,</p>
      <p style="font-weight: bold; color: #333;">The DesertHire Team</p>
    </div>

    <div style="text-align: center; font-size: 12px; color: #aaa; padding-top: 20px;">
      © ${new Date().getFullYear()} DesertHire. All rights reserved.
    </div>
  </div>
`;
