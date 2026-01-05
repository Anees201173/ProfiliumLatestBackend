"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add status column with default 'active'
    await queryInterface.addColumn("companies", "status", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "active",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("companies", "status");
  },
};
