'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'status', {
      type: Sequelize.ENUM('invited', 'activated'),
      allowNull: false,
      defaultValue: 'invited'
    });

    await queryInterface.addColumn('users', 'activation_token', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'activation_token_expires', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'status');
    await queryInterface.removeColumn('users', 'activation_token');
    await queryInterface.removeColumn('users', 'activation_token_expires');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_users_status;');
  }
}; 