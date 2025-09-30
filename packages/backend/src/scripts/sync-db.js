const { sequelize } = require('../models/index');
const logger = require('../config/logger');

(async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connected successfully');
    
    await sequelize.sync({ force: true });
    logger.info('Database synchronized successfully');
    
    process.exit(0);
  } catch (err) {
    logger.error('Error syncing database:', err);
    process.exit(1);
  }
})();
