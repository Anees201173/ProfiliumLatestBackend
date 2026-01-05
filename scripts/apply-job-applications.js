require('dotenv').config();
const { Sequelize } = require('sequelize');
const db = require('../src/models');

(async () => {
  try {
    await db.sequelize.authenticate();
    const qi = db.sequelize.getQueryInterface();

    // Add applicantsCount to jobs if missing
    const jobsDesc = await qi.describeTable('jobs');
    if (!jobsDesc.applicantsCount) {
      await qi.addColumn('jobs', 'applicantsCount', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
      console.log('Added applicantsCount to jobs');
    } else {
      console.log('jobs.applicantsCount already exists');
    }

    // Create job_applications table if not exists
    let needCreate = false;
    try {
      await qi.describeTable('job_applications');
      console.log('job_applications table already exists');
    } catch (e) {
      needCreate = true;
    }

    if (needCreate) {
      await qi.createTable('job_applications', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        jobId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'jobs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
        candidateId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'candidates', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
        coverLetter: { type: Sequelize.TEXT, allowNull: true },
        appliedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      });
      // unique index on (jobId, candidateId)
      await qi.addConstraint('job_applications', {
        fields: ['jobId', 'candidateId'],
        type: 'unique',
        name: 'uniq_job_candidate_application',
      });
      console.log('Created job_applications table with unique constraint');
    }

    console.log('Schema updated for job applications feature.');
    process.exit(0);
  } catch (err) {
    console.error('Failed updating schema for job applications:', err);
    process.exit(1);
  } finally {
    await db.sequelize.close();
  }
})();
