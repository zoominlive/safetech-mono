const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('../routes');
const { ErrorHandler } = require('../helpers/errorHandler');
const { logType, morganConfig } = require('./use_env_variable');

// Get payload limits from environment or use defaults
const JSON_LIMIT = process.env.JSON_PAYLOAD_LIMIT || '50mb';
const URL_LIMIT = process.env.URL_PAYLOAD_LIMIT || '50mb';

// Parse JSON payload with increased limits
app.use(express.json({ 
  limit: JSON_LIMIT // Configurable limit
}));

// Parse URL-Encoded Data with increased limits
app.use(express.urlencoded({ 
  extended: true,
  limit: URL_LIMIT // Configurable limit
}));

app.use(morgan(logType, morganConfig));

// CORS configuration for both development and production
const corsOptions = {
  origin: [
    'http://localhost:5000',
    'https://app.safetechenv.com',
    'https://safe-report-app.replit.app',
    /^https:\/\/.*\.replit\.dev(:\d+)?$/  // Allow all .replit.dev URLs for development
  ],
  credentials: true
};
app.use(cors(corsOptions));

app.use(helmet());

app.use(express.static(path.join(__dirname, '../public')));
app.use('/api/v1/uploads', express.static(path.join(__dirname, '../../uploads')));

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  const fs = require('fs');
  const frontendDistPath = path.join(__dirname, '../../../frontend/dist');
  
  // Check if frontend build exists
  if (fs.existsSync(frontendDistPath)) {
    console.log('✅ Serving frontend from:', frontendDistPath);
    app.use(express.static(frontendDistPath));
  } else {
    console.warn('⚠️ Frontend dist not found at:', frontendDistPath);
    console.warn('⚠️ Frontend will not be served. Run: pnpm build:fe');
  }
}

app.use('/api/v1', routes);

// Serve frontend index.html for all non-API routes (client-side routing)
// Express 5 requires regex pattern instead of '*' wildcard
if (process.env.NODE_ENV === 'production') {
  app.get(/^\/(?!api\/).*/, (req, res) => {
    const fs = require('fs');
    const frontendDistPath = path.join(__dirname, '../../../frontend/dist');
    const indexPath = path.join(frontendDistPath, 'index.html');
    
    // Safety check: if index.html doesn't exist, return 503
    if (!fs.existsSync(indexPath)) {
      return res.status(503).send('Frontend build not found. Please run: pnpm build:fe');
    }
    
    res.sendFile(indexPath);
  });
}

app.use(ErrorHandler);

module.exports = app;