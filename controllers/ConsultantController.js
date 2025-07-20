const db = require("../models");
const Consultant = db.Consultant;
const User = db.User;
const Role = db.Role;
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

    // 2️⃣ Find Consultant RoleId
    const consultantRole = await Role.findOne({
      where: { name: "Consultant" },
      transaction,
    });
    if (!consultantRole) {
      await transaction.rollback();
      return res.status(400).json({ message: "Role 'Consultant' not found." });
    }

    // 3️⃣ Create User with hashed password
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
      },
      { transaction }
    );

    // 5️⃣ Commit everything ✅
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

module.exports = {
  AddConsultant,
  AllConsultant,
};
