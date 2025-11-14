const app = require('./config/app');
const { sequelize } = require('./models/index');
const logger = require('./config/logger');

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

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