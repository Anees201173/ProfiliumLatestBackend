const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CandidateTest = sequelize.define(
    'CandidateTest',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      candidateId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      testId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      assignedBy: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      assignedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      status: {
        type: DataTypes.ENUM('assigned', 'in_progress', 'completed'),
        defaultValue: 'assigned'
      },
      score: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      timestamps: true,
      tableName: 'candidate_tests'
    }
  );

  return CandidateTest;
};
