'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('projects', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('(UUID())'),
      },
      name: {
        allowNull: true,
        type: Sequelize.STRING
      },
      site_name: {
        allowNull: true,
        type: Sequelize.STRING
      },
      site_email: {
        allowNull: true,
        type: Sequelize.STRING
      },
      site_contact_name: {
        allowNull: true,
        type: Sequelize.STRING
      },
      site_contact_title : {
        allowNull: true,
        type: Sequelize.STRING
      },
      status: {
        allowNull: true,
        type: Sequelize.STRING
      },
      report_template_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      location_id: {
        type: Sequelize.UUID,
        references: { model: 'locations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      pm_id: {
        type: Sequelize.UUID,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      technician_id: {
        type: Sequelize.UUID,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      customer_id: {
        type: Sequelize.UUID,
        references: { model: 'customers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      start_date: {
        allowNull: true,
        type: Sequelize.DATE
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      }
    });

    await queryInterface.addIndex('projects', ['name']);
    await queryInterface.addIndex('projects', ['id']);
    await queryInterface.addIndex('projects', ['customer_id']);
    await queryInterface.addIndex('projects', ['technician_id']);
    await queryInterface.addIndex('projects', ['pm_id']);
    await queryInterface.addIndex('projects', ['location_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('projects');
  },
};
