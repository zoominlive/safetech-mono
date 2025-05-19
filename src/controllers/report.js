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
const { sequelize, Report, Project } = require("../models");

exports.createReport = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { user } = req;
    const {
      name,
      answers,
      photos,
      status
    } = req.body;

    if (user.role == USER_ROLE.TECHNICIAN) {
      const ApiError = new APIError(NOT_ACCESS, null, BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }

    const reportCreated = await Report.create(
      {
        name: name,
        answers: answers,
        photos: photos,
        status: status
      },
      { transaction }
    );

    await transaction.commit();
    return res.status(CREATED).json({
      data: reportCreated,
      code: CREATED,
      message: RECORD_CREATED,
      success: true,
    });
  } catch (err) {
    await transaction.rollback();
    return next(err);
  }
}

exports.getAllReports = async (req, res, next) => {
  try {
    const filters = useFilter(req.query, Report);
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
    options.include = [
      { model: Project, as: 'projects', attributes: ["name"] },
    ];
    const reports = await Report.findAndCountAll(options);
    res.status(OK).json({
      data: reports,
      code: OK,
      message: RECORDS_FOUND,
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

exports.getReportById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await Report.findByPk(id, {
      include: [{ model: Project, as: "projects", attributes: ["name"] }],
    });

    if (!report) {
      return res
        .status(NOT_FOUND)
        .json({ code: NOT_FOUND, message: NO_RECORD_FOUND, success: false });
    }

    res
      .status(OK)
      .json({ data: report, code: OK, message: RECORDS_FOUND, success: true });
  } catch (err) {
    next(err);
  }
}

exports.updateReport = async (req, res, next) => {
  try {
    const { user } = req;
    const { id } = req.params;
    const {       
      name,
      answers,
      photos,
      status
    } = req.body;

    if (user.role == USER_ROLE.TECHNICIAN) {
      const ApiError = new APIError(NOT_ACCESS, null, BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }
    const fetchReport = await Report.findOne({ where: { id: id } });
    if (!fetchReport) {
      return res
      .status(NOT_FOUND)
      .json({
        code: NOT_FOUND,
        message: NO_RECORD_FOUND,
        data: [],
        success: false,
      });
    }
    const updated = await Report.update(
      {
        name: name,
        answers: answers,
        photos: photos,
        status: status
      },
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

    const updatedReport = await Report.findByPk(id);
    res
      .status(OK)
      .json({
        code: OK,
        message: RECORD_UPDATED,
        data: updatedReport,
        success: true,
      });
  } catch (err) {
    next(err);
  }
}

exports.toggleStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const { status } = req.body;
    const report = await Report.findByPk(id);

    if (user.role == USER_ROLE.TECHNICIAN) {
      const ApiError = new APIError(NOT_ACCESS, null, BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }

    if (!report) {
      return res
        .status(NOT_FOUND)
        .json({ code: NOT_FOUND, message: NO_RECORD_FOUND, success: false });
    }

    report.status = status;
    await report.update({ status: status }, { where: { id: id } });

    res.status(OK).json({
      code: OK,
      message: RECORD_UPDATED,
      data: report,
      success: true,
    });
  } catch (err) {
    next(err);
  }
}

exports.deleteReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const fetchedReport = await Report.findByPk(id);

    if (user.role == USER_ROLE.TECHNICIAN) {
      const ApiError = new APIError(NOT_ACCESS, null, BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }

    if (!fetchedReport) {
      return res
        .status(NOT_FOUND)
        .json({ code: NOT_FOUND, message: NO_RECORD_FOUND, success: false });
    }

    await fetchedReport.destroy();
    res.status(OK).json({ code: OK, message: RECORD_DELETED, success: true });
  } catch (err) {
    next(err);
  }
}