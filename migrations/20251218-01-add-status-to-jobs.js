"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add status column to jobs table
    await queryInterface
      .addColumn("jobs", "status", {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "open",
      })
      .catch(() => {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("jobs", "status").catch(() => {});
  },
};
