'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('reports', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        allowNull: true,
        type: Sequelize.STRING
      },
      project_id: {
        type: Sequelize.INTEGER,
        references: { model: 'projects', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      report_template_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      assessment_due_to: {
        allowNull: true,
        type: Sequelize.STRING
      },
      date_of_loss: {
        allowNull: true,
        type: Sequelize.DATE
      },
      date_of_assessment: {
        allowNull: true,
        type: Sequelize.DATE
      },
      answers: {
        allowNull: true,
        type: Sequelize.JSON
      },
      photos: {
        allowNull: true,
        type: Sequelize.JSON
      },
      status: {
        type: Sequelize.BOOLEAN
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('reports');
  },
};
