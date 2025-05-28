'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Helper functions to generate random data
    const generateRandomName = () => {
      const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Robert', 'Lisa', 
        'Daniel', 'Olivia', 'James', 'Sophia', 'William', 'Emma', 'Richard', 'Ava', 
        'Thomas', 'Mia', 'Charles', 'Isabella', 'Joseph', 'Abigail', 'Christopher', 'Elizabeth'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
        'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson',
        'Martin', 'Lee', 'Thompson', 'White', 'Lopez', 'Lewis', 'Clark', 'Robinson'];
      
      const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      
      return `${randomFirstName} ${randomLastName}`;
    };
    
    const generateRandomEmail = (name) => {
      const domains = ['yopmail.com', 'example.com'];
      const nameParts = name.toLowerCase().split(' ');
      const username = `${nameParts[0]}${Math.floor(Math.random() * 1000)}`;
      const domain = domains[Math.floor(Math.random() * domains.length)];
      
      return `${username}@${domain}`;
    };
    
    const generateRandomPhone = () => {
      const areaCode = Math.floor(Math.random() * 900) + 100;
      const prefix = Math.floor(Math.random() * 900) + 100;
      const lineNumber = Math.floor(Math.random() * 9000) + 1000;
      
      return `${areaCode}-${prefix}-${lineNumber}`;
    };
    
    // Generate 32 unique customer records with UUIDs
    const customers = Array(32).fill().map(() => {
      const name = generateRandomName();
      const [firstName, lastName] = name.split(' ');
      return {
        id: uuidv4(),
        first_name: firstName,
        last_name: lastName,
        email: generateRandomEmail(name),
        phone: generateRandomPhone(),
        status: Math.random() > 0.2, // 80% chance of being true
        created_at: new Date(),
        updated_at: new Date(),
      };
    });
    await queryInterface.bulkInsert('customers', customers);
    // Optionally return customers for use in other seeders
    return customers;
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('customers', null, {});
  }
};
