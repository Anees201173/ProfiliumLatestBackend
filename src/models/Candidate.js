const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Candidate = sequelize.define(
    'Candidate',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      businessSector: {
        type: DataTypes.STRING,
        allowNull: true
      },
      position: {
        type: DataTypes.STRING,
        allowNull: true
      },
      experienceYears: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      studyLevel: {
        type: DataTypes.STRING,
        allowNull: true
      },
      locationCountry: {
        type: DataTypes.STRING,
        allowNull: true
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true
      },
      // optional URL to a profile image (CDN/local)
      profileImageUrl: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      // optional CV metadata
      cvUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      cvFileName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      cvSize: {
        // store human-readable size string (e.g., "5.8 MB")
        type: DataTypes.STRING,
        allowNull: true,
      },
      // whether candidate has taken a psychometric test
      testTaken: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      // whether candidate passed the latest test
      testPassed: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      // timestamp of last test taken
      lastTestAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      // optional numeric score from last test
      lastScore: {
        type: DataTypes.FLOAT,
        allowNull: true
      }
    },
    {
      timestamps: true,
      tableName: 'candidates'
    }
  );

  return Candidate;
};
