"use strict";
const bcrypt = require("bcryptjs");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // ✅ Find the 'admin' role ID
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id FROM "Roles" WHERE name = 'admin' LIMIT 1;`
    );

    const adminRoleId = roles[0]?.id;
    if (!adminRoleId) {
      throw new Error("Admin role not found. Please seed roles first.");
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    return queryInterface.bulkInsert("Users", [
      {
        name: "Admin",
        email: "admin@deserthiring.com",
        password: hashedPassword,
        verified: true,
        RoleId: adminRoleId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Users", {
      email: "admin@deserthiring.com",
    });
  },
};
