"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create job_applications table
    await queryInterface.createTable("job_applications", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      jobId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "jobs", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      candidateId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "candidates", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      coverLetter: { type: Sequelize.TEXT, allowNull: true },
      appliedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.addConstraint('job_applications', {
      fields: ['jobId', 'candidateId'],
      type: 'unique',
      name: 'uniq_job_candidate_application'
    }).catch(() => {});

    // Add applicantsCount to jobs if not exists
    try {
      await queryInterface.addColumn('jobs', 'applicantsCount', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    } catch (e) { /* column may already exist */ }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("job_applications").catch(() => {});
    try {
      await queryInterface.removeColumn('jobs', 'applicantsCount');
    } catch (e) {}
  },
};
