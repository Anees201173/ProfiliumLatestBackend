"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("pricing_plans", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      priceMonthly: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      priceYearly: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      jobPosts: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      aiMatchesPerMonth: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      teamMembers: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      prioritySupport: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      customBranding: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      aiAccess: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      advancedAnalytics: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      highlight: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("pricing_plans");
  },
};
