"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // add role to users (idempotent: skip if column already exists)
    const table = await queryInterface.describeTable('users');
    if (!table.role) {
      await queryInterface.addColumn('users', 'role', {
        type: Sequelize.ENUM('candidate','admin','company'),
        allowNull: false,
        defaultValue: 'candidate',
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // remove role enum column
    await queryInterface.removeColumn('users', 'role');
    // optionally drop enum type (Postgres) - left to DB cleanup if needed
  }
};
