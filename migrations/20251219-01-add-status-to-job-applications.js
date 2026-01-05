"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('job_applications', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'applied',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('job_applications', 'status');
  }
};
