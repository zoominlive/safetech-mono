const { sendEmail } = require('../utils/email');
const crypto = require('crypto');

class EmailService {
  static async sendActivationEmail(user, baseUrl) {
    try {
      const activationUrl = `${baseUrl}/activate/${user.activation_token}`;

      await sendEmail({
        template_name: 'activate-account.html',
        template_data: {
          userName: user.first_name || 'User',
          activationLink: activationUrl
        },
        to: user.email,
        subject: 'Activate Your SafeTech Account'
      });
    } catch (error) {
      // Check if it's an SES verification error
      if (error.message && error.message.includes('Email address is not verified')) {
        console.warn('Development Mode: Email verification required in AWS SES');
        console.warn('Please verify the following email in AWS SES:', user.email);
        console.warn('Or use a pre-verified email address for testing');
        
        // In development, we can continue without sending the email
        if (process.env.NODE_ENV === 'development') {
          console.log('Development Mode: Skipping email send, continuing with user creation');
          return;
        }
      }
      throw error;
    }
  }

  static async sendPasswordResetEmail(user, baseUrl) {
    try {
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date();
      expires.setHours(expires.getHours() + 1); // Token expires in 1 hour

      // Update user with reset token
      await user.update({
        activation_token: token,
        activation_token_expires: expires
      });

      const resetUrl = `${baseUrl}/reset-password/${token}`;

      await sendEmail({
        template_name: 'reset-password.html',
        template_data: {
          userName: user.first_name || 'User',
          resetLink: resetUrl
        },
        to: user.email,
        subject: 'Reset Your SafeTech Password'
      });

      return token;
    } catch (error) {
      // Check if it's an SES verification error
      if (error.message && error.message.includes('Email address is not verified')) {
        console.warn('Development Mode: Email verification required in AWS SES');
        console.warn('Please verify the following email in AWS SES:', user.email);
        console.warn('Or use a pre-verified email address for testing');
        
        // In development, we can continue without sending the email
        if (process.env.NODE_ENV === 'development') {
          console.log('Development Mode: Skipping email send, continuing with password reset');
          return token;
        }
      }
      throw error;
    }
  }
}

module.exports = EmailService; 