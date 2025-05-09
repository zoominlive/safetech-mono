'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('locations', [
      {
        name: 'test loc 1',
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'test loc 2',
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('locations', null, {});
  }
};
