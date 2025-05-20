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
const { sequelize, ReportTemplate, Project, Report } = require("../models");

exports.createReportTemplate = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { user } = req;
    const { name, schema } = req.body;

    if (user.role === USER_ROLE.TECHNICIAN) {
      const ApiError = new APIError(NOT_ACCESS, null, BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }

    const reportTemplateCreated = await ReportTemplate.create(
      {
        name,
        schema: typeof schema === 'string' ? schema : JSON.stringify(schema),
      },
      { transaction }
    );

    await transaction.commit();
    return res.status(CREATED).json({
      data: reportTemplateCreated,
      code: CREATED,
      message: RECORD_CREATED,
      success: true,
    });
  } catch (err) {
    await transaction.rollback();
    return next(err);
  }
};

exports.getAllReportTemplates = async (req, res, next) => {
  try {
    const filters = useFilter(req.query, ReportTemplate);
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
    
    const reportTemplates = await ReportTemplate.findAndCountAll(options);
    res.status(OK).json({
      data: reportTemplates,
      code: OK,
      message: RECORDS_FOUND,
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

exports.getReportTemplateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reportTemplate = await ReportTemplate.findByPk(id, {
      include: [
        { model: Project, as: 'projects', attributes: ["id", "name"] },
        { model: Report, as: 'reports', attributes: ["id", "name"] },
      ]
    });

    if (!reportTemplate) {
      return res
        .status(NOT_FOUND)
        .json({ code: NOT_FOUND, message: NO_RECORD_FOUND, success: false });
    }

    res
      .status(OK)
      .json({ data: reportTemplate, code: OK, message: RECORDS_FOUND, success: true });
  } catch (err) {
    next(err);
  }
};

exports.updateReportTemplate = async (req, res, next) => {
  try {
    const { user } = req;
    const { id } = req.params;
    const { name, schema } = req.body;

    if (user.role === USER_ROLE.TECHNICIAN) {
      const ApiError = new APIError(NOT_ACCESS, null, BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }

    const templateToUpdate = await ReportTemplate.findByPk(id);
    if (!templateToUpdate) {
      return res
        .status(NOT_FOUND)
        .json({ code: NOT_FOUND, message: NO_RECORD_FOUND, success: false });
    }

    const updated = await ReportTemplate.update(
      { 
        name,
        schema: typeof schema === 'string' ? schema : JSON.stringify(schema),
      },
      {
        where: { id },
        returning: true,
      }
    );

    const updatedTemplate = await ReportTemplate.findByPk(id);
    res
      .status(OK)
      .json({
        code: OK,
        message: RECORD_UPDATED,
        data: updatedTemplate,
        success: true,
      });
  } catch (err) {
    next(err);
  }
};

exports.deleteReportTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user } = req;
    
    if (user.role === USER_ROLE.TECHNICIAN) {
      const ApiError = new APIError(NOT_ACCESS, null, BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }

    // Check if template exists
    const template = await ReportTemplate.findByPk(id);
    if (!template) {
      return res
        .status(NOT_FOUND)
        .json({ code: NOT_FOUND, message: NO_RECORD_FOUND, success: false });
    }

    // Check if template is being used in projects or reports
    const projectCount = await Project.count({ where: { report_template_id: id } });
    const reportCount = await Report.count({ where: { report_template_id: id } });

    if (projectCount > 0 || reportCount > 0) {
      const ApiError = new APIError(
        "Cannot delete template as it is currently in use",
        null,
        BAD_REQUEST
      );
      return ErrorHandler(ApiError, req, res, next);
    }

    await template.destroy();
    res.status(OK).json({ code: OK, message: RECORD_DELETED, success: true });
  } catch (err) {
    next(err);
  }
};
