const db = require("../models");
const Consultant = db.Consultant;
const User = db.User;

const AddConsultant = async (req, res) => {
  try {
    const {
      name,
      email,
      company,
      phone,
      photo,
      aadhar,
      pan,
      signature,
      policeClearance,
      userId,
    } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const exists = await Consultant.findOne({ where: { UserId: userId } });
    if (exists) return res.status(400).json({ message: "Already exists" });

    const consultant = await Consultant.create({
      name,
      email,
      company,
      phone,
      photo,
      aadhar,
      pan,
      signature,
      policeClearance,
      UserId: userId,
    });

    res.status(201).json({ message: "Created", consultant });
  } catch (err) {
    console.error("Error adding consultant:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const AllConsultant = async (req, res) => {
  try {
    const consultants = await Consultant.findAll({
      include: {
        model: User,
        attributes: ["id", "name", "email", "verified"],
      },
    });

    res.status(200).json({ consultants });
  } catch (err) {
    console.error("Error fetching consultants:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.default = { AddConsultant, AllConsultant };
