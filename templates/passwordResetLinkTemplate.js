// utils/templates/passwordResetLinkTemplate.js
module.exports = function passwordResetLinkTemplate({ name, resetUrl }) {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Password Reset</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 8px;">
        <tr>
          <td style="text-align: center;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p style="color: #555; font-size: 16px;">
              Hi ${name || "User"},
              <br><br>
              You recently requested to reset your password. Click the button below to reset it:
            </p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 20px; margin: 20px 0; background-color: #008080; color: white; text-decoration: none; font-size: 16px; border-radius: 5px;">
              Reset Password
            </a>
            <p style="color: #555; font-size: 14px;">
              If you did not request a password reset, please ignore this email.
            </p>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
};
