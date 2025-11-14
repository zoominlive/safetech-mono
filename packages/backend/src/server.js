const app = require('./config/app');
const { sequelize } = require('./models/index');
const logger = require('./config/logger');

const PORT = process.env.PORT || 4000;
const HOST = '0.0.0.0';

(async () => {
  try {
    console.log('[Server] Attempting database connection...');
    console.log(`[Server] Database: ${sequelize.config.database}`);
    console.log(`[Server] Host: ${sequelize.config.host}`);
    
    await sequelize.authenticate();
    console.log('[Server] ✅ Database connected successfully');
    logger.info('Database connected');

    console.log(`[Server] Starting HTTP server on ${HOST}:${PORT}...`);
    
    const server = app.listen(PORT, HOST, () => {
      console.log(`[Server] ✅ HTTP server is now listening on ${HOST}:${PORT}`);
      logger.info(`🚀 Server running on ${HOST}:${PORT}`);
    });

    server.on('error', (err) => {
      console.error('[Server] ❌ Server error:', err);
      process.exit(1);
    });

  } catch (err) {
    console.error('[Server] ❌ Unable to connect to DB:', err);
    logger.error('Unable to connect to DB:', err);
    process.exit(1);
  }
})();