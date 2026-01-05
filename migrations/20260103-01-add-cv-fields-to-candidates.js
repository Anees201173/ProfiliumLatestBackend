"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Deprecated: CV fields are added in 20260102-01-add-cv-to-candidates.
    // This migration is now a no-op to avoid duplicate column errors.
    return Promise.resolve();
  },

  async down(queryInterface, Sequelize) {
    // No-op: we don't drop CV columns here since they are managed by 20260102-01.
    return Promise.resolve();
  },
};
