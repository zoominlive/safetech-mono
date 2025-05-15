'use strict';

const report = require('../models/report');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('projects', [
      {
        name: 'Flood Damage',
        site_name: 'Lakeside Property',
        site_email: 'contact@example.com',
        status: 'New',
        location_id: 1,
        report_id: 1,
        pm_id: 2,
        technician_id: 1,
        customer_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('projects', null, {});
  }
};
