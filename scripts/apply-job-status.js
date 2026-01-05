require('dotenv').config();
const { Sequelize } = require('sequelize');
const db = require('../src/models');

(async () => {
  try {
    // Ensure connection
    await db.sequelize.authenticate();
    const qi = db.sequelize.getQueryInterface();

    // Check if column already exists
    const table = await qi.describeTable('jobs');
    if (table && table.status) {
      console.log('Column "status" already exists on jobs. Nothing to do.');
      process.exit(0);
    }

    await qi.addColumn('jobs', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'open',
    });

    console.log('Added column "status" to jobs with default "open".');
    process.exit(0);
  } catch (err) {
    console.error('Failed to add status column to jobs:', err);
    process.exit(1);
  } finally {
    await db.sequelize.close();
  }
})();
