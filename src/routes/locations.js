const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// Create a new location
router.post('/add', locationController.createLocation);

// Get all locations
router.get('/', locationController.getAllLocations);

router.get('/:custId', locationController.getAllLocationsByCustomer);

// Get location by ID
router.get('/:id', locationController.getLocationById);

// Update location
router.put('/:id', locationController.updateLocation);

// Delete location
router.delete('/:id', locationController.deleteLocation);

module.exports = router;
