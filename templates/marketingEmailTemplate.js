module.exports = function marketingEmailTemplate({ name, content }) {
  return `
  <html>
    <body>
      <p>Hi ${name || "there"},</p>
      <div>${content}</div>
      <p>Regards,<br/>Deserthire Team</p>
    </body>
  </html>
  `;
};
