const APIError = require("../helpers/apiError");
const {
  USER_ROLE,
  CREATED,
  RECORD_CREATED,
  OK,
  RECORD_DELETED,
  NOT_FOUND,
  NO_RECORD_FOUND,
  RECORD_UPDATED,
  RECORDS_FOUND,
  NOT_ACCESS,
  BAD_REQUEST,
} = require("../helpers/constants");
const { ErrorHandler } = require("../helpers/errorHandler");
const { useFilter } = require("../helpers/pagination");
const { sequelize, User } = require("../models");

exports.createUser = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { user } = req;
    const { name, email, phone, role, password } = req.body;

    if (user.role == USER_ROLE.TECHNICIAN) {
      const ApiError = new APIError(NOT_ACCESS, null, BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }

    const userCreated = await User.create(
      {
        name: name,
        email: email,
        phone: phone,
        role: role,
        password: password,
        created_by: user.id
      },
      { transaction }
    );

    await transaction.commit();
    return res.status(CREATED).json({
      data: userCreated,
      code: CREATED,
      message: RECORD_CREATED,
      success: true,
    });
  } catch (err) {
    await transaction.rollback();
    return next(err);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const filters = useFilter(req.query, User);
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
    const users = await User.findAndCountAll(options);
    res.status(OK).json({
      data: users,
      code: OK,
      message: RECORDS_FOUND,
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res
        .status(NOT_FOUND)
        .json({ code: NOT_FOUND, message: NO_RECORD_FOUND, success: false });
    }

    res
      .status(OK)
      .json({ data: user, code: OK, message: RECORDS_FOUND, success: true });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { user } = req;
    const { id } = req.params;
    const { name, email, phone, role, created_by } = req.body;

    if (user.role == USER_ROLE.TECHNICIAN) {
      const ApiError = new APIError(NOT_ACCESS, null, BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }

    const updated = await User.update(
      { name: name, email: email, phone: phone, role: role, created_by: created_by },
      {
        where: { id: id },
        returning: true,
      }
    );
    console.log("updated=>", updated);

    if (!updated) {
      return res
        .status(NOT_FOUND)
        .json({ code: NOT_FOUND, message: NO_RECORD_FOUND, success: false });
    }

    const updatedUser = await User.findByPk(id);
    res
      .status(OK)
      .json({
        code: OK,
        message: RECORD_UPDATED,
        data: updatedUser,
        success: true,
      });
  } catch (err) {
    next(err);
  }
};

module.exports.updateUserWithLogs = async (updateUser = {}) => {
  const { updateValue, updateCondition, req, change_logs } = updateUser;
  try {
    const oldUser = await User.findOne({
      where: updateCondition,
    });

    const newUser = await User.update(updateValue, {
      where: updateCondition,
    });
    
    return true;
  } catch (error) {
    logger.error(
      `${req?.ip} - ${req?.method} - ${req?.originalUrl} - ${
        error?.status || 500
      } - ${error?.message} - ${error?.stack}`
    );
    return false;
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const fetchedUser = await User.findByPk(id);

    if (user.role == USER_ROLE.TECHNICIAN) {
      const ApiError = new APIError(NOT_ACCESS, null, BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }

    if (!fetchedUser) {
      return res
        .status(NOT_FOUND)
        .json({ code: NOT_FOUND, message: NO_RECORD_FOUND, success: false });
    }

    await fetchedUser.destroy();
    res.status(OK).json({ code: OK, message: RECORD_DELETED, success: true });
  } catch (err) {
    next(err);
  }
};
