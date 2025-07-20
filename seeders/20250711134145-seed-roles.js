"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("Roles", [
      {
        name: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "consultant",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "jobseeker",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Roles", {
      name: ["admin", "consultant", "jobseeker"],
    });
  },
};
