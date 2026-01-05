"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("candidate_skills", {
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
      skillId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "skills", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      proficiency: {
        type: Sequelize.ENUM("beginner", "intermediate", "advanced", "expert"),
        allowNull: true,
      },
      years: {
        type: Sequelize.INTEGER,
        allowNull: true,
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

    await queryInterface
      .addIndex("candidate_skills", ["candidateId", "skillId"], {
        unique: true,
        name: "uniq_candidate_skill",
      })
      .catch(() => {});
  },

  async down(queryInterface) {
    await queryInterface.dropTable("candidate_skills").catch(() => {});
  },
};
