const nodemailer = require('nodemailer');
const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');

const {
  EMAIL_FROM,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USERNAME,
  SMTP_PASSWORD,
} = require('../config/use_env_variable');
const { thirdPartyErrorHandler } = require('../helpers/errorHandler');
const logger = require('../config/logger');

// Create mail transporter
const mailTransporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  auth: {
    user: SMTP_USERNAME,
    pass: SMTP_PASSWORD,
  },
});

/**
 * Send email using nodemailer
 * @param {Object} mailOptions
 * @param {string} mailOptions.to
 * @param {string} mailOptions.subject
 * @param {string} mailOptions.html
 * @param {Array} [mailOptions.attachments]
 */
const sendMail = async ({ to, subject, html, attachments = [] }) => {
  try {
    const info = await mailTransporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      attachments,
    });

    logger.info(`Email sent to ${to}: ${info.response}`);
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
 * @param {Array} [templateInfo.attachments] - Optional attachments
 */
exports.sendEmail = async ({ template_name, template_data, to, subject, attachments }) => {
  try {
    const templatePath = path.join(__dirname, '../templates', template_name);
    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateSource);

    const htmlToSend = template(template_data);

    await sendMail({
      to,
      subject,
      html: htmlToSend,
      attachments,
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
