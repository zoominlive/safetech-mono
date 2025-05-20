const app = require('express').Router();
const controller = require('../controllers/reportTemplate');
const { authenticate } = require('../middleware/auth');

app.route('/add').post(authenticate, controller.createReportTemplate);
app.route('/edit/:id').put(authenticate, controller.updateReportTemplate);
app.route('/delete/:id').delete(authenticate, controller.deleteReportTemplate);
app.route('/get-report-template-details/:id').get(authenticate, controller.getReportTemplateById);
app.route('/all').get(authenticate, controller.getAllReportTemplates);

module.exports = app;
