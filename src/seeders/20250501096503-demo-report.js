'use strict';
const { v4: uuidv4 } = require('uuid');

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
    
    // Get counts of available records to reference
    const [projects] = await queryInterface.sequelize.query('SELECT COUNT(id) as count FROM projects;');
    const [projectIds] = await queryInterface.sequelize.query('SELECT id FROM projects;');
    const [reportTemplates] = await queryInterface.sequelize.query('SELECT COUNT(id) as count FROM report_templates;');
    const [report_template_ids] = await queryInterface.sequelize.query('SELECT id FROM report_templates;');
    
    const projectCount = projects[0]?.count || 100; // Default to 100 if query fails
    const templateCount = reportTemplates[0]?.count || 10; // Default to 10 if query fails
    const projectIDs = projectIds.map(t => t.id);
    const reportTemplateIds = report_template_ids.map(t => t.id);

    // Generate 80 unique report records
    const reports = Array(80).fill().map(() => {
      const lossDate = new Date(new Date().setDate(new Date().getDate() - Math.floor(Math.random() * 90)));
      const assessmentDate = new Date(new Date().setDate(lossDate.getDate() + Math.floor(Math.random() * 14)));
      
      return {
        id: uuidv4(),
        name: generateRandomReportName(),
        project_id: projectIDs[Math.floor(Math.random() * projectIDs.length)],
        report_template_id: reportTemplateIds[Math.floor(Math.random() * reportTemplateIds.length)],
        assessment_due_to: ['Water Damage', 'Fire Damage', 'Mold', 'Storm Damage', 'Structural Issue'][Math.floor(Math.random() * 5)],
        date_of_loss: lossDate,
        date_of_assessment: assessmentDate,
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
