const app = require('express').Router();
const controller = require('../controllers/report');
const { authenticate } = require('../middleware/auth');

app.route('/add').post(authenticate, controller.createReport);
app.route('/edit/:id').put(authenticate, controller.updateReport);
app.route('/:id/status').patch(authenticate, controller.toggleStatus);
app.route('/delete/:id').delete(authenticate, controller.deleteReport);
app.route('/get-report-details/:id').get(authenticate, controller.getReportById);
app.route('/all').get(authenticate, controller.getAllReports);
app.route('/:id/pdf').get(authenticate, controller.generatePDFReport);

module.exports = app;