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
const { sequelize, Customer } = require('../models');

exports.createCustomer = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { user } = req;
    const { name, email, phone } = req.body
    
    if (user.role == USER_ROLE.TECHNICIAN) {
      const ApiError = new APIError(NOT_ACCESS, null, BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }

    const customer = await Customer.create({ name, email, phone }, { transaction });

    await transaction.commit();
    return res
      .status(CREATED)
      .json({
        data: customer,
        code: CREATED,
        message: RECORD_CREATED,
        success: true
      });
  } catch (err) {    
    console.log('i ncatch block==>');
    
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
    const options = {
      where: whereCondition,
      order: filters.sort,
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
    const customer = await Customer.findByPk(id);

    if (!customer) {
      return res.status(NOT_FOUND).json({ code: NOT_FOUND, message: NO_RECORD_FOUND, success: false });
    }

    res.status(OK).json({ data: customer, code: OK, message: RECORDS_FOUND, success: true });
  } catch (err) {
    next(err);
  }
}

exports.updateCustomer = async (req, res, next) => {
  try {
    const { user } = req;
    const { id } = req.params;    
    const { name, email, phone } = req.body

    if (user.role == USER_ROLE.TECHNICIAN) {
      const ApiError = new APIError(NOT_ACCESS, null, BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }

    const updated = await Customer.update(
      { name: name, email: email, phone: phone },
      {
        where: { id: id },
        returning: true,
      }
    );
    console.log('updated=>', updated);
    
    if (!updated) {
      return res.status(NOT_FOUND).json({ code: NOT_FOUND, message: NO_RECORD_FOUND, success: false });
    }

    const updatedCustomer = await Customer.findByPk(id);
    res.status(OK).json({ code: OK, message: RECORD_UPDATED, data: updatedCustomer, success: true });
  } catch (err) {
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