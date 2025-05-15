'use strict';

const report = require('../models/report');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('reports', [
      {
        name: 'Flood Loss Management',
        answers: JSON.stringify({
          question1: 'Answer 1',
          question2: 'Answer 2',
        }),
        photos: JSON.stringify([
          'photo1.jpg',
          'photo2.jpg',
        ]),
        status: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('reports', null, {});
  }
};
