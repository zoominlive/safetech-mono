'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('customers', 'location_name');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('customers', 'location_name', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};
