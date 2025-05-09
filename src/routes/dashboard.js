const app = require('express').Router();
const controller = require('../controllers/dashboard');

app.route('/').get(controller.getDashboardSummary);

module.exports = app;