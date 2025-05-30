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
    
    const generateRandomAddress = () => {
      const addressLine1 = `${Math.floor(Math.random() * 9999) + 1} Main St`;
      const addressLine2 = Math.random() > 0.5 ? `Suite ${Math.floor(Math.random() * 1000)}` : null;
      const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 
        'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'San Francisco',
        'Charlotte', 'Indianapolis', 'Seattle', 'Denver', 'Washington DC', 'Boston', 'Portland', 'Las Vegas'];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const provinces = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'OH', 'NC', 'IN', 'WA', 'CO', 'MA', 'OR', 'NV'];
      const province = provinces[Math.floor(Math.random() * provinces.length)];
      const postalCode = `${Math.floor(Math.random() * 90000) + 10000}`;
      return { addressLine1, addressLine2, city, province, postalCode };
    };
    
    // Generate 32 unique customer records with UUIDs
    const customers = Array(32).fill().map(() => {
      const name = generateRandomName();
      const [firstName, lastName] = name.split(' ');
      const addr = generateRandomAddress();
      // Add a random location_name for demo purposes
      const locationNames = [
        'Head Office', 'Branch A', 'Branch B', 'Warehouse', 'Regional Office',
        'Downtown', 'Uptown', 'Eastside', 'Westside', 'Northside', 'Southside',
        'Annex', 'Satellite', 'Distribution Center', 'Main Campus', 'Remote Site'
      ];
      const location_name = locationNames[Math.floor(Math.random() * locationNames.length)];
      return {
        id: uuidv4(),
        first_name: firstName,
        last_name: lastName,
        email: generateRandomEmail(name),
        phone: generateRandomPhone(),
        address_line_1: addr.addressLine1,
        address_line_2: addr.addressLine2,
        city: addr.city,
        province: addr.province,
        postal_code: addr.postalCode,
        location_name, // new field for demo data
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
