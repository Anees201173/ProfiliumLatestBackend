"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // add role to users (if not exists)
    try {
      await queryInterface.addColumn('users', 'role', {
        type: Sequelize.ENUM('candidate','admin','company'),
        allowNull: false,
        defaultValue: 'candidate'
      });
    } catch (e) {
      // ignore if column already exists
    }

    // candidates
    await queryInterface.createTable('candidates', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
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

    // companies
    await queryInterface.createTable('companies', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      userId: { type: Sequelize.UUID, allowNull: false },
      companyName: { type: Sequelize.STRING, allowNull: false },
      websiteUrl: { type: Sequelize.STRING },
      industry: { type: Sequelize.STRING },
      country: { type: Sequelize.STRING },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // tests
    await queryInterface.createTable('tests', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      createdBy: { type: Sequelize.UUID },
      isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
      version: { type: Sequelize.INTEGER, defaultValue: 1 },
      metadata: { type: Sequelize.JSON },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // questions
    await queryInterface.createTable('questions', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      testId: { type: Sequelize.UUID, allowNull: false },
      text: { type: Sequelize.TEXT, allowNull: false },
      type: { type: Sequelize.ENUM('boolean','single','multiple','rating','text'), allowNull: false, defaultValue: 'boolean' },
      order: { type: Sequelize.INTEGER },
      metadata: { type: Sequelize.JSON },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // options
    await queryInterface.createTable('options', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      questionId: { type: Sequelize.UUID, allowNull: false },
      text: { type: Sequelize.STRING, allowNull: false },
      value: { type: Sequelize.FLOAT },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // candidate_tests
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

    // candidate_answers
    await queryInterface.createTable('candidate_answers', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      candidateTestId: { type: Sequelize.UUID, allowNull: false },
      questionId: { type: Sequelize.UUID, allowNull: false },
      optionId: { type: Sequelize.UUID },
      answer: { type: Sequelize.JSON },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // add simple foreign keys where useful (ignore if they already exist)
    try {
      await queryInterface.addConstraint('questions', {
        fields: ['testId'],
        type: 'foreign key',
        name: 'fk_questions_test',
        references: { table: 'tests', field: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    } catch (e) {}

    try {
      await queryInterface.addConstraint('options', {
        fields: ['questionId'],
        type: 'foreign key',
        name: 'fk_options_question',
        references: { table: 'questions', field: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    } catch (e) {}

    try {
      await queryInterface.addConstraint('candidate_tests', {
        fields: ['candidateId'],
        type: 'foreign key',
        name: 'fk_candidate_tests_candidate',
        references: { table: 'candidates', field: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    } catch (e) {}

    try {
      await queryInterface.addConstraint('candidate_tests', {
        fields: ['testId'],
        type: 'foreign key',
        name: 'fk_candidate_tests_test',
        references: { table: 'tests', field: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    } catch (e) {}

    try {
      await queryInterface.addConstraint('candidate_answers', {
        fields: ['candidateTestId'],
        type: 'foreign key',
        name: 'fk_candidate_answers_candidate_test',
        references: { table: 'candidate_tests', field: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    } catch (e) {}

    try {
      await queryInterface.addConstraint('candidate_answers', {
        fields: ['questionId'],
        type: 'foreign key',
        name: 'fk_candidate_answers_question',
        references: { table: 'questions', field: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    } catch (e) {}

    try {
      await queryInterface.addConstraint('candidate_answers', {
        fields: ['optionId'],
        type: 'foreign key',
        name: 'fk_candidate_answers_option',
        references: { table: 'options', field: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      });
    } catch (e) {}
  },

  async down(queryInterface, Sequelize) {
    // drop in reverse order
    await queryInterface.removeConstraint('candidate_answers', 'fk_candidate_answers_option').catch(()=>{});
    await queryInterface.removeConstraint('candidate_answers', 'fk_candidate_answers_question').catch(()=>{});
    await queryInterface.removeConstraint('candidate_answers', 'fk_candidate_answers_candidate_test').catch(()=>{});
    await queryInterface.removeConstraint('candidate_tests', 'fk_candidate_tests_test').catch(()=>{});
    await queryInterface.removeConstraint('candidate_tests', 'fk_candidate_tests_candidate').catch(()=>{});
    await queryInterface.removeConstraint('options', 'fk_options_question').catch(()=>{});
    await queryInterface.removeConstraint('questions', 'fk_questions_test').catch(()=>{});

    await queryInterface.dropTable('candidate_answers').catch(()=>{});
    await queryInterface.dropTable('candidate_tests').catch(()=>{});
    await queryInterface.dropTable('options').catch(()=>{});
    await queryInterface.dropTable('questions').catch(()=>{});
    await queryInterface.dropTable('tests').catch(()=>{});
    await queryInterface.dropTable('companies').catch(()=>{});
    await queryInterface.dropTable('candidates').catch(()=>{});

    // remove role column from users
    try {
      await queryInterface.removeColumn('users', 'role');
    } catch (e) {}
  }
};
