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
const { sequelize, Project, User, Customer, Location, Report, ReportTemplate } = require("../models");
const { Op } = require("sequelize");

exports.createProject = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { user } = req;
    console.log('user==>', user);
    
    const {
      name,
      site_name,
      site_contact_name,
      site_contact_title,
      report_template_id,
      site_email,
      status,
      location_id,
      report_id,
      pm_id,
      technician_id,
      customer_id,
      start_date,
    } = req.body;

    if (user.role == USER_ROLE.TECHNICIAN) {
      const ApiError = new APIError(NOT_ACCESS, null, BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }

    const projectCreated = await Project.create(
      {
        name: name,
        site_name: site_name,
        site_contact_name,
        site_contact_title,
        report_template_id,
        status: status,
        site_email: site_email,
        location_id: location_id,
        report_id: report_id,
        pm_id: pm_id,
        technician_id: technician_id,
        customer_id: customer_id,
        start_date: start_date,
      },
      { transaction }
    );

    await transaction.commit();
    return res.status(CREATED).json({
      data: projectCreated,
      code: CREATED,
      message: RECORD_CREATED,
      success: true,
    });
  } catch (err) {
    await transaction.rollback();
    return next(err);
  }
}

exports.getAllProjects = async (req, res, next) => {
  try {   
    // Add associations for company and technician search
    const associations = [
      { alias: "company", model: Customer, fields: ["first_name", "last_name"] },
      { alias: "technician", model: User, fields: ["first_name", "last_name"] },
    ];
    const filters = useFilter(req.query, Project, associations);
    let whereCondition = {
      ...filters.filter,
      ...filters.search,
    };
    // Filter by status
    if (req.query.statusFilter !== "all" && req.query.statusFilter !== undefined) {
      whereCondition.status = req.query.statusFilter;
    }
    // Filter by start_date (exact match or range)
    if (req.query.start_date) {
      whereCondition.start_date = req.query.start_date;
    }
    // Optionally, support start_date range filtering
    if (req.query.start_date_from || req.query.start_date_to) {
      whereCondition.start_date = {};
      if (req.query.start_date_from) {
        whereCondition.start_date[Op.gte] = req.query.start_date_from;
      }
      if (req.query.start_date_to) {
        whereCondition.start_date[Op.lte] = req.query.start_date_to;
      }
    }
    const options = {
      where: whereCondition,
      order: filters.sort,
      limit: filters.limit,
      offset: filters.page ? (filters.page - 1) * filters.limit : undefined,
    };
    options.include = [
      { model: Customer, as: "company", attributes: ["id", "first_name", "last_name"], required: true },
      { model: User, as: "technician", attributes: ["id", "first_name", "last_name"], required: true },
      { model: User, as: "pm", attributes: ["id", "first_name", "last_name"] },
      { model: Location, as: "location", attributes: ["id", "name"] },
      { model: Report, as: "reports", attributes: ["id", "name"] },
    ];
    const projects = await Project.findAndCountAll(options);    
    return res.status(OK).json({
      data: projects,
      code: OK,
      message: RECORDS_FOUND,
      success: true,
    });
  } catch (err) {
    next(err);
  }
}

exports.getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id, {
      include: [
        { model: Customer, as: "company", attributes: ["id", "first_name", "last_name"] },
        { model: User, as: "technician", attributes: ["id", "first_name", "last_name"] },
        { model: User, as: "pm", attributes: ["id", "first_name", "last_name"] },
        { model: Location, as: "location", attributes: ["id", "name"] },
        { model: Report, as: "reports", attributes: ["id", "name", "date_of_assessment", "date_of_loss", "assessment_due_to"] },
        { model: ReportTemplate, as: "reportTemplate", attributes: ["id", "name"] },
      ]
    });

    if (!project) {
      return res
        .status(NOT_FOUND)
        .json({ code: NOT_FOUND, message: NO_RECORD_FOUND, success: false });
    }

    res
      .status(OK)
      .json({ data: project, code: OK, message: RECORDS_FOUND, success: true });
  } catch (err) {
    next(err);
  }
}

exports.updateProject = async (req, res, next) => {
  try {
    const { user } = req;
    const { id } = req.params;
    const {       
      name,
      site_name,
      site_contact_name,
      site_contact_title,
      report_template_id,
      status,
      site_email,
      location_id,
      report_id,
      pm_id,
      technician_id,
      customer_id,
      start_date 
    } = req.body;

    if (user.role == USER_ROLE.TECHNICIAN) {
      const ApiError = new APIError(NOT_ACCESS, null, BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }
    const fetchProject = await Project.findOne({ where: { id: id } });
    if (!fetchProject) {
      return res
      .status(NOT_FOUND)
      .json({
        code: NOT_FOUND,
        message: NO_RECORD_FOUND,
        data: [],
        success: false,
      });
    } else {
      const updated = await Project.update(
        {
          name: name,
          site_name: site_name,
          site_contact_name,
          site_contact_title,
          report_template_id,
          status: status,
          site_email: site_email,
          location_id: location_id,
          report_id: report_id,
          pm_id: pm_id,
          technician_id: technician_id,
          customer_id: customer_id,
          start_date: start_date,
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
  
      const updatedProject = await Project.findByPk(id);
      res
        .status(OK)
        .json({
          code: OK,
          message: RECORD_UPDATED,
          data: updatedProject,
          success: true,
        });
    }
  } catch (err) {
    next(err);
  }
}

exports.deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const fetchedProject = await Project.findByPk(id);

    if (user.role == USER_ROLE.TECHNICIAN) {
      const ApiError = new APIError(NOT_ACCESS, null, BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }

    if (!fetchedProject) {
      return res
        .status(NOT_FOUND)
        .json({ code: NOT_FOUND, message: NO_RECORD_FOUND, success: false });
    }

    await fetchedProject.destroy();
    res.status(OK).json({ code: OK, message: RECORD_DELETED, success: true });
  } catch (err) {
    next(err);
  }
}