const app = require('./config/app');
const { sequelize } = require('./models/index');
const logger = require('./config/logger');

const PORT = process.env.PORT || 4000;
const HOST = 'localhost';

(async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connected');

    app.listen(PORT, HOST, () => logger.info(`🚀 Server running on ${HOST}:${PORT}`));
  } catch (err) {
    logger.error('Unable to connect to DB:', err);
    process.exit(1); // Ensure the process exits on DB connection failure
  }
})();