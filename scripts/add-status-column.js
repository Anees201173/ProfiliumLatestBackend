require('dotenv').config();

(async () => {
  try {
    const db = require('../src/models');
    const sequelize = db.sequelize;

    // Add column if it doesn't exist
    await sequelize.query('ALTER TABLE "job_applications" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT \'applied\';');

    // Ensure SequelizeMeta table exists
    await sequelize.query('CREATE TABLE IF NOT EXISTS "SequelizeMeta" ("name" VARCHAR(255) PRIMARY KEY);');

    // Insert migration record if not present
    const migrationName = '20251219-01-add-status-to-job-applications.js';
    await sequelize.query('INSERT INTO "SequelizeMeta" ("name") VALUES ($1) ON CONFLICT ("name") DO NOTHING;', { bind: [migrationName] });

    console.log('Status column ensured and migration marked as applied.');
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('Failed to add status column:', err);
    process.exit(1);
  }
})();
