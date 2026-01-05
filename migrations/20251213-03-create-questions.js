"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create table only if it does not exist yet
    const tables = await queryInterface.sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'questions';",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const hasQuestionsTable = tables.length > 0;

    if (!hasQuestionsTable) {
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
    }

    // Add FK constraint only if it does not exist yet
    await queryInterface.sequelize.query(
      `DO $$
       BEGIN
         IF NOT EXISTS (
           SELECT 1 FROM pg_constraint WHERE conname = 'fk_questions_test'
         ) THEN
           ALTER TABLE "questions"
           ADD CONSTRAINT "fk_questions_test" FOREIGN KEY ("testId")
           REFERENCES "tests" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
         END IF;
       END$$;`
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('questions', 'fk_questions_test').catch(()=>{});
    await queryInterface.dropTable('questions');
  }
};
