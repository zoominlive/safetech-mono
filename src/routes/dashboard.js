const app = require('express').Router();
const controller = require('../controllers/dashboard');
const { authenticate } = require('../middleware/auth');

app.route('/').get(authenticate, controller.getDashboardSummary);

module.exports = app;