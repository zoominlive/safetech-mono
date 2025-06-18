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
const { sequelize, Report, Project, ReportTemplate } = require("../models");
const puppeteer = require('puppeteer');
const AWS = require('aws-sdk');
const { AWS_REGION, AWS_BUCKET, AWS_S3_SECRET_ACCESS_KEY, AWS_S3_ACCESS_KEY_ID } = require("../config/use_env_variable");

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
      { model: Project, as: 'project', attributes: ["name"] },
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
    const { user } = req;
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
