"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Change status column to ENUM
    try {
      await queryInterface.changeColumn("job_applications", "status", {
        type: Sequelize.ENUM("applied", "reviewed", "shortlisted", "rejected", "accepted"),
        allowNull: false,
        defaultValue: "applied",
      });
    } catch (e) {
      // If the column is already using the enum type or cannot be safely converted, ignore
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Revert ENUM to STRING
      await queryInterface.changeColumn("job_applications", "status", {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "applied",
      });
      // Remove ENUM type from DB (Postgres only)
      if (queryInterface.sequelize.getDialect() === "postgres") {
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_job_applications_status";');
      }
    } catch (e) {
      // Ignore failures on down migration
    }
  },
};
