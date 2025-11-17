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
    /^https:\/\/.*\.replit\.dev(:\d+)?$/  // Allow all .replit.dev URLs for development
  ],
  credentials: true
};
app.use(cors(corsOptions));

app.use(helmet());

app.use(express.static(path.join(__dirname, '../public')));
app.use('/api/v1/uploads', express.static(path.join(__dirname, '../../uploads')));

app.use('/api/v1', routes);

app.use(ErrorHandler);

module.exports = app;