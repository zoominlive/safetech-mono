'use strict';
const { v4: uuidv4 } = require('uuid');

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
    
    const generateRandomContactName = () => {
      const firstNames = ['James', 'Robert', 'John', 'Michael', 'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Susan'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Wilson', 'Taylor'];
      return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    };
    
    const generateRandomContactTitle = () => {
      const titles = ['Property Manager', 'Building Owner', 'Facility Manager', 'Maintenance Supervisor', 
                     'Site Administrator', 'Resident', 'Business Owner', 'Property Administrator'];
      return titles[Math.floor(Math.random() * titles.length)];
    };
    
    const generateProjectNumber = () => {
      const year = new Date().getFullYear();
      const randomNumber = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
      return `PRJ-${year}-${randomNumber}`;
    };
    
    const generateSpecificLocation = () => {
      const locations = ['Ground Floor', 'First Floor', 'Second Floor', 'Third Floor', 'Basement', 
                        'Roof', 'Parking Garage', 'Lobby', 'Conference Room', 'Office Suite', 
                        'Storage Room', 'Kitchen', 'Bathroom', 'Hallway', 'Elevator Shaft'];
      return locations[Math.floor(Math.random() * locations.length)];
    };
    
    const statuses = ['New', 'In Progress', 'PM Review', 'Complete'];
    
    // Get available records to reference instead of just counts
    const [customers] = await queryInterface.sequelize.query('SELECT id FROM customers;');
    const [locations] = await queryInterface.sequelize.query('SELECT id, customer_id FROM locations;');
    const [reportTemplates] = await queryInterface.sequelize.query('SELECT id FROM report_templates;');
    const [pms] = await queryInterface.sequelize.query("SELECT id FROM users WHERE role = 'Project Manager';");
    const [technicians] = await queryInterface.sequelize.query("SELECT id FROM users WHERE role = 'Technician';");
    
    // Default to empty arrays if no records found
    const customerIds = customers.map(c => c.id);
    const locationIds = locations.map(l => l.id);
    const templateIds = reportTemplates.map(t => t.id);
    const pmIds = pms.map(p => p.id);
    const technicianIds = technicians.map(t => t.id);
    
    // Generate random projects only if we have the required related entities
    const projectCount = Math.min(100, 
      customerIds.length ? 100 : 0,
      locationIds.length ? 100 : 0,
      templateIds.length ? 100 : 0,
      pmIds.length ? 100 : 0,
      technicianIds.length ? 100 : 0
    );
    
    // Generate project records
    const projects = Array(projectCount).fill().map(() => {
      const siteName = generateRandomSiteName();
      const projectName = generateRandomProjectName();
      const startDate = new Date(new Date().setDate(new Date().getDate() - Math.floor(Math.random() * 180)));
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30)); // Random end date between 0-30 days after start
      const location = locations[Math.floor(Math.random() * locations.length)];
      
      // Extract project type from project name
      const projectType = projectName.split(' - ')[0];
      
      return {
        id: uuidv4(),
        project_no: generateProjectNumber(),
        name: projectName,
        site_name: siteName,
        site_contact_name: generateRandomContactName(),
        site_contact_title: generateRandomContactTitle(),
        project_type: projectType,
        site_email: generateRandomEmail(siteName),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        location_id: location.id,
        specific_location: generateSpecificLocation(),
        report_template_id: templateIds[Math.floor(Math.random() * templateIds.length)],
        pm_id: pmIds[Math.floor(Math.random() * pmIds.length)],
        technician_id: technicianIds[Math.floor(Math.random() * technicianIds.length)],
        customer_id: location.customer_id, // ensure project is linked to the customer of the location
        start_date: startDate,
        end_date: endDate,
        created_at: new Date(),
        updated_at: new Date(),
      };
    });
    
    if (projects.length > 0) {
      await queryInterface.bulkInsert('projects', projects);
    } else {
      console.log('No projects created - missing required related entities');
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('projects', null, {});
  }
};
