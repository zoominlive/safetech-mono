'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [
      {
        name: 'Joe',
        email: 'joe@yopmail.com',
        role: 'Technician',
        phone: '555-1234',
        deactivated_user: false,
        password: null,
        is_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Maddie',
        email: 'maddie@yopmail.com',
        role: 'Project Manager',
        phone: '555-1234',
        deactivated_user: false,
        password: null,
        is_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
