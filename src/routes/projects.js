const app = require('express').Router();
const controller = require('../controllers/project');
const { authenticate } = require('../middleware/auth');
const drawingController = require('../controllers/projectDrawing');
const multer = require('multer');

// Configure multer for drawings uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

app.route('/add').post(authenticate, controller.createProject);
app.route('/edit/:id').put(authenticate, controller.updateProject);
app.route('/delete/:id').delete(authenticate, controller.deleteProject);
app.route('/get-project-details/:id').get(authenticate, controller.getProjectById);
app.route('/all').get(authenticate, controller.getAllProjects);

// Project status transition flow route
app.route('/:projectId/status').patch(authenticate, controller.updateProjectStatus);

module.exports = app;

// Drawings endpoints (mounted under /projects)
app.route('/:projectId/drawings').get(authenticate, drawingController.list);
app.route('/:projectId/drawings').post(authenticate, upload.array('files[]'), drawingController.create);
app.route('/:projectId/drawings/:drawingId').delete(authenticate, drawingController.remove);