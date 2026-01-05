const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const JobApplication = sequelize.define(
    'JobApplication',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      jobId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      candidateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      // application status (applied, reviewed, shortlisted, rejected, accepted)
      status: {
        type: DataTypes.ENUM('applied', 'reviewed', 'shortlisted', 'rejected', 'accepted'),
        allowNull: false,
        defaultValue: 'applied',
      },
      coverLetter: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      appliedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: true,
      tableName: 'job_applications',
      indexes: [
        {
          unique: true,
          fields: ['jobId', 'candidateId'],
          name: 'uniq_job_candidate_application',
        },
        { fields: ['jobId'] },
        { fields: ['candidateId'] },
      ],
    }
  );

  return JobApplication;
};
