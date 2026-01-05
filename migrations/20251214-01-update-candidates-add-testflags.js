"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // remove psychometricResponses if present
    await queryInterface.removeColumn('candidates', 'psychometricResponses').catch(()=>{});

    // add testTaken, testPassed, lastTestAt, lastScore
    await queryInterface.addColumn('candidates', 'testTaken', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }).catch(()=>{});

    await queryInterface.addColumn('candidates', 'testPassed', {
      type: Sequelize.BOOLEAN,
      allowNull: true
    }).catch(()=>{});

    await queryInterface.addColumn('candidates', 'lastTestAt', {
      type: Sequelize.DATE,
      allowNull: true
    }).catch(()=>{});

    await queryInterface.addColumn('candidates', 'lastScore', {
      type: Sequelize.FLOAT,
      allowNull: true
    }).catch(()=>{});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('candidates', 'lastScore').catch(()=>{});
    await queryInterface.removeColumn('candidates', 'lastTestAt').catch(()=>{});
    await queryInterface.removeColumn('candidates', 'testPassed').catch(()=>{});
    await queryInterface.removeColumn('candidates', 'testTaken').catch(()=>{});

    // restore psychometricResponses as JSON (no-op if already present)
    await queryInterface.addColumn('candidates', 'psychometricResponses', {
      type: Sequelize.JSON,
      allowNull: true
    }).catch(()=>{});
  }
};
