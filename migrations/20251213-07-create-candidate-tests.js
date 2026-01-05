"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('candidate_tests', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      candidateId: { type: Sequelize.UUID, allowNull: false },
      testId: { type: Sequelize.UUID, allowNull: false },
      assignedBy: { type: Sequelize.UUID },
      assignedAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      status: { type: Sequelize.ENUM('assigned','in_progress','completed'), defaultValue: 'assigned' },
      score: { type: Sequelize.FLOAT },
      completedAt: { type: Sequelize.DATE },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.addConstraint('candidate_tests', {
      fields: ['candidateId'],
      type: 'foreign key',
      name: 'fk_candidate_tests_candidate',
      references: { table: 'candidates', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }).catch(()=>{});

    await queryInterface.addConstraint('candidate_tests', {
      fields: ['testId'],
      type: 'foreign key',
      name: 'fk_candidate_tests_test',
      references: { table: 'tests', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }).catch(()=>{});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('candidate_tests', 'fk_candidate_tests_test').catch(()=>{});
    await queryInterface.removeConstraint('candidate_tests', 'fk_candidate_tests_candidate').catch(()=>{});
    await queryInterface.dropTable('candidate_tests');
  }
};
