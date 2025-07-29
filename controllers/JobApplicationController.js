const { JobApplication } = require("../models");

const applyToJob = async (req, res) => {
  try {
    const { name, number, jobId, consultantId } = req.body;

    if (!name || !number || !jobId || !consultantId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const application = await JobApplication.create({
      name,
      number,
      jobId,
      consultantId,
    });

    return res.status(201).json({
      message: "Applied to job successfully.",
      application,
    });
  } catch (error) {
    console.error("Apply Job Error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  applyToJob,
};
