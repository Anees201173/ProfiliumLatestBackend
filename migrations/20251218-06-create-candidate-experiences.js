"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("candidate_experiences", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      candidateId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "candidates", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      companyName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      jobTitle: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      startDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      endDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      isCurrent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      achievements: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      technologies: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Array of strings',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex("candidate_experiences", ["candidateId"], {
      name: "idx_candidate_experiences_candidate",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("candidate_experiences");
  },
};
