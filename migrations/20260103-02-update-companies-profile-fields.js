"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Optional contact email for the company
    try {
      await queryInterface.addColumn("companies", "email", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    } catch (e) {
      // ignore if column already exists
    }

    // Optional employees range / company size
    try {
      await queryInterface.addColumn("companies", "employees", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    } catch (e) {
      // ignore if column already exists
    }

    // Optional company description
    try {
      await queryInterface.addColumn("companies", "description", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    } catch (e) {
      // ignore if column already exists
    }

    // Optional logo URL (CDN/local path)
    try {
      await queryInterface.addColumn("companies", "logoUrl", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    } catch (e) {
      // ignore if column already exists
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("companies", "logoUrl").catch(() => {});
    await queryInterface.removeColumn("companies", "description").catch(() => {});
    await queryInterface.removeColumn("companies", "employees").catch(() => {});
    await queryInterface.removeColumn("companies", "email").catch(() => {});
  },
};
