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
  FORBIDDEN,
  UNPROCESSABLE_ENTITY,
} = require("../helpers/constants");
const { ErrorHandler } = require("../helpers/errorHandler");
const { useFilter } = require("../helpers/pagination");
const { sequelize, Report, Project, ReportTemplate, Customer, User, LabReport, LabReportResult, Location } = require("../models");
const puppeteer = require('puppeteer');
const AWS = require('aws-sdk');
const { AWS_REGION, AWS_BUCKET, AWS_S3_SECRET_ACCESS_KEY, AWS_S3_ACCESS_KEY_ID } = require("../config/use_env_variable");
const { Op } = require("sequelize");
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const upload = multer({ dest: 'uploads/' });
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const { sendEmail, uploadFileToS3 } = require("../utils/email");
const { renderTemplate, prepareReportData, getHeaderTemplate, getFooterTemplate } = require("../utils/templateRenderer");
dayjs.extend(customParseFormat);

// AWS S3 configuration
const s3 = new AWS.S3({
  accessKeyId: AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: AWS_S3_SECRET_ACCESS_KEY,
  region: AWS_REGION
});

// Helper function to upload to S3
const uploadToS3 = (file, reportId) => {
  if (!s3) {
    throw new Error('AWS S3 configuration is missing');
  }
  
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: AWS_BUCKET,
      Key: `reports/${reportId}/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };
    
    s3.upload(params, (err, data) => {
      if (err) {
        console.error('S3 Upload Error:', err);
        reject(err);
      } else {
        resolve(data.Location);
      }
    });
  });
};

exports.createReport = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { user } = req;
    const {
      name,
      project_id,
      report_template_id,
      assessment_due_to,
      date_of_loss,
      date_of_assessment,
      answers,
      photos,
      status
    } = req.body;

    if (user.role == USER_ROLE.TECHNICIAN) {
      const ApiError = new APIError(NOT_ACCESS, null, FORBIDDEN);
      return ErrorHandler(ApiError, req, res, next);
    }

    const reportCreated = await Report.create(
      {
        name: name,
        project_id,
        report_template_id,
        assessment_due_to,
        date_of_loss,
        date_of_assessment,
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
    // Custom sorting based on sortBy parameter
    let orderClause = [];
    if (req.query.sort)  {
      switch (req.query.sort) {
        case 'name_asc':
          orderClause = [['name', 'ASC']];
          break;
        case 'name_desc':
          orderClause = [['name', 'DESC']];
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
    options.include = [
      { model: Project, as: 'project', attributes: ["name"] },
      { model: ReportTemplate, as: 'template' },
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
      include: [
        { 
          model: Project, 
          as: 'project',
          include: [
            { model: Customer, as: 'company' },
            { model: User, as: 'pm' },
            { model: User, as: 'technician' },
            { model: User, as: 'technicians', through: { attributes: [] } }
          ]
        },
        { model: ReportTemplate, as: 'template' },
      ],
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
    const { id } = req.params;
    const {       
      name,
      project_id,
      report_template_id,
      assessment_due_to,
      date_of_loss,
      date_of_assessment,
      answers,
      photos,
      status
    } = req.body;

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

    const updateData = {
      project_id,
      report_template_id,
      assessment_due_to,
      date_of_loss,
      date_of_assessment,
      answers: answers,
      photos: photos,
      status: status
    };

    // Only add name to update if it's not undefined, null, or empty string
    if (name !== undefined && name !== null && name.trim() !== '') {
      updateData.name = name;
    }

    const updated = await Report.update(
      updateData,
      {
        where: { id: id },
        returning: true,
      }
    );
    console.log("updated=>", updated);
 
    // Update Project status to 'In Progress' only if answers is not empty/null/undefined/empty string
    const isAnswersFilled = (
      answers !== null &&
      answers !== undefined &&
      !(typeof answers === 'string' && answers.trim() === '') &&
      !(typeof answers === 'object' && Object.keys(answers).length === 0 && answers.constructor === Object)
    );
    
    // if (isAnswersFilled && project_id) {
    //   await Project.update(
    //     { status: 'In Progress' },
    //     {
    //       where: {
    //         id: project_id,
    //         status: { [Op.ne]: 'In Progress' }
    //       }
    //     }
    //   );
    // }

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
      const ApiError = new APIError(NOT_ACCESS, null, FORBIDDEN);
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
      const ApiError = new APIError(NOT_ACCESS, null, FORBIDDEN);
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

exports.generatePDFReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('Generating PDF for report ID:', id);

    const report = await Report.findByPk(id, {
      include: [
        { 
          model: Project, 
          as: "project", 
          include: [
            { model: Customer, as: 'company' },
            { model: User, as: 'technician' },
            { model: User, as: 'technicians', through: { attributes: [] } },
            { model: User, as: 'pm' },
            { model: Location, as: 'location' },
            { model: sequelize.models.ProjectDrawing, as: 'ProjectDrawings', attributes: ['id','project_id','file_name','file_url','is_marked','created_at'] }
          ]
        },
        { model: ReportTemplate, as: "template" },
      ],
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    console.log("report=>", report);
    // Prepare data for template
    let templateSchema = null;
    if (report.template && report.template.schema) {
      templateSchema = typeof report.template.schema === 'string' ? JSON.parse(report.template.schema) : report.template.schema;
    }
    const templateData = prepareReportData(
      report, 
      report.project, 
      report.project?.company,
      { useCurrentDate: false },
      templateSchema
    );

    // Render HTML using template
    const htmlContent = renderTemplate('report-pdf', templateData);
    console.log('HTML content generated, length:', htmlContent.length);

    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    // Increase timeouts for large reports/assets
    page.setDefaultNavigationTimeout(120000);
    page.setDefaultTimeout(120000);
    await page.setViewport({ width: 1280, height: 1690, deviceScaleFactor: 1 });

    // Set content and allow more time for resources
    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
    console.log('Page content set, allowing time for resources to load...');
    
    // Extra wait for remote images and fonts
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('Generating header template...');
    const headerTemplate = getHeaderTemplate('coloredsafetech.png');
    console.log('Header template generated, length:', headerTemplate.length);
    // console.log("templateData=>", templateData);
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      margin: { top: "100px", bottom: "80px", left: "50px", right: "50px" },
      headerTemplate: headerTemplate,
      footerTemplate: getFooterTemplate(templateData),
      timeout: 120000
    });

    console.log('PDF generated, buffer size:', pdfBuffer.length);
    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length,
      "Content-Disposition": `inline; filename="report-${report.id}.pdf"`,
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF report:", error);
    next(error);
  }
};

exports.uploadFiles = async (req, res, next) => {
  try {
    const { id } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      const apiError = new APIError("File upload error", "No files provided", BAD_REQUEST);
      return ErrorHandler(apiError, req, res, next);
    }

    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(NOT_FOUND).json({ 
        code: NOT_FOUND, 
        message: NO_RECORD_FOUND, 
        success: false 
      });
    }

    // Upload all files to S3
    const uploadPromises = files.map(file => uploadToS3(file, id));
    const urls = await Promise.all(uploadPromises);

    // Update report with new photo URLs
    const currentPhotos = report.photos || [];
    const updatedPhotos = [...currentPhotos, ...urls];
    
    await Report.update(
      { photos: updatedPhotos },
      { where: { id } }
    );

    res.status(OK).json({
      success: true,
      data: {
        urls
      },
      message: "Files uploaded successfully"
    });
  } catch (err) {
    next(err);
  }
};

exports.importLabReport = [
  upload.single('file'),
  async (req, res, next) => {
    try {
      const { project_id } = req.body;
      if (!req.file || !project_id) {
        return res.status(400).json({ error: 'CSV file and project_id are required.' });
      }

      // Find the project
      const project = await Project.findByPk(project_id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found.' });
      }

      const results = [];
      const filePath = path.resolve(req.file.path);
      
      fs.createReadStream(filePath)
      .pipe(csv({ headers: false }))
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        // Parse metadata
        const rawDateLine = results[3][0];
        let rawDate = null;
        if (rawDateLine) {
          const parts = rawDateLine.split(/:(.+)/); // splits into [label, value]
          if (parts.length > 1) {
            rawDate = parts[1].trim();
          }
        }
        let parsedDate = null;
        if (rawDate) {
          const d = dayjs(rawDate, 'M/D/YYYY h:mm:ss A');
          if (d.isValid()) {
            parsedDate = d.toDate();
          } else {
            return res.status(400).json({ error: 'Invalid date format in CSV: ' + rawDate });
          }
        }
        const metadata = {
          client: results[0][2],
          attention: results[1][2],
          work_order: results[2][0]?.split(':')[1]?.trim(),
          reference: results[2][2],
          report_date: parsedDate,
          project_number: results[3][2],
          project_id: project.id,
        };

        // Find where the parameter rows start (look for "Parameter" in the second column)
        const paramStartIdx = results.findIndex(row => row[1] === 'Parameter');
        const paramRows = results.slice(paramStartIdx + 2); // skip header rows

        // Save metadata
        const labReport = await LabReport.create(metadata);

        // Save results
        for (const row of paramRows) {
          if (!row[1]) continue; // skip empty rows
          await LabReportResult.create({
            lab_report_id: labReport.id,
            parameter: row[1],
            units: row[2],
            mrl: row[3],
            value: row[4],
          });
        }

        res.json({ success: true });

        // Delete the file after processing
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Failed to delete uploaded CSV:', err);
          }
        });
        
      });
    } catch (err) {
      next(err);
    }
  }
];

exports.getLabReportsForProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      dateFrom, 
      dateTo,
      includeResults = 'true' 
    } = req.query;

    // Validate project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(NOT_FOUND).json({
        code: NOT_FOUND,
        message: 'Project not found',
        success: false
      });
    }

    const whereCondition = {
      project_id: projectId
    };

    // Add date range filter
    if (dateFrom || dateTo) {
      whereCondition.report_date = {};
      if (dateFrom) whereCondition.report_date[Op.gte] = new Date(dateFrom);
      if (dateTo) whereCondition.report_date[Op.lte] = new Date(dateTo);
    }

    // Add search filter
    if (search) {
      whereCondition[Op.or] = [
        { client: { [Op.iLike]: `%${search}%` } },
        { work_order: { [Op.iLike]: `%${search}%` } },
        { reference: { [Op.iLike]: `%${search}%` } },
        { project_number: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const includeOptions = [
      {
        model: Project,
        as: 'project',
        attributes: ['name', 'project_no', 'site_name']
      }
    ];

    if (includeResults === 'true') {
      includeOptions.push({
        model: LabReportResult,
        as: 'results',
        attributes: ['parameter', 'units', 'mrl', 'value']
      });
    }

    const labReports = await LabReport.findAndCountAll({
      where: whereCondition,
      include: includeOptions,
      order: [['report_date', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.status(OK).json({
      code: OK,
      message: RECORDS_FOUND,
      data: {
        labReports: labReports.rows,
        pagination: {
          total: labReports.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(labReports.count / parseInt(limit))
        }
      },
      success: true
    });

  } catch (err) {
    next(err);
  }
};

exports.sendReportToCustomer = async (req, res, next) => {
  try {
    const { user } = req;
    if (!user || user.role !== USER_ROLE.PROJECT_MANAGER) {
      const ApiError = new APIError(NOT_ACCESS, null, FORBIDDEN);
      return ErrorHandler(ApiError, req, res, next);
    }
    const { reportId } = req.params;
    // Fetch report with project and customer
    const report = await Report.findByPk(reportId, {
      include: [
        {
          model: Project,
          as: 'project',
          include: [
            { model: Customer, as: 'company' },
            { model: User, as: 'pm' },
            { model: User, as: 'technician' },
            { model: User, as: 'technicians', through: { attributes: [] } },
            { model: Location, as: 'location' }
          ]
        },
        { model: ReportTemplate, as: 'template' },
      ],
    });
    if (!report) {
      return res.status(NOT_FOUND).json({ code: NOT_FOUND, message: NO_RECORD_FOUND, success: false });
    }
    const customer = report.project?.company;
    if (!customer || !customer.email) {
      return res.status(BAD_REQUEST).json({ code: BAD_REQUEST, message: 'Customer email not found', success: false });
    }
    
    // Prepare data for template
    const templateData = prepareReportData(
      report, 
      report.project, 
      customer,
      { useCurrentDate: true }
    );

    // Render HTML using template
    const htmlContent = renderTemplate('report-pdf', templateData);
    
    // Generate PDF using the same template
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Generating header template for email PDF...');
    const headerTemplate = getHeaderTemplate('coloredsafetech.png');
    console.log('Email header template generated, length:', headerTemplate.length);
    
    const pdfBuffer = await page.pdf({ 
      format: "A4", 
      printBackground: true,
      displayHeaderFooter: true,
      margin: { top: "120px", bottom: "100px", left: "50px", right: "50px" },
      headerTemplate: headerTemplate,
      footerTemplate: getFooterTemplate(templateData)
    });
    
    console.log('Email PDF generated, buffer size:', pdfBuffer.length);
    await browser.close();
    
    // Upload PDF to S3
    const pdfFilename = `report-${report.id}.pdf`;
    const pdfUrl = await uploadFileToS3(pdfBuffer, pdfFilename, 'application/pdf', 'reports', report.id.toString());
    
    // Send email with the S3 URL instead of attachment
    await sendEmail({
      to: customer.email,
      subject: `Your Safetech Report: ${report.name}`,
      html: `
        <p>Dear ${customer.name},</p>
        <p>Please find your designated substances survey report for the project: <strong>${report.project?.name || 'N/A'}</strong>.</p>
        <p>This report contains a comprehensive assessment of designated substances and hazardous materials that may be present at your project location.</p>
        <p><strong>Download your report:</strong> <a href="${pdfUrl}" target="_blank">${pdfFilename}</a></p>
        <p>If you have any questions about this report, please don't hesitate to contact us.</p>
        <p>Best regards,<br>Safetech Environmental Ltd.</p>
      `,
      template_name: undefined,
      template_data: undefined,
    });
    res.status(OK).json({ success: true, message: 'Report sent to customer.' });
  } catch (err) {
    next(err);
  }
};

// Submit report to PM review
exports.submitToPMReview = async (req, res, next) => {
  try {
    const { user } = req;
    const { reportId } = req.params;

    // Only technicians can submit reports to PM review
    if (user.role !== USER_ROLE.TECHNICIAN) {
      const ApiError = new APIError(NOT_ACCESS, "Only technicians can submit reports to PM review", FORBIDDEN);
      return ErrorHandler(ApiError, req, res, next);
    }

    // Find the report with project details
    const report = await Report.findByPk(reportId, {
      include: [
        { model: Project, as: 'project' }
      ]
    });

    if (!report) {
      return res.status(NOT_FOUND).json({ 
        code: NOT_FOUND, 
        message: NO_RECORD_FOUND, 
        success: false 
      });
    }

    // Check assignment using project_technicians join table, fallback to legacy technician_id
    const assignedCount = await sequelize.models.ProjectTechnician.count({
      where: { project_id: report.project_id, user_id: user.id }
    });
    const isAssignedTech = assignedCount > 0 || report.project?.technician_id === user.id;
    if (!isAssignedTech) {
      const ApiError = new APIError(NOT_ACCESS, "You can only submit your own reports", FORBIDDEN);
      return ErrorHandler(ApiError, req, res, next);
    }

    // Check if report has content (answers)
    if (!report.answers || Object.keys(report.answers).length === 0) {
      return res.status(UNPROCESSABLE_ENTITY).json({ 
        code: UNPROCESSABLE_ENTITY, 
        message: "Report must have content before submitting to PM review", 
        success: false 
      });
    }

    // Update project status to "PM Review"
    await Project.update(
      { status: "PM Review" },
      { where: { id: report.project_id } }
    );

    res.status(OK).json({ 
      success: true, 
      message: "Report submitted to PM review successfully" 
    });
  } catch (err) {
    next(err);
  }
};

// Approve and complete report
exports.approveAndCompleteReport = async (req, res, next) => {
  try {
    const { user } = req;
    const { reportId } = req.params;

    // Only project managers can approve and complete reports
    if (user.role !== USER_ROLE.PROJECT_MANAGER) {
      const ApiError = new APIError(NOT_ACCESS, "Only project managers can approve and complete reports", FORBIDDEN);
      return ErrorHandler(ApiError, req, res, next);
    }

    // Find the report with project details
    const report = await Report.findByPk(reportId, {
      include: [
        { model: Project, as: 'project' }
      ]
    });

    if (!report) {
      return res.status(NOT_FOUND).json({ 
        code: NOT_FOUND, 
        message: NO_RECORD_FOUND, 
        success: false 
      });
    }

    // Check if project is assigned to the PM
    if (report.project.pm_id !== user.id) {
      const ApiError = new APIError(NOT_ACCESS, "You can only approve reports for your assigned projects", FORBIDDEN);
      return ErrorHandler(ApiError, req, res, next);
    }

    // Check if project is in PM Review status
    if (report.project.status !== "PM Review") {
      return res.status(UNPROCESSABLE_ENTITY).json({ 
        code: UNPROCESSABLE_ENTITY, 
        message: "Project must be in PM Review status to be approved", 
        success: false 
      });
    }

    // Update project status to "Complete"
    await Project.update(
      { status: "Complete" },
      { where: { id: report.project_id } }
    );

    res.status(OK).json({ 
      success: true, 
      message: "Report approved and project completed successfully" 
    });
  } catch (err) {
    next(err);
  }
};

// Request changes for report
exports.requestReportChanges = async (req, res, next) => {
  try {
    const { user } = req;
    const { reportId } = req.params;
    const { feedback } = req.body;

    // Only project managers can request changes
    if (user.role !== USER_ROLE.PROJECT_MANAGER) {
      const ApiError = new APIError(NOT_ACCESS, "Only project managers can request report changes", FORBIDDEN);
      return ErrorHandler(ApiError, req, res, next);
    }

    // Find the report with project details
    const report = await Report.findByPk(reportId, {
      include: [
        { model: Project, as: 'project' }
      ]
    });

    if (!report) {
      return res.status(NOT_FOUND).json({ 
        code: NOT_FOUND, 
        message: NO_RECORD_FOUND, 
        success: false 
      });
    }

    // Check if project is assigned to the PM
    if (report.project.pm_id !== user.id) {
      const ApiError = new APIError(NOT_ACCESS, "You can only request changes for your assigned projects", FORBIDDEN);
      return ErrorHandler(ApiError, req, res, next);
    }

    // Check if project is in PM Review status
    if (report.project.status !== "PM Review") {
      return res.status(UNPROCESSABLE_ENTITY).json({ 
        code: UNPROCESSABLE_ENTITY, 
        message: "Project must be in PM Review status to request changes", 
        success: false 
      });
    }

    // Update project status back to "In Progress"
    await Project.update(
      { status: "In Progress" },
      { where: { id: report.project_id } }
    );

    // Store feedback in report if provided
    if (feedback) {
      await Report.update(
        { pm_feedback: feedback },
        { where: { id: reportId } }
      );
    }

    res.status(OK).json({ 
      success: true, 
      message: "Changes requested successfully. Project status updated to In Progress." 
    });
  } catch (err) {
    next(err);
  }
};
