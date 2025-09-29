'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get all existing projects
    const [projects] = await queryInterface.sequelize.query('SELECT id FROM projects;');
    
    // Verify that the specified user exists
    const [users] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE id = 'd1186d22-54ae-4890-9bee-d5e0bbf7631f';"
    );
    
    if (users.length === 0) {
      console.log('Warning: User d1186d22-54ae-4890-9bee-d5e0bbf7631f not found. Skipping project_technician assignments.');
      return;
    }
    
    if (projects.length === 0) {
      console.log('No projects found. Skipping project_technician assignments.');
      return;
    }
    
    // Check for existing assignments to avoid duplicates
    const [existingAssignments] = await queryInterface.sequelize.query(
      `SELECT project_id FROM project_technicians WHERE user_id = 'd1186d22-54ae-4890-9bee-d5e0bbf7631f'`
    );
    
    const existingProjectIds = new Set(existingAssignments.map(a => a.project_id));
    
    // Filter out projects that are already assigned to this user
    const unassignedProjects = projects.filter(project => !existingProjectIds.has(project.id));
    
    if (unassignedProjects.length === 0) {
      console.log('All projects are already assigned to user d1186d22-54ae-4890-9bee-d5e0bbf7631f');
      return;
    }
    
    // Create project_technician assignments for unassigned projects only
    const projectTechnicians = unassignedProjects.map(project => ({
      id: uuidv4(),
      project_id: project.id,
      user_id: 'd1186d22-54ae-4890-9bee-d5e0bbf7631f',
      created_at: new Date(),
      updated_at: new Date(),
    }));
    
    // Insert the assignments
    await queryInterface.bulkInsert('project_technicians', projectTechnicians);
    
    console.log(`Successfully assigned ${projectTechnicians.length} projects to user d1186d22-54ae-4890-9bee-d5e0bbf7631f`);
  },

  async down(queryInterface, Sequelize) {
    // Remove all project_technician assignments for the specified user
    await queryInterface.bulkDelete('project_technicians', {
      user_id: 'd1186d22-54ae-4890-9bee-d5e0bbf7631f'
    });
  }
};
