const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('../routes');
const { ErrorHandler } = require('../helpers/errorHandler');
const { logType, morganConfig } = require('./use_env_variable');


// Parse JSON playload
app.use(express.json({}));

// Parse URl-Encoded Data
app.use(express.urlencoded({ extended: true }));

app.use(morgan(logType, morganConfig));

app.use(cors('*'));

app.use(helmet());

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/v1', routes);

app.use(ErrorHandler);

module.exports = app;