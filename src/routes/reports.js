const app = require('express').Router();
const controller = require('../controllers/report');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

app.route('/add').post(authenticate, controller.createReport);
app.route('/edit/:id').put(authenticate, controller.updateReport);
app.route('/:id/status').patch(authenticate, controller.toggleStatus);
app.route('/delete/:id').delete(authenticate, controller.deleteReport);
app.route('/get-report-details/:id').get(authenticate, controller.getReportById);
app.route('/all').get(authenticate, controller.getAllReports);
app.route('/:id/pdf').get(authenticate, controller.generatePDFReport);
app.route('/:id/upload').post(authenticate, upload.array('files'), controller.uploadFiles);
app.route('/import-lab').post(authenticate, controller.importLabReport);
app.route('/project/:projectId/lab-reports').get(authenticate, controller.getLabReportsForProject);
app.route('/:reportId/send-to-customer').post(authenticate, controller.sendReportToCustomer);

module.exports = app;