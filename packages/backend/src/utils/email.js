const AWS = require('aws-sdk');
const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');

const {
  EMAIL_FROM,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  AWS_BUCKET,
  AWS_S3_ACCESS_KEY_ID,
  AWS_S3_SECRET_ACCESS_KEY,
} = require('../config/use_env_variable');
const { thirdPartyErrorHandler } = require('../helpers/errorHandler');
const logger = require('../config/logger');

// Configure AWS SES
const ses = new AWS.SES({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

/**
 * Send email using AWS SES
 * @param {Object} mailOptions
 * @param {string} mailOptions.to
 * @param {string} mailOptions.subject
 * @param {string} mailOptions.html
 */
const sendMail = async ({ to, subject, html }) => {
  try {
    const params = {
      Source: EMAIL_FROM,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: html,
            Charset: 'UTF-8',
          },
        },
      },
    };

    const info = await ses.sendEmail(params).promise();
    logger.info(`Email sent to ${to}: ${info.MessageId}`);
  } catch (error) {
    thirdPartyErrorHandler('sendMail', error?.stack);
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    throw error;
  }
};

/**
 * Load and compile email template, then send email
 * @param {Object} templateInfo
 * @param {string} templateInfo.template_name - File name (e.g., "reset-password.html")
 * @param {Object} templateInfo.template_data - Data to inject into the template
 * @param {string} templateInfo.to - Recipient
 * @param {string} templateInfo.subject - Email subject
 * @param {string} [templateInfo.html] - Direct HTML content
 * 
 * @example
 * // Send email with S3 file link
 * await sendEmail({
 *   to: 'customer@example.com',
 *   subject: 'Your Report',
 *   html: '<p>Download your report: <a href="https://s3-url.com/report.pdf">Report.pdf</a></p>'
 * });
 * 
 * @example
 * // Send email with template and S3 file link
 * const fileUrl = await uploadFileToS3(pdfBuffer, 'report.pdf', 'application/pdf', 'reports', '123');
 * await sendEmail({
 *   to: 'customer@example.com',
 *   subject: 'Your Report',
 *   template_name: 'report-notification.html',
 *   template_data: { 
 *     customerName: 'John Doe',
 *     reportUrl: fileUrl,
 *     reportName: 'report.pdf'
 *   }
 * });
 */
exports.sendEmail = async ({ template_name, template_data, to, subject, html }) => {
  try {
    let htmlToSend;
    if (!template_name) {
      // If no template, use provided html directly
      htmlToSend = html || '';
    } else {
      const templatePath = path.join(__dirname, '../templates', template_name);
      const templateSource = fs.readFileSync(templatePath, 'utf-8');
      const template = handlebars.compile(templateSource);
      htmlToSend = template(template_data);
    }
    
    await sendMail({
      to,
      subject,
      html: htmlToSend,
    });
    
    // Return immediately
    return {
      res: 1,
      msg: 'Email sending initiated.',
    };
  } catch (error) {
    thirdPartyErrorHandler('sendEmail', error?.stack);
    logger.error(`Failed to process email template: ${error.message}`);
    throw error;
  }
};

/**
 * Upload file buffer to S3 and return public URL
 * @param {Buffer} fileBuffer - File content as buffer
 * @param {string} filename - Name of the file
 * @param {string} contentType - MIME type of the file
 * @param {string} folder - S3 folder path (e.g., 'reports', 'documents')
 * @param {string} id - Optional ID for organizing files
 * @returns {Promise<string>} S3 public URL
 */
exports.uploadFileToS3 = async (fileBuffer, filename, contentType, folder = 'documents', id = null) => {
  try {
    const s3 = new AWS.S3({
      accessKeyId: AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: AWS_S3_SECRET_ACCESS_KEY,
      region: AWS_REGION,
    });

    const key = id 
      ? `${folder}/${id}/${Date.now()}-${filename}`
      : `${folder}/${Date.now()}-${filename}`;

    const params = {
      Bucket: AWS_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      ACL: 'public-read'
    };

    const result = await s3.upload(params).promise();
    logger.info(`File uploaded to S3: ${result.Location}`);
    return result.Location;
  } catch (error) {
    thirdPartyErrorHandler('uploadFileToS3', error?.stack);
    logger.error(`Failed to upload file to S3: ${error.message}`);
    throw error;
  }
};
