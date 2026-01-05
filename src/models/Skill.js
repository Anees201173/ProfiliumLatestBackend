const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Skill = sequelize.define(
    'Skill',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
    },
    {
      timestamps: true,
      tableName: 'skills',
      indexes: [
        { unique: true, fields: ['name'], name: 'uniq_skill_name' },
      ],
    }
  );

  return Skill;
};
