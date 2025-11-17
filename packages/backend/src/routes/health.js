const express = require('express');
const router = express.Router();
const { sequelize } = require('../models/index');
const path = require('path');
const fs = require('fs');

// Health check endpoint for production diagnostics
router.get('/healthz', async (req, res) => {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 'not set',
    checks: {}
  };

  // 1. Check database connection
  try {
    await sequelize.authenticate();
    diagnostics.checks.database = { status: 'connected', message: 'Database connection successful' };
  } catch (error) {
    diagnostics.checks.database = { status: 'failed', error: error.message };
  }

  // 2. Check required environment variables
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
  const envStatus = {};
  requiredEnvVars.forEach(varName => {
    envStatus[varName] = process.env[varName] ? 'set' : 'missing';
  });
  diagnostics.checks.environment_variables = envStatus;

  // 3. Check frontend build (only in production)
  if (process.env.NODE_ENV === 'production') {
    const frontendDistPath = path.join(__dirname, '../../../frontend/dist');
    const indexPath = path.join(frontendDistPath, 'index.html');
    
    diagnostics.checks.frontend = {
      dist_path: frontendDistPath,
      dist_exists: fs.existsSync(frontendDistPath),
      index_exists: fs.existsSync(indexPath)
    };

    if (fs.existsSync(frontendDistPath)) {
      try {
        const files = fs.readdirSync(frontendDistPath);
        diagnostics.checks.frontend.files_count = files.length;
        diagnostics.checks.frontend.files = files.slice(0, 10); // Show first 10 files
      } catch (error) {
        diagnostics.checks.frontend.read_error = error.message;
      }
    }
  }

  // 4. Overall health status
  const dbOk = diagnostics.checks.database?.status === 'connected';
  const envOk = diagnostics.checks.environment_variables?.DATABASE_URL === 'set';
  const frontendOk = process.env.NODE_ENV !== 'production' || 
                     (diagnostics.checks.frontend?.index_exists === true);

  diagnostics.status = (dbOk && envOk && frontendOk) ? 'healthy' : 'unhealthy';
  diagnostics.ready = dbOk && envOk;

  const statusCode = diagnostics.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(diagnostics);
});

module.exports = router;
