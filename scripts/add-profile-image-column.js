require('dotenv').config();

(async () => {
  try {
    const db = require('../src/models');
    const sequelize = db.sequelize;

    // Add column if it doesn't exist
    await sequelize.query('ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "profileImageUrl" TEXT;');

    // Ensure SequelizeMeta table exists
    await sequelize.query('CREATE TABLE IF NOT EXISTS "SequelizeMeta" ("name" VARCHAR(255) PRIMARY KEY);');

    // Insert migration record if not present
    const migrationName = '20251218-07-add-profile-image-to-candidates.js';
    await sequelize.query(
      'INSERT INTO "SequelizeMeta" ("name") VALUES ($1) ON CONFLICT ("name") DO NOTHING;',
      { bind: [migrationName] }
    );

    console.log('Profile image column ensured and migration marked as applied.');
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('Failed to add profile image column:', err);
    process.exit(1);
  }
})();
