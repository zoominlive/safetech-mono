'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('customers', [
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234',
        status: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '555-5678',
        status: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('customers', null, {});
  }
};
