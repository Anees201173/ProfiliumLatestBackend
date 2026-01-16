'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add personal details columns to users table
    await queryInterface.addColumn('users', 'firstName', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'lastName', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'gender', {
      type: Sequelize.ENUM('Male', 'Female', 'Other'),
      allowNull: true
    });

    await queryInterface.addColumn('users', 'dateOfBirth', {
      type: Sequelize.DATEONLY,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'dateOfBirth');
    await queryInterface.removeColumn('users', 'gender');
    await queryInterface.removeColumn('users', 'lastName');
    await queryInterface.removeColumn('users', 'firstName');
  }
};
