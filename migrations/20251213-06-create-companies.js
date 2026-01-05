"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('companies', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      userId: { type: Sequelize.UUID, allowNull: false },
      companyName: { type: Sequelize.STRING, allowNull: false },
      websiteUrl: { type: Sequelize.STRING },
      industry: { type: Sequelize.STRING },
      country: { type: Sequelize.STRING },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.addConstraint('companies', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'fk_companies_user',
      references: { table: 'users', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }).catch(()=>{});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('companies', 'fk_companies_user').catch(()=>{});
    await queryInterface.dropTable('companies');
  }
};
