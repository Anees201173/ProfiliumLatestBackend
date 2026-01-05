const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Test = sequelize.define(
    'Test',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      createdBy: {
        // user id (admin) who created the test
        type: DataTypes.INTEGER,
        allowNull: true
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      version: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true
      }
    },
    {
      timestamps: true,
      tableName: 'tests'
    }
  );

  return Test;
};
