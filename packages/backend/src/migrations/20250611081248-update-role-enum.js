'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Change ENUM to VARCHAR
    await queryInterface.sequelize.query(
      `ALTER TABLE users MODIFY COLUMN role VARCHAR(50) NOT NULL`
    );
    // 2. Update 'Super Admin' to 'Admin'
    await queryInterface.sequelize.query(
      `UPDATE users SET role = 'Admin' WHERE role = 'Super Admin'`
    );
    // 3. Update any other roles not in the new ENUM to 'Technician'
    await queryInterface.sequelize.query(
      `UPDATE users SET role = 'Technician' WHERE role NOT IN ('Admin', 'Technician', 'Project Manager')`
    );
    // 4. Change VARCHAR back to ENUM
    await queryInterface.sequelize.query(
      `ALTER TABLE users MODIFY COLUMN role ENUM('Admin', 'Technician', 'Project Manager') NOT NULL`
    );
  },

  async down(queryInterface, Sequelize) {
    // 1. Change ENUM to VARCHAR
    await queryInterface.sequelize.query(
      `ALTER TABLE users MODIFY COLUMN role VARCHAR(50) NOT NULL`
    );
    // 2. Revert 'Admin' to 'Super Admin'
    await queryInterface.sequelize.query(
      `UPDATE users SET role = 'Super Admin' WHERE role = 'Admin'`
    );
    // 3. (Optional) Cannot restore other roles, as original values are lost
    // 4. Change VARCHAR back to original ENUM
    await queryInterface.sequelize.query(
      `ALTER TABLE users MODIFY COLUMN role ENUM('Super Admin', 'Technician', 'Project Manager') NOT NULL`
    );
  }
};
