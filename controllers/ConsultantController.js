const db = require("../models");
const Consultant = db.Consultant;
const User = db.User;
const Role = db.Role;
const PlanVariant = db.PlanVariant;
const Plan = db.Plan;
const sequelize = db.sequelize;
const bcrypt = require("bcrypt");

const AddConsultant = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      name,
      email,
      password,
      company,
      phone,
      photo,
      aadhar,
      pan,
      signature,
      policeClearance,
      status,
    } = req.body;

    const existingUser = await User.findOne({ where: { email }, transaction });
    if (existingUser) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "User already exists with this email." });
    }

    // 🔑 1️⃣ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds

    const consultantRole = await Role.findOne({
      where: { name: "consultant" },
      transaction,
    });
    if (!consultantRole) {
      await transaction.rollback();
      return res.status(400).json({ message: "Role 'Consultant' not found." });
    }

    const user = await User.create(
      {
        name,
        email,
        password: hashedPassword,
        verified: true,
        RoleId: consultantRole.id,
      },
      { transaction }
    );

    // 4️⃣ Create Consultant linked to User
    const consultant = await Consultant.create(
      {
        name,
        email,
        company,
        phone,
        photo,
        aadhar,
        pan,
        signature,
        policeClearance,
        userId: user.id,
        status: status || "pending",
      },
      { transaction }
    );

    await transaction.commit();

    res.status(201).json({
      message: "Consultant and user created successfully.",
      user,
      consultant,
    });
  } catch (err) {
    console.error("Error adding consultant:", err);
    await transaction.rollback();
    res.status(500).json({ message: "Internal server error" });
  }
};

const AllConsultant = async (req, res) => {
  try {
    const consultants = await Consultant.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "name", "email", "verified"],
        },
        {
          model: PlanVariant,
          as: "planVariant",
          include: [
            {
              model: Plan,
              as: "plan",
            },
          ],
        },
      ],
    });

    res.status(200).json({ consultants });
  } catch (err) {
    console.error("Error fetching consultants:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const GetConsultantById = async (req, res) => {
  try {
    const consultant = await Consultant.findByPk(req.params.id, {
      include: {
        model: User,
        attributes: ["id", "name", "email", "verified"],
      },
    });

    if (!consultant) {
      return res.status(404).json({ message: "Consultant not found" });
    }

    res.status(200).json({ consultant });
  } catch (err) {
    console.error("Error fetching consultant:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const UpdateConsultant = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    const consultant = await Consultant.findByPk(id);
    if (!consultant) {
      return res.status(404).json({ message: "Consultant not found" });
    }

    await consultant.update(updates);
    res
      .status(200)
      .json({ message: "Consultant updated successfully", consultant });
  } catch (err) {
    console.error("Error updating consultant:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const DeleteConsultant = async (req, res) => {
  try {
    const id = req.params.id;

    const consultant = await Consultant.findByPk(id);
    if (!consultant) {
      return res.status(404).json({ message: "Consultant not found" });
    }

    await consultant.destroy();
    res.status(200).json({ message: "Consultant deleted successfully" });
  } catch (err) {
    console.error("Error deleting consultant:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const TotalConsultantCount = async (req, res) => {
  try {
    const count = await Consultant.count();
    res.status(200).json({ totalConsultants: count });
  } catch (err) {
    console.error("Error counting consultants:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const PendingConsultantCount = async (req, res) => {
  try {
    const count = await Consultant.count({ where: { status: "pending" } });
    res.status(200).json({ pendingConsultants: count });
  } catch (err) {
    console.error("Error counting pending consultants:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const ActiveConsultantCount = async (req, res) => {
  try {
    const count = await Consultant.count({ where: { status: "active" } });
    res.status(200).json({ activeConsultants: count });
  } catch (err) {
    console.error("Error counting active consultants:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const RejectedConsultantCount = async (req, res) => {
  try {
    const count = await Consultant.count({ where: { status: "rejected" } });
    res.status(200).json({ rejectedConsultants: count });
  } catch (err) {
    console.error("Error counting rejected consultants:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  AddConsultant,
  AllConsultant,
  GetConsultantById,
  UpdateConsultant,
  DeleteConsultant,
  TotalConsultantCount,
  PendingConsultantCount,
  ActiveConsultantCount,
  RejectedConsultantCount,
};
