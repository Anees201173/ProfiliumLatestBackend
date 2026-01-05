"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('candidates', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      userId: { type: Sequelize.UUID, allowNull: false },
      businessSector: { type: Sequelize.STRING },
      position: { type: Sequelize.STRING },
      experienceYears: { type: Sequelize.INTEGER },
      studyLevel: { type: Sequelize.STRING },
      locationCountry: { type: Sequelize.STRING },
      phoneNumber: { type: Sequelize.STRING },
      psychometricResponses: { type: Sequelize.JSON },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // optionally add FK to users if users table exists
    await queryInterface.addConstraint('candidates', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'fk_candidates_user',
      references: { table: 'users', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }).catch(()=>{});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('candidates', 'fk_candidates_user').catch(()=>{});
    await queryInterface.dropTable('candidates');
  }
};
