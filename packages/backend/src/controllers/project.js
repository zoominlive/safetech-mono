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
      project_no,
      name,
      site_name,
      site_contact_name,
      site_contact_title,
      project_type,
      report_template_id,
      site_email,
      location_id,
      specific_location,
      report_id,
      pm_id,
      technician_id,
      technician_ids,
      customer_id,
      start_date,
      end_date,
    } = req.body;

    if (user.role == USER_ROLE.TECHNICIAN) {
      const ApiError = new APIError(NOT_ACCESS, null, BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }

    // Determine legacy technician_id for backward compatibility
    const legacyTechnicianId = Array.isArray(technician_ids) && technician_ids.length > 0
      ? technician_ids[0]
      : technician_id;

    const projectCreated = await Project.create(
      {
        project_no: project_no,
        name: name,
        site_name: site_name,
        site_contact_name,
        site_contact_title,
        project_type,
        report_template_id,
        status: "New", // Always set to 'New' on creation
        site_email: site_email,
        location_id: location_id,
        specific_location: specific_location,
        report_id: report_id,
        pm_id: pm_id,
        technician_id: legacyTechnicianId,
        customer_id: customer_id,
        start_date: start_date,
        end_date: end_date,
      },
      { transaction }
    );

    // Attach technicians via M2M if provided
    if (Array.isArray(technician_ids) && technician_ids.length > 0) {
      await projectCreated.setTechnicians(technician_ids, { transaction });
    } else if (legacyTechnicianId) {
      // Ensure at least the legacy technician is linked in M2M
      await projectCreated.setTechnicians([legacyTechnicianId], { transaction });
    }

    // Find the report template to get its name
    const reportTemplate = await ReportTemplate.findByPk(projectCreated.report_template_id, { transaction });

    // Create a blank report for this project
    const blankReport = await Report.create(
      {
        project_id: projectCreated.id,
        report_template_id: projectCreated.report_template_id,
        name: reportTemplate ? reportTemplate.name : '',
        assessment_due_to: "",
        date_of_loss: null,
        date_of_assessment: null,
        answers: {},
        photos: [],
        status: true
      },
      { transaction }
    );

    await transaction.commit();
    return res.status(CREATED).json({
      data: { project: projectCreated, report: blankReport },
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
      { alias: "company", model: Customer, fields: ["company_name", "first_name", "last_name"] },
      { alias: "technician", model: User, fields: ["first_name", "last_name"] },
      { alias: "technicians", model: User, fields: ["first_name", "last_name"] },
    ];
    const filters = useFilter(req.query, Project, associations);
    let whereCondition = {
      ...filters.filter,
      ...filters.search,
    };
    // Build include filters for technicians
    const includeTechnicians = { model: User, as: "technicians", attributes: ["id", "first_name", "last_name"], through: { attributes: [] } };
    let technicianWhere = null;
    let technicianRequired = false;

    // If user is a technician, only show their projects (via M2M)
    if (req.user && req.user.role === USER_ROLE.TECHNICIAN) {
      technicianWhere = { id: req.user.id };
      technicianRequired = true;
    }
    // Filter by status (now supports multiple statuses)
    if (req.query.statusFilter && req.query.statusFilter !== "all") {
      let statusArray = req.query.statusFilter;
      if (!Array.isArray(statusArray)) {
        // Support comma-separated string or single value
        statusArray = statusArray.split(',').map(s => s.trim());
      }
      whereCondition.status = { [Op.in]: statusArray };
    }
    // Filter by Project Managers (pm_ids as array)
    if (req.query.pm_ids && Array.isArray(req.query.pm_ids)) {
      whereCondition.pm_id = { [Op.in]: req.query.pm_ids };
    } else if (req.query.pm_ids && typeof req.query.pm_ids === 'string') {
      // Support comma-separated string
      whereCondition.pm_id = { [Op.in]: req.query.pm_ids.split(',').map(s => s.trim()) };
    }
    // Filter by Technicians (technician_ids as array) using M2M
    if (req.query.technician_ids && Array.isArray(req.query.technician_ids)) {
      technicianWhere = { id: { [Op.in]: req.query.technician_ids } };
      technicianRequired = true;
    } else if (req.query.technician_ids && typeof req.query.technician_ids === 'string') {
      // Support comma-separated string
      technicianWhere = { id: { [Op.in]: req.query.technician_ids.split(',').map(s => s.trim()) } };
      technicianRequired = true;
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
      { model: Customer, as: "company", attributes: ["id", "company_name", "first_name", "last_name"], required: true },
      // Legacy single technician include (keep for backward compatibility/UI)
      { model: User, as: "technician", attributes: ["id", "first_name", "last_name"], required: false },
      // Multi-technicians include
      { ...includeTechnicians, required: technicianRequired, where: technicianWhere || undefined },
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
        { model: Customer, as: "company", attributes: ["id", "company_name", "first_name", "last_name"] },
        { model: User, as: "technician", attributes: ["id", "first_name", "last_name"] },
        { model: User, as: "technicians", attributes: ["id", "first_name", "last_name"], through: { attributes: [] } },
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
      project_no,
      name,
      site_name,
      site_contact_name,
      site_contact_title,
      project_type,
      report_template_id,
      site_email,
      location_id,
      specific_location,
      report_id,
      pm_id,
      technician_id,
      technician_ids,
      customer_id,
      start_date,
      end_date,
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
      // Only allow status change through controlled flows (not direct update)
      const updated = await Project.update(
        {
          project_no: project_no,
          name: name,
          site_name: site_name,
          site_contact_name,
          site_contact_title,
          project_type,
          report_template_id,
          // status: status, // Do not allow direct status update
          site_email: site_email,
          location_id: location_id,
          specific_location: specific_location,
          report_id: report_id,
          pm_id: pm_id,
          technician_id: Array.isArray(technician_ids) && technician_ids.length > 0 ? technician_ids[0] : technician_id,
          customer_id: customer_id,
          start_date: start_date,
          end_date: end_date,
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
  
      // Update technicians M2M if provided
      const updatedProject = await Project.findByPk(id);
      if (Array.isArray(technician_ids)) {
        await updatedProject.setTechnicians(technician_ids);
      } else if (technician_id) {
        await updatedProject.setTechnicians([technician_id]);
      }

      const reloaded = await Project.findByPk(id, {
        include: [
          { model: User, as: 'technicians', attributes: ['id', 'first_name', 'last_name'], through: { attributes: [] } }
        ]
      });
      res
        .status(OK)
        .json({
          code: OK,
          message: RECORD_UPDATED,
          data: reloaded,
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

// Controlled status update functions (examples):
exports.setProjectStatusInProgress = async (projectId) => {
  // Called when technician starts the report
  return Project.update(
    { status: "In Progress" },
    { where: { id: projectId } }
  );
};

exports.setProjectStatusPMReview = async (projectId) => {
  // Called when technician submits to PM
  return Project.update(
    { status: "PM Review" },
    { where: { id: projectId } }
  );
};

exports.setProjectStatusComplete = async (projectId) => {
  // Called when PM sends to customer
  return Project.update(
    { status: "Complete" },
    { where: { id: projectId } }
  );
};

// Update project status
exports.updateProjectStatus = async (req, res, next) => {
  try {
    const { user } = req;
    const { projectId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['New', 'In Progress', 'PM Review', 'Complete'];
    if (!validStatuses.includes(status)) {
      return res.status(BAD_REQUEST).json({ 
        code: BAD_REQUEST, 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 
        success: false 
      });
    }

    // Find the project
    const project = await Project.findByPk(projectId, {
      include: [
        { model: User, as: 'technicians', attributes: ['id'], through: { attributes: [] } }
      ]
    });
    if (!project) {
      return res.status(NOT_FOUND).json({ 
        code: NOT_FOUND, 
        message: NO_RECORD_FOUND, 
        success: false 
      });
    }

    // Check permissions based on role and status transition
    if (user.role === USER_ROLE.TECHNICIAN) {
      // Technicians can only update for their assigned projects
      const isAssigned = (project.technicians || []).some(t => t.id === user.id) || project.technician_id === user.id;
      if (!isAssigned) {
        const ApiError = new APIError(NOT_ACCESS, "You can only update status for your assigned projects", BAD_REQUEST);
        return ErrorHandler(ApiError, req, res, next);
      }
    } else if (user.role === USER_ROLE.PROJECT_MANAGER) {
      // PMs can update status for their assigned projects
      if (project.pm_id !== user.id) {
        const ApiError = new APIError(NOT_ACCESS, "You can only update status for your assigned projects", BAD_REQUEST);
        return ErrorHandler(ApiError, req, res, next);
      }
    } else if (user.role === USER_ROLE.ADMIN) {
      // Admins can update any project status
      // No additional checks needed
    } else {
      const ApiError = new APIError(NOT_ACCESS, "Insufficient permissions to update project status", BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }

    // Update the project status
    await Project.update(
      { status: status },
      { where: { id: projectId } }
    );

    res.status(OK).json({ 
      success: true, 
      message: `Project status updated to ${status} successfully` 
    });
  } catch (err) {
    next(err);
  }
};