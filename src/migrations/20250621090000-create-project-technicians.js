'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('project_technicians', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('(UUID())'),
      },
      project_id: {
        allowNull: false,
        type: Sequelize.UUID,
        references: { model: 'projects', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        allowNull: false,
        type: Sequelize.UUID,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('project_technicians', ['project_id']);
    await queryInterface.addIndex('project_technicians', ['user_id']);
    await queryInterface.addConstraint('project_technicians', {
      fields: ['project_id', 'user_id'],
      type: 'unique',
      name: 'uniq_project_user'
    });

    // Backfill existing technician assignments from projects.technician_id
    await queryInterface.sequelize.query(`
      INSERT INTO project_technicians (id, project_id, user_id, created_at, updated_at)
      SELECT UUID(), p.id, p.technician_id, NOW(), NOW()
      FROM projects p
      WHERE p.technician_id IS NOT NULL
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('project_technicians');
  },
};


