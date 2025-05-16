'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Helper functions to generate random report data
    const generateRandomReportName = () => {
      const reportTypes = ['Damage Assessment', 'Flood Loss', 'Fire Damage', 'Water Damage', 
        'Mold Inspection', 'Structural Assessment', 'Insurance Claim', 'Restoration Plan'];
      const locations = ['Residential', 'Commercial', 'Industrial', 'Multi-family', 'Office', 'Retail'];
      
      const reportType = reportTypes[Math.floor(Math.random() * reportTypes.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      
      return `${reportType} - ${location} Property`;
    };
    
    const generateRandomAnswers = () => {
      const questionCount = Math.floor(Math.random() * 5) + 5; // 5-10 questions
      const answers = {};
      
      for (let i = 1; i <= questionCount; i++) {
        answers[`question${i}`] = `This is a detailed answer for question ${i} with some technical information and assessment details.`;
      }
      
      return JSON.stringify(answers);
    };
    
    const generateRandomPhotos = () => {
      const photoCount = Math.floor(Math.random() * 6) + 3; // 3-8 photos
      const photos = [];
      
      for (let i = 1; i <= photoCount; i++) {
        photos.push(`damage_photo_${Math.floor(Math.random() * 1000)}.jpg`);
      }
      
      return JSON.stringify(photos);
    };
    
    // Generate 80 unique report records
    const reports = Array(80).fill().map(() => {
      return {
        name: generateRandomReportName(),
        answers: generateRandomAnswers(),
        photos: generateRandomPhotos(),
        status: Math.random() > 0.1, // Status 1 or 0
        created_at: new Date(),
        updated_at: new Date(),
      };
    });
    
    await queryInterface.bulkInsert('reports', reports);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('reports', null, {});
  }
};
