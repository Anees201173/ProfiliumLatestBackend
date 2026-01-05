const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Option = sequelize.define(
    'Option',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      questionId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      text: {
        type: DataTypes.STRING,
        allowNull: false
      },
      // numeric value or score associated with this option (optional)
      value: {
        type: DataTypes.FLOAT,
        allowNull: true
      }
    },
    {
      timestamps: true,
      tableName: 'options'
    }
  );

  return Option;
};
