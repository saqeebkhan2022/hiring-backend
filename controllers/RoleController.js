const db = require("../models");
const Role = db.Role;

// Create Role
const createRole = async (req, res) => {
  try {
    const { name } = req.body;

    const exists = await Role.findOne({ where: { name } });
    if (exists) {
      return res.status(400).json({ message: "Role already exists." });
    }

    const role = await Role.create({ name });
    res.status(201).json({ message: "Role created successfully.", role });
  } catch (error) {
    console.error("Error creating role:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get All Roles
const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.status(200).json({ roles });
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get Role by ID
const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: "Role not found." });
    }
    res.status(200).json(role);
  } catch (error) {
    console.error("Error fetching role:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Update Role
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: "Role not found." });
    }

    role.name = name;
    await role.save();

    res.status(200).json({ message: "Role updated successfully.", role });
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Delete Role
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: "Role not found." });
    }

    await role.destroy();
    res.status(200).json({ message: "Role deleted successfully." });
  } catch (error) {
    console.error("Error deleting role:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
};
