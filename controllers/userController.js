const db = require("../models");
const User = db.User;
const Role = db.Role;
const sequelize = db.sequelize;
const bcrypt = require("bcrypt");

// ➕ Add new user
const AddUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { name, email, password, roleName } = req.body;

    if (!name || !email || !password || !roleName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    const role = await Role.findOne({ where: { name: roleName }, transaction });
    if (!role) {
      await transaction.rollback();
      return res.status(404).json({ message: "Role not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create(
      {
        name,
        email,
        password: hashedPassword,
        RoleId: role.id,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    console.error("Error adding user:", err);
    await transaction.rollback();
    res.status(500).json({ message: "Internal server error" });
  }
};

// 🔄 Update User Role
const UpdateUserRole = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { userId, roleName } = req.body;

    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    const role = await Role.findOne({ where: { name: roleName }, transaction });
    if (!role) {
      await transaction.rollback();
      return res.status(400).json({ message: "Role not found" });
    }

    user.RoleId = role.id;
    await user.save({ transaction });

    await transaction.commit();
    res.status(200).json({ message: "Role updated successfully", user });
  } catch (err) {
    console.error("Error updating user role:", err);
    await transaction.rollback();
    res.status(500).json({ message: "Internal server error" });
  }
};

// 🔍 Get all users with role
const AllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: {
        model: Role,
        attributes: ["name"],
      },
    });
    res.status(200).json({ users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 🔍 Get user by ID
const GetUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByPk(id, {
      include: {
        model: Role,
        attributes: ["name"],
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✏️ Update user (name, email, password, etc.)
const UpdateUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const id = req.params.id;
    const { name, email, password } = req.body;

    const user = await User.findByPk(id, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save({ transaction });
    await transaction.commit();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    console.error("Error updating user:", err);
    await transaction.rollback();
    res.status(500).json({ message: "Internal server error" });
  }
};

// ❌ Delete user
const DeleteUser = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.destroy();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  AddUser,
  UpdateUserRole,
  AllUsers,
  GetUserById,
  UpdateUser,
  DeleteUser,
};
