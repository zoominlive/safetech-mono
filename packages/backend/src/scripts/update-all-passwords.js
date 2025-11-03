const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { sequelize } = require('../config/config');

async function updateAllPasswords() {
  try {
    console.log('🔐 Starting password update for all users...\n');

    const newPassword = 'passwordSafe';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    console.log(`Password hash generated: ${hashedPassword.substring(0, 20)}...\n`);

    const users = await User.findAll({
      attributes: ['id', 'email', 'first_name', 'last_name', 'role']
    });

    console.log(`Found ${users.length} users to update\n`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        await User.update(
          { password: hashedPassword },
          { where: { id: user.id } }
        );
        
        console.log(`✅ Updated: ${user.email} (${user.role})`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Failed to update ${user.email}: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Total users: ${users.length}`);
    console.log(`   ✅ Successfully updated: ${updatedCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`\n🔑 All passwords have been set to: ${newPassword}`);
    console.log('\n⚠️  SECURITY WARNING: This is intended for development/testing only!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error updating passwords:', error);
    process.exit(1);
  }
}

sequelize.authenticate()
  .then(() => {
    console.log('Database connection established\n');
    return updateAllPasswords();
  })
  .catch(err => {
    console.error('Unable to connect to database:', err);
    process.exit(1);
  });
