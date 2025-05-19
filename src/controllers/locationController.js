const APIError = require('../helpers/apiError');
const { USER_ROLE, NOT_ACCESS, BAD_REQUEST } = require('../helpers/constants');
const { ErrorHandler } = require('../helpers/errorHandler');
const { Location } = require('../models');

// Create a new location
exports.createLocation = async (req, res) => {
  try {
    const { user } = req;

    if (user.role == USER_ROLE.TECHNICIAN) {
      const ApiError = new APIError(NOT_ACCESS, null, BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }

    const location = await Location.create(req.body);
    return res.status(201).json({
      success: true,
      message: 'Location created successfully',
      data: location
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create location',
      error: error.message
    });
  }
};

// Get all locations
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.findAll({
      where: { active: true }
    });
    return res.status(200).json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve locations',
      error: error.message
    });
  }
};

// Get location by ID
exports.getLocationById = async (req, res) => {
  try {
    const location = await Location.findByPk(req.params.id);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: location
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve location',
      error: error.message
    });
  }
};

// Update location
exports.updateLocation = async (req, res) => {
  try {
    const { user } = req;

    if (user.role == USER_ROLE.TECHNICIAN) {
      const ApiError = new APIError(NOT_ACCESS, null, BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }

    const [updated] = await Location.update(req.body, {
      where: { id: req.params.id }
    });

    if (updated === 0) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    const updatedLocation = await Location.findByPk(req.params.id);
    
    return res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: updatedLocation
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update location',
      error: error.message
    });
  }
};

// Delete location (soft delete)
exports.deleteLocation = async (req, res) => {
  try {
    const { user } = req;

    if (user.role == USER_ROLE.TECHNICIAN) {
      const ApiError = new APIError(NOT_ACCESS, null, BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }
    
    const location = await Location.findByPk(req.params.id);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    await location.destroy();
    
    return res.status(200).json({
      success: true,
      message: 'Location deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete location',
      error: error.message
    });
  }
};
