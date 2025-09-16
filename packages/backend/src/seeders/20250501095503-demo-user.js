'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Helper functions to generate random user data
    const generateRandomName = () => {
      const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Robert', 'Lisa', 
        'Daniel', 'Olivia', 'James', 'Sophia', 'William', 'Emma', 'Richard', 'Ava', 
        'Thomas', 'Mia', 'Charles', 'Isabella', 'Joseph', 'Abigail', 'Christopher', 'Elizabeth'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
        'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson',
        'Martin', 'Lee', 'Thompson', 'White', 'Lopez', 'Lewis', 'Clark', 'Robinson'];
      
      return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    };
    
    const generateRandomEmail = (name) => {
      const nameParts = name.toLowerCase().split(' ');
      return `${nameParts[0]}.${nameParts[1]}${Math.floor(Math.random() * 1000)}@yopmail.com`;
    };
    
    const generateRandomPhone = () => {
      return `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
    };
    
    const roles = ['Admin', 'Project Manager', 'Technician'];
    
    // Generate 50 unique user records with distributed roles and UUIDs
    const users = Array(50).fill().map((_, index) => {
      const name = generateRandomName();
      const [firstName, lastName] = name.split(' ');
      let role;
      if (index < 5) {
        role = 'Admin';
      } else if (index < 15) {
        role = 'Project Manager';
      } else {
        role = 'Technician';
      }
      return {
        id: uuidv4(),
        first_name: firstName,
        last_name: lastName,
        email: generateRandomEmail(name),
        role: role,
        phone: generateRandomPhone(),
        deactivated_user: Math.random() > 0.9,
        password: null,
        is_verified: Math.random() > 0.2,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: null // or set to another UUID if you want to simulate relationships
      };
    });
    await queryInterface.bulkInsert('users', users);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
