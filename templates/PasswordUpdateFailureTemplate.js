module.exports = ({ name }) => `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2 style="color: red;">⚠️ Password Update Failed</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>We encountered an issue while trying to update your password. Your password remains unchanged.</p>
    <p>Please try again or contact support if the problem persists.</p>
    <br/>
    <p>Regards,<br/>DesertHire Team</p>
  </div>
`;
