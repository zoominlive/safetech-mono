const AWS = require('aws-sdk');
const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');

const {
  EMAIL_FROM,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
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
 * @param {Array} [mailOptions.attachments]
 */
const sendMail = async ({ to, subject, html, attachments = [] }) => {
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
 * @param {Array} [templateInfo.attachments] - Optional attachments
 */
exports.sendEmail = async ({ template_name, template_data, to, subject, attachments, html }) => {
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
