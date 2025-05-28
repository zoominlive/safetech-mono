const APIError = require('../helpers/apiError');
const {
  USER_ROLE,
  NOT_ACCESS,
  BAD_REQUEST,
  OK,
  RECORD_CREATED,
  CREATED,
  RECORDS_FOUND,
  NOT_FOUND,
  NO_RECORD_FOUND,
  RECORD_UPDATED,
  RECORD_DELETED,
} = require("../helpers/constants");
const { ErrorHandler } = require('../helpers/errorHandler');
const { useFilter } = require('../helpers/pagination');
const { sequelize, Customer, Project, Location } = require('../models');

exports.createCustomer = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { user } = req;
    const { first_name, last_name, email, phone, status, locations } = req.body;
    if (user.role == USER_ROLE.TECHNICIAN) {
      const ApiError = new APIError(NOT_ACCESS, null, BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }
    const customer = await Customer.create({ first_name, last_name, email, phone, status }, { transaction });
    // Handle locations if provided
    let createdLocations = [];
    if (Array.isArray(locations)) {
      for (const loc of locations) {
        const location = await Location.create({
          name: loc.name,
          address_line_1: loc.address_line_1,
          address_line_2: loc.address_line_2,
          city: loc.city,
          province: loc.province,
          postal_code: loc.postal_code,
          customer_id: customer.id,
          active: loc.active !== false,
        }, { transaction });
        createdLocations.push(location);
      }
    }
    await transaction.commit();
    return res.status(CREATED).json({
      data: { ...customer.toJSON(), locations: createdLocations },
      code: CREATED,
      message: RECORD_CREATED,
      success: true
    });
  } catch (err) {
    await transaction.rollback();
    return next(err);
  }
}

exports.getAllCustomers = async (req, res, next) => {
  try {
    const filters = useFilter(req.query, Customer);
    let whereCondition = {
      ...filters.filter,
      ...filters.search,
    };
    
    // Custom sorting based on sortBy parameter
    let orderClause = [];
    if (req.query.sort)  {
      switch (req.query.sort) {
        case 'name_asc':
          orderClause = [['first_name', 'ASC']];
          break;
        case 'name_desc':
          orderClause = [['first_name', 'DESC']];
          break;
        case 'created_asc':
          orderClause = [['created_at', 'ASC']];
          break;
        case 'created_desc':
          orderClause = [['created_at', 'DESC']];
          break;
        default:
          orderClause = [['created_at', 'DESC']]; // Default sort
      }
    } else {
      orderClause = [['created_at', 'DESC']]; // Default sort when no sortBy parameter
    }
    
    const options = {
      where: whereCondition,
      order: orderClause,
      limit: filters.limit,
      offset: filters.page ? (filters.page - 1) * filters.limit : undefined,
    };
    const customers = await Customer.findAndCountAll(options);
    res.status(OK).json({ 
      data: customers,
      code: OK,
      message: RECORDS_FOUND,
      success: true 
    });
  } catch (err) {
    next(err);
  }
}

exports.getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByPk(id, {
      include: [
        { model: Project, as: "projects", attributes: ["id", "name", "status", "start_date"] },
        { model: Location, as: "locations" }
      ]
    });

    if (!customer) {
      return res.status(NOT_FOUND).json({ code: NOT_FOUND, message: NO_RECORD_FOUND, success: false });
    }

    res.status(OK).json({ data: customer, code: OK, message: RECORDS_FOUND, success: true });
  } catch (err) {
    next(err);
  }
}

exports.updateCustomer = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { user } = req;
    const { id } = req.params;
    const { first_name, last_name, email, phone, status, locations } = req.body;
    if (user.role == USER_ROLE.TECHNICIAN) {
      const ApiError = new APIError(NOT_ACCESS, null, BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }
    const updated = await Customer.update(
      { first_name, last_name, email, phone, status },
      { where: { id }, returning: true, transaction }
    );
    if (!updated) {
      await transaction.rollback();
      return res.status(NOT_FOUND).json({ code: NOT_FOUND, message: NO_RECORD_FOUND, success: false });
    }
    // Handle locations update
    if (Array.isArray(locations)) {
      // Remove locations not present in the update
      const existingLocations = await Location.findAll({ where: { customer_id: id }, transaction });
      const incomingIds = locations.filter(l => l.id).map(l => l.id);
      for (const loc of existingLocations) {
        if (!incomingIds.includes(loc.id)) {
          await loc.destroy({ transaction });
        }
      }
      // Upsert locations
      for (const loc of locations) {
        if (loc.id) {
          // Update existing
          await Location.update({
            name: loc.name,
            address_line_1: loc.address_line_1,
            address_line_2: loc.address_line_2,
            city: loc.city,
            province: loc.province,
            postal_code: loc.postal_code,
            active: loc.active !== false,
          }, { where: { id: loc.id, customer_id: id }, transaction });
        } else {
          // Create new
          await Location.create({
            name: loc.name,
            address_line_1: loc.address_line_1,
            address_line_2: loc.address_line_2,
            city: loc.city,
            province: loc.province,
            postal_code: loc.postal_code,
            customer_id: id,
            active: loc.active !== false,
          }, { transaction });
        }
      }
    }
    await transaction.commit();
    const updatedCustomer = await Customer.findByPk(id, { include: [{ model: Location, as: 'locations' }] });
    res.status(OK).json({ code: OK, message: RECORD_UPDATED, data: updatedCustomer, success: true });
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
}

exports.deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const customer = await Customer.findByPk(id);

    if (user.role == USER_ROLE.TECHNICIAN) {
      const ApiError = new APIError(NOT_ACCESS, null, BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }

    if (!customer) {
      return res.status(NOT_FOUND).json({ code: NOT_FOUND, message: NO_RECORD_FOUND, success: false });
    }

    await customer.destroy();
    res.status(OK).json({ code: OK, message: RECORD_DELETED, success: true });
  } catch (err) {
    next(err);
  }
}