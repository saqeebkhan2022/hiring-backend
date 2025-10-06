const { EmailCampaign, EmailRecipient } = require("../models");
const XLSX = require("xlsx");
const sendEmail = require("../utils/sendEmail"); // Function to send email
const marketingEmailTemplate = require("../utils/templates/marketingEmailTemplate");

// Create campaign
exports.createCampaign = async (req, res) => {
  try {
    const { name, subject, content } = req.body;
    const campaign = await EmailCampaign.create({ name, subject, content });
    res.status(201).json({ message: "Campaign created", campaign });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating campaign", error: error.message });
  }
};

// Upload recipients Excel
exports.uploadRecipients = async (req, res) => {
  try {
    const { campaignId } = req.body;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet); // [{ Name: "John", Email: "john@example.com" }, ...]

    const recipients = data.map((row) => ({
      campaignId,
      name: row.Name,
      email: row.Email,
    }));

    await EmailRecipient.bulkCreate(recipients);
    res.status(200).json({ message: "Recipients uploaded", count: recipients.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error uploading recipients", error: error.message });
  }
};

// Send campaign emails
exports.sendCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const campaign = await EmailCampaign.findByPk(campaignId, { include: "recipients" });
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    for (let recipient of campaign.recipients) {
      const html = marketingEmailTemplate({ name: recipient.name, content: campaign.content });
      await sendEmail({ to: recipient.email, subject: campaign.subject, html });

      // Update recipient as sent
      await recipient.update({ sent: true, sentAt: new Date() });
    }

    await campaign.update({ status: "sent", sentAt: new Date() });
    res.status(200).json({ message: "Campaign sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending campaign", error: error.message });
  }
};
