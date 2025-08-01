module.exports = ({ name, amount }) => `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2 style="color: red;">⚠️ Payment Failed</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>We noticed that your payment of <strong>₹${amount}</strong> was unsuccessful.</p>
    <p>Please try again or contact support if the issue persists.</p>
    <br/>
    <p>Regards,<br/>ExactHire Team</p>
  </div>
`;
