const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CandidateSkill = sequelize.define(
    'CandidateSkill',
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
      skillId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      proficiency: {
        type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
        allowNull: true,
      },
      years: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      tableName: 'candidate_skills',
      indexes: [
        { unique: true, fields: ['candidateId', 'skillId'], name: 'uniq_candidate_skill' },
      ],
    }
  );

  return CandidateSkill;
};
