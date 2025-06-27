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
const { sequelize, Report, Project, ReportTemplate, Customer, User, LabReport, LabReportResult } = require("../models");
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
const { sendEmail } = require("../utils/email");
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
      const ApiError = new APIError(NOT_ACCESS, null, BAD_REQUEST);
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
            { model: User, as: 'technician' }
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
    
    if (isAnswersFilled && project_id) {
      await Project.update(
        { status: 'In Progress' },
        {
          where: {
            id: project_id,
            status: { [Op.ne]: 'In Progress' }
          }
        }
      );
    }

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

exports.generatePDFReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    const report = await Report.findByPk(id, {
      include: [
        { model: Project, as: "project", attributes: ["name"] },
        { model: ReportTemplate, as: "template" },
      ],
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Prepare the HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Report PDF</title>
          <style>
            @page {
              margin: 120px 50px 100px 50px;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              margin: 0;
              padding: 0;
            }
            header {
              position: fixed;
              top: -100px;
              left: 0;
              right: 0;
              height: 100px;
              text-align: center;
              border-bottom: 1px solid #ccc;
            }
            footer {
              position: fixed;
              bottom: -80px;
              left: 0;
              right: 0;
              height: 50px;
              font-size: 10px;
              text-align: center;
              border-top: 1px solid #ccc;
            }
            .pagenum:before {
              content: counter(page);
            }
            h1, h2, h3 {
              color: #222;
              margin: 30px 0 10px;
            }
            .section {
              page-break-before: always;
              margin-top: 100px;
            }
            .cover {
              text-align: center;
              padding-top: 200px;
              font-size: 24px;
              font-weight: bold;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
            }
            td, th {
              border: 1px solid #ccc;
              padding: 8px;
            }
            .photos img {
              max-width: 300px;
              margin: 10px 0;
              page-break-inside: avoid;
            }
            .toc ul {
              list-style: none;
              padding-left: 0;
            }
            .toc li {
              margin-bottom: 5px;
            }
          </style>
        </head>
        <body>
          <header>
            <img src="https://safetech-dev-images.s3.ca-central-1.amazonaws.com/profiles/image.png" height="60" />
            <div>Safetech Environmental Ltd. | Confidential Assessment Report</div>
          </header>

          <footer>
            Page <span class="pagenum"></span>
          </footer>

          <div class="cover">
            <div>Assessment Report</div>
            <div>${report.name}</div>
            <div>Prepared for: ${report.answers?.clientName || "N/A"}</div>
          </div>

          <div class="section toc">
            <h2>Table of Contents</h2>
            <ul>
              <li>1. Executive Summary</li>
              <li>2. Project & Assessment Details</li>
              <li>3. Responses Summary</li>
              <li>4. Additional Photos</li>
            </ul>
          </div>

          <div class="section">
            <h2>1. Executive Summary</h2>
            <p>Safetech Environmental Limited (Safetech) was commissioned by <strong>${report.answers?.clientName || "N/A"}</strong> to conduct a designated substances and hazardous materials assessment in <strong>${report.answers?.projectLocationAddress || "N/A"}</strong>.</p>
            <p>The objective of the assessment was to determine the presence, location, condition and quantities of designated substances and other hazardous materials that have the potential to be disturbed as part of planned construction activities (<strong>${report.project?.name || "N/A"}</strong>) so that appropriate control measures can be implemented to protect workers during the work.</p>
            <p>A summary of the assessment results and general recommendations based on our findings are provided in the following sections. This should be considered a summary only. Please refer to Section 2.0 and Section 3.0 of the report for full details.</p>
          </div>

          <div class="section">
            <h2>2. Project & Assessment Details</h2>
            <p><strong>Project:</strong> ${report.project?.name || "N/A"}</p>
            <p><strong>Assessment Due To:</strong> ${report.assessment_due_to || "N/A"}</p>
            <p><strong>Date of Loss:</strong> ${report.date_of_loss || "N/A"}</p>
            <p><strong>Date of Assessment:</strong> ${report.date_of_assessment || "N/A"}</p>
          </div>

          <div class="section">
            <h2>3. Responses Summary</h2>
            <table>
              <tbody>
                ${Object.entries(report.answers || {})
                  .map(([key, value]) => {
                    let photoHtml = '';
                    // Check if this field has associated photos
                    const isPhotoField = key === 'sprayedFireproofingPhoto' || key === 'mechanicalPipeInsulationStraightsPhoto' || key === 'sprayedInsulationPhoto';
                    if (isPhotoField) {
                      if (Array.isArray(value) && value.length > 0) {
                        photoHtml = value.map(photo => `<img src="${photo}" alt="${key}" style="max-width: 300px; margin: 10px 0;" />`).join('');
                      }
                      // Only show images for photo fields
                      return `<tr><td>${key}</td><td>${photoHtml}</td></tr>`;
                    }

                    if (Array.isArray(value)) {
                      return `<tr>
                        <td>${key}</td>
                        <td>
                          ${value.map((v) => typeof v === "object" ? v.label || JSON.stringify(v) : v).join(", ")}
                        </td>
                      </tr>`;
                    } else if (typeof value === "object" && value !== null) {
                      return `<tr>
                        <td>${key}</td>
                        <td>
                          ${value.label || JSON.stringify(value)}
                        </td>
                      </tr>`;
                    } else {
                      return `<tr>
                        <td>${key}</td>
                        <td>
                          ${value}
                        </td>
                      </tr>`;
                    }
                  })
                  .join("")}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>4. Additional Photos</h2>
            ${
              report.photos?.length
                ? report.photos
                    .filter(photo => !photo.includes('sprayedFireproofingPhoto') && 
                                   !photo.includes('mechanicalPipeInsulationStraightsPhoto') && 
                                   !photo.includes('sprayedInsulationPhoto'))
                    .map(
                      (photo) =>
                        `<img src="${photo}" alt="Photo" style="max-width: 300px; margin: 10px 0;" />`
                    )
                    .join("")
                : "<p>No additional photos uploaded</p>"
            }
          </div>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "120px", bottom: "100px", left: "50px", right: "50px" },
    });

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
      const ApiError = new APIError(NOT_ACCESS, null, BAD_REQUEST);
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
            { model: Customer, as: 'company' }
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
    // Generate PDF (reuse generatePDFReport logic)
    const puppeteer = require('puppeteer');
    const htmlContent = `<!DOCTYPE html><html><head><meta charset=\"UTF-8\" /><title>Report PDF</title></head><body><h1>${report.name}</h1><p>Project: ${report.project?.name || "N/A"}</p></body></html>`; // Simplified for now
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();
    // Send email directly using sendMail from utils/email.js
    await sendEmail({
      to: customer.email,
      subject: `Your Safetech Report: ${report.name}`,
      attachments: [{ filename: `report-${report.id}.pdf`, content: pdfBuffer }],
      html: '<p>Please find your report attached.</p>',
      template_name: undefined,
      template_data: undefined,
    });
    res.status(OK).json({ success: true, message: 'Report sent to customer.' });
  } catch (err) {
    next(err);
  }
};
