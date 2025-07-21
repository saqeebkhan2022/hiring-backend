const { Lead, Job, Consultant } = require("../models");

const getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.findAll({
      attributes: [
        "id",
        "name",
        "phone",
        "email",
        "position",
        "status",
        "documents",
        "jobId",
        "consultantId",
      ],
      include: [
        { model: Job, attributes: ["title"] },
        { model: Consultant, attributes: ["name"] },
      ],
    });

    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const assignLeadsToConsultant = async (req, res) => {
  try {
    const { consultantId, applicantIds } = req.body;

    if (
      !consultantId ||
      !Array.isArray(applicantIds) ||
      applicantIds.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Consultant ID and applicant IDs are required." });
    }

    await Lead.update({ consultantId }, { where: { id: applicantIds } });

    res.status(200).json({
      message: "Leads successfully assigned to consultant.",
      consultantId,
      updatedLeads: applicantIds,
    });
  } catch (error) {
    console.error("Error assigning leads:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllLeads,
  assignLeadsToConsultant,
};
