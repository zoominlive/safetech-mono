'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Helper functions to generate random project data
    const generateRandomProjectName = () => {
      const projectTypes = ['Flood Recovery', 'Fire Restoration', 'Water Damage', 'Mold Remediation', 
        'Storm Damage', 'Structural Repair', 'Emergency Cleanup', 'Disaster Recovery'];
      const identifiers = ['Phase 1', 'Assessment', 'Restoration', 'Cleanup', 'Repair', 'Recovery', 'Renovation', 'Inspection'];
      
      const projectType = projectTypes[Math.floor(Math.random() * projectTypes.length)];
      const identifier = identifiers[Math.floor(Math.random() * identifiers.length)];
      
      return `${projectType} - ${identifier}`;
    };
    
    const generateRandomSiteName = () => {
      const propertyTypes = ['Residence', 'Office Building', 'Apartment Complex', 'Retail Store', 
        'Warehouse', 'Hospital', 'School', 'Hotel', 'Restaurant', 'Factory'];
      const locations = ['Downtown', 'Uptown', 'Suburban', 'Lakeside', 'Riverside', 'Beachfront', 'Mountain', 'Urban'];
      
      const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      
      return `${location} ${propertyType}`;
    };
    
    const generateRandomEmail = (siteName) => {
      const nameParts = siteName.toLowerCase().replace(/\s+/g, '-');
      return `contact-${nameParts}@example.com`;
    };
    
    const statuses = ['New', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];
    
    // Get counts of available records to reference
    const [customers] = await queryInterface.sequelize.query('SELECT COUNT(id) as count FROM customers;');
    const [locations] = await queryInterface.sequelize.query('SELECT COUNT(id) as count FROM locations;');
    const [reports] = await queryInterface.sequelize.query('SELECT COUNT(id) as count FROM reports;');
    const [pms] = await queryInterface.sequelize.query("SELECT COUNT(id) as count FROM users WHERE role = 'Project Manager';");
    const [technicians] = await queryInterface.sequelize.query("SELECT COUNT(id) as count FROM users WHERE role = 'Technician';");
    
    const customerCount = customers[0]?.count || 32; // Default to 32 if query fails
    const locationCount = locations[0]?.count || 50;
    const reportCount = reports[0]?.count || 80;
    const pmCount = pms[0]?.count || 10;
    const technicianCount = technicians[0]?.count || 35;
    
    // Generate 100 unique project records
    const projects = Array(100).fill().map(() => {
      const siteName = generateRandomSiteName();
      return {
        name: generateRandomProjectName(),
        site_name: siteName,
        site_email: generateRandomEmail(siteName),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        location_id: Math.floor(Math.random() * locationCount) + 1,
        report_id: Math.floor(Math.random() * reportCount) + 1,
        pm_id: Math.floor(Math.random() * pmCount) + 1,
        technician_id: Math.floor(Math.random() * technicianCount) + 1,
        customer_id: Math.floor(Math.random() * customerCount) + 1,
        created_at: new Date(),
        updated_at: new Date(),
      };
    });
    
    await queryInterface.bulkInsert('projects', projects);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('projects', null, {});
  }
};
