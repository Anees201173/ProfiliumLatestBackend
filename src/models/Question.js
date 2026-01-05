const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Question = sequelize.define(
    'Question',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      testId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM('boolean', 'single', 'multiple', 'rating', 'text'),
        allowNull: false,
        defaultValue: 'boolean'
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true
      }
    },
    {
      timestamps: true,
      tableName: 'questions'
    }
  );

  return Question;
};
