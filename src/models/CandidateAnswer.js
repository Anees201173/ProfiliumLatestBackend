const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CandidateAnswer = sequelize.define(
    'CandidateAnswer',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      candidateTestId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      questionId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      optionId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      // store the raw answer: boolean, text, array of option ids, rating etc.
      answer: {
        type: DataTypes.JSON,
        allowNull: true
      }
    },
    {
      timestamps: true,
      tableName: 'candidate_answers'
    }
  );

  return CandidateAnswer;
};
