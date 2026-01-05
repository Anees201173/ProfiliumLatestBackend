"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add optional CV metadata columns to candidates
    try {
      await queryInterface.addColumn("candidates", "cvUrl", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    } catch (e) {
      // ignore if column already exists
    }

    try {
      await queryInterface.addColumn("candidates", "cvFileName", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    } catch (e) {
      // ignore if column already exists
    }

    try {
      await queryInterface.addColumn("candidates", "cvSize", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    } catch (e) {
      // ignore if column already exists
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("candidates", "cvSize").catch(() => {});
    await queryInterface.removeColumn("candidates", "cvFileName").catch(() => {});
    await queryInterface.removeColumn("candidates", "cvUrl").catch(() => {});
  },
};
