const app = require('express').Router();
const controller = require('../controllers/auth');

app.route('/register').post(controller.register);
app.route('/login').post(controller.login);
app.route('/forgot-password').post(controller.forgotPassword);
app.route('/reset-password').post(controller.resetPassword);
app.route('/is-valid-reset-page').get(controller.isValidResetPage);
app.route('/verify-email').get(controller.verifyEmail);
app.route('/login-with-token').get(controller.loginWithToken);

module.exports = app;
