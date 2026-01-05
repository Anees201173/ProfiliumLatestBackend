"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('candidate_answers', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      candidateTestId: { type: Sequelize.UUID, allowNull: false },
      questionId: { type: Sequelize.UUID, allowNull: false },
      optionId: { type: Sequelize.UUID },
      answer: { type: Sequelize.JSON },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.addConstraint('candidate_answers', {
      fields: ['candidateTestId'],
      type: 'foreign key',
      name: 'fk_candidate_answers_candidate_test',
      references: { table: 'candidate_tests', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }).catch(()=>{});

    await queryInterface.addConstraint('candidate_answers', {
      fields: ['questionId'],
      type: 'foreign key',
      name: 'fk_candidate_answers_question',
      references: { table: 'questions', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }).catch(()=>{});

    await queryInterface.addConstraint('candidate_answers', {
      fields: ['optionId'],
      type: 'foreign key',
      name: 'fk_candidate_answers_option',
      references: { table: 'options', field: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    }).catch(()=>{});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('candidate_answers', 'fk_candidate_answers_option').catch(()=>{});
    await queryInterface.removeConstraint('candidate_answers', 'fk_candidate_answers_question').catch(()=>{});
    await queryInterface.removeConstraint('candidate_answers', 'fk_candidate_answers_candidate_test').catch(()=>{});
    await queryInterface.dropTable('candidate_answers');
  }
};
