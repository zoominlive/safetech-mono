const app = require('express').Router();
const controller = require('../controllers/project');
const { authenticate } = require('../middleware/auth');

app.route('/add').post(authenticate, controller.createProject);
app.route('/edit/:id').put(authenticate, controller.updateProject);
app.route('/delete/:id').delete(authenticate, controller.deleteProject);
app.route('/get-project-details/:id').get(authenticate, controller.getProjectById);
app.route('/all').get(authenticate, controller.getAllProjects);

module.exports = app;