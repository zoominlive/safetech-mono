'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "report_templates",
      {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('(UUID())'),
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        schema: {
          type: Sequelize.JSON, // The structure/fields expected in this type
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      },
      {
        tableName: "report_templates",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('report_templates');
  },
};
