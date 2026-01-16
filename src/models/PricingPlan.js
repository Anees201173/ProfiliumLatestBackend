const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PricingPlan = sequelize.define(
    'PricingPlan',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      priceMonthly: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      priceYearly: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      jobPosts: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      aiMatchesPerMonth: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      teamMembers: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      prioritySupport: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      customBranding: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      aiAccess: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      advancedAnalytics: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      highlight: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      timestamps: true,
      tableName: 'pricing_plans',
    }
  );

  return PricingPlan;
};
