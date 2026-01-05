"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("options", {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      questionId: { type: Sequelize.UUID, allowNull: false },
      text: { type: Sequelize.STRING, allowNull: false },
      value: { type: Sequelize.FLOAT },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addConstraint("options", {
      fields: ["questionId"],
      type: "foreign key",
      name: "fk_options_question",
      references: { table: "questions", field: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface
      .removeConstraint("options", "fk_options_question")
      .catch(() => {});
    await queryInterface.dropTable("options");
  },
};
