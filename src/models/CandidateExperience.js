const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CandidateExperience = sequelize.define(
    'CandidateExperience',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      candidateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      companyName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      jobTitle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      isCurrent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      achievements: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      technologies: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Array of strings, e.g., ["Node.js", "React"]',
      },
    },
    {
      timestamps: true,
      tableName: 'candidate_experiences',
      indexes: [
        { fields: ['candidateId'] },
        { fields: ['startDate'] },
      ],
    }
  );

  return CandidateExperience;
};
