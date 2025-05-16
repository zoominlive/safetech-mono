'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Helper function to generate random location names
    const generateRandomLocation = () => {
      const locationTypes = ['Office', 'Warehouse', 'Retail Store', 'Construction Site', 'Residential Building', 'Hospital'];
      const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 
        'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'San Francisco',
        'Charlotte', 'Indianapolis', 'Seattle', 'Denver', 'Washington DC', 'Boston', 'Portland', 'Las Vegas'];
      
      const locationType = locationTypes[Math.floor(Math.random() * locationTypes.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      
      return `${locationType} - ${city}`;
    };
    
    // Generate 50 unique location records
    const locations = Array(50).fill().map(() => {
      return {
        name: generateRandomLocation(),
        active: Math.random() > 0.1, // 90% chance of being active
        created_at: new Date(),
        updated_at: new Date(),
      };
    });
    
    await queryInterface.bulkInsert('locations', locations);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('locations', null, {});
  }
};
