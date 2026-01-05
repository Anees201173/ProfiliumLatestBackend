const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Job = sequelize.define(
    'Job',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true
      },
      type: {
        // e.g., full-time, part-time, contract
        type: DataTypes.STRING,
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      requirements: {
        type: DataTypes.JSON,
        allowNull: true
      },
      locationType: {
        // e.g., remote, onsite, hybrid
        type: DataTypes.STRING,
        allowNull: true
      },
      salary: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        // draft -> open -> paused/closed lifecycle
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'open',
        validate: {
          isIn: [["draft", "open", "paused", "closed"]]
        }
      },
      applicantsCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      experienceLevel: {
        type: DataTypes.STRING,
        allowNull: true
      },
      numberOfPositions: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1
      }
    },
    {
      timestamps: true,
      tableName: 'jobs'
    }
  );

  return Job;
};
