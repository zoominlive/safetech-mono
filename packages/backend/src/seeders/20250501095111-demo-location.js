'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Get all customer UUIDs
    const [customers] = await queryInterface.sequelize.query('SELECT id FROM customers;');
    // Helper function to generate random address
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
    // Generate 2-4 locations per customer
    const locations = customers.flatMap(customer => {
      const numLocations = Math.floor(Math.random() * 3) + 2;
      return Array(numLocations).fill().map(() => {
        const addr = generateRandomAddress();
        return {
          id: uuidv4(),
          name: `${addr.city} Location`,
          address_line_1: addr.addressLine1,
          address_line_2: addr.addressLine2,
          city: addr.city,
          province: addr.province,
          postal_code: addr.postalCode,
          customer_id: customer.id,
          active: Math.random() > 0.1,
          created_at: new Date(),
          updated_at: new Date(),
        };
      });
    });
    await queryInterface.bulkInsert('locations', locations);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('locations', null, {});
  }
};
