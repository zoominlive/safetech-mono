const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/user');
const app = require('express').Router();
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

app.route('/add').post(authenticate, controller.createUser);
app.route('/edit/:id').put(authenticate, controller.updateUser);
app.post("/:id/profile-picture", authenticate, upload.single('profilePicture'), controller.uploadProfilePicture);
app.route('/delete/:id').delete(authenticate, controller.deleteUser);
app.route('/get-user-details/:id').get(authenticate, controller.getUserById);
app.route('/all').get(authenticate, controller.getAllUsers);

// Activation routes
app.route('/activate/:token').post(controller.activateUser);
app.route('/resend-activation').post(controller.resendActivationEmail);

module.exports = app;