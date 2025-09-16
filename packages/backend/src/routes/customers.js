const app = require('express').Router();
const controller = require('../controllers/customer');
const { authenticate } = require('../middleware/auth');

app.route('/add').post(authenticate ,controller.createCustomer);
app.route('/edit/:id').put(authenticate, controller.updateCustomer);
app.route('/delete/:id').delete(authenticate, controller.deleteCustomer);
app.route('/get-customer-details/:id').get(authenticate, controller.getCustomerById);
app.route('/all').get(authenticate, controller.getAllCustomers);

module.exports = app;