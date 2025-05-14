const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/user');
const app = require('express').Router();

app.route('/add').post(authenticate, controller.createUser);
app.route('/edit/:id').put(authenticate, controller.updateUser);
app.post("/:id/profile-picture", authenticate, controller.uploadProfilePicture);
app.route('/delete/:id').delete(authenticate, controller.deleteUser);
app.route('/get-user-details/:id').get(authenticate, controller.getUserById);
app.route('/all').get(authenticate, controller.getAllUsers);

module.exports = app;