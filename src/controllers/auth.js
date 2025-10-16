const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, PasswordResetToken } = require('../models');
const {
  BAD_REQUEST,
  CREATED,
  UNAUTHORIZED,
  NOT_FOUND,
  EMAIL_NO_FOUND,
  USER_NOT_ACTIVE,
  CATCH_ERROR,
  INTERNAL_SERVER_ERROR,
  OK,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_LINK_EXPIRED,
  RESET_PASSWORD_LINK_INVALID,
  PASSWORD_RESET_SUCCESS,
  RECORDS_FOUND,
  USER_LOGIN,
  ACTIVATION_LINK_EXPIRED,
  ACTIVATION_LINK_INVALID,
  ACCOUNT_ALREADY_ACTIVATED,
  ACCOUNT_ACTIVATED,
} = require("../helpers/constants");
const { generateToken } = require('../utils/token');
const { sendEmail } = require('../utils/email');
const APIError = require('../helpers/apiError');
const { JWT_SECRET, env, JWT_EXPIRESIN, FRONTEND_BASE_URL } = require('../config/use_env_variable');
const { ErrorHandler } = require('../helpers/errorHandler');
const logger = require('../config/logger');
const { updateUserWithLogs } = require('./user');

exports.register = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password, role } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(BAD_REQUEST).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ first_name, last_name, email, password: hashedPassword, role });

    // Generate activation token
    const activationToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: '24h',
      }
    );

    // Send activation email
    const frontendURL = env === 'development' ? 'http://localhost:5173' : FRONTEND_BASE_URL;
    const activationLink = `${frontendURL}/verify-email?token=${activationToken}`;

    const templateInfo = {
      template_name: 'activate-account.html',
      to: user.email,
      subject: 'Activate Your Account',
      template_data: {
        userName: user.first_name,
        activationLink,
      },
    };

    try {
      await sendEmail(templateInfo);
      logger.info(`Activation email sent to ${user.email}`);
    } catch (emailError) {
      logger.error(`Failed to send activation email to ${user.email}: ${emailError.message}`);
      // Don't throw error here, just log it
    }

    res.status(CREATED).json({ 
      message: 'Registered successfully. Please check your email to activate your account.',
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;
    const remember = rememberMe === true || rememberMe === 'true' || rememberMe === 1 || rememberMe === '1';

    const user = await User.findOne({ 
      where: { 
        email,
      }
    });    

    // First check if user exists and credentials are valid
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(UNAUTHORIZED).json({ 
        message: 'Invalid email or password',
        success: false
      });
    }

    // Check account status and provide appropriate message
    if (user.deactivated_user) {
      return res.status(UNAUTHORIZED).json({ 
        message: 'Your account has been deactivated. Please contact support for assistance.',
        success: false,
        account_status: 'deactivated'
      });
    }

    if (!user.is_verified) {
      return res.status(UNAUTHORIZED).json({ 
        message: 'Please verify your email address before logging in. Check your inbox for the verification link or request a new one.',
        success: false,
        account_status: 'unverified',
        email: user.email
      });
    }

    if (user.status === 'invited') {
      return res.status(UNAUTHORIZED).json({ 
        message: 'Please complete your account setup. Check your email for the activation link or request a new one.',
        success: false,
        account_status: 'pending_activation',
        email: user.email
      });
    }

    // Update last_login field
    await User.update(
      { last_login: new Date() },
      { where: { id: user.id } }
    );

    // Determine expiry: default 1 day, remember => 30 days
    const accessTokenTtl = remember ? '30d' : '1d';
    const token = generateToken({ id: user.id, role: user.role, email: user.email }, accessTokenTtl);

    res.json({ token, user, rememberMe: remember });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req?.body;
    const isUserExists = await User.findOne({
      where: { email: email.toLowerCase(), deactivated_user: false },
    });
    if (!isUserExists) {
      const ApiError = new APIError(EMAIL_NO_FOUND, null, NOT_FOUND);
      return ErrorHandler(ApiError, req, res, next);
    } else if (isUserExists.status == false) {
      const ApiError = new APIError(USER_NOT_ACTIVE, null, NOT_FOUND);
      return ErrorHandler(ApiError, req, res, next);
    } else if (!isUserExists.is_verified) {
      const ApiError = new APIError('Account is not verified. Please verify your account first.', null, BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    } else {
      const token = jwt.sign(
        {
          id: isUserExists.id,
          email: isUserExists.email,
        },
        JWT_SECRET,
        {
          expiresIn: '24h',
        }
      );

      await PasswordResetToken.create({
        user_id: isUserExists.id,
        token: token,
        expires_at: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
        is_used: false,
      });

      const frontendURL =
        env === 'development'
          ? 'http://localhost:5173'
          : FRONTEND_BASE_URL;

      const formatLink = `${frontendURL}/reset-password?token=${token}`;
      const templateInfo = {
        template_name: 'reset-password.html',
        to: isUserExists.email,
        subject: 'Reset Password Link',
        template_data: {
          userName: isUserExists.first_name,
          resetPasswordLink: formatLink,
          supportEmail: 'abc@gmail.com',
        },
      };

      try {
        const result = await sendEmail(templateInfo);
        if (result?.res === 0) {
          logger.error(
            'Email not sent to user for password change: ' +
              isUserExists.first_name +
              '(' +
              isUserExists.id +
              ')' +
              result?.msg
          );
          const ApiError = new APIError(
            CATCH_ERROR,
            null,
            INTERNAL_SERVER_ERROR
          );
          return ErrorHandler(ApiError, req, res, next);
        } else {
          logger.info('Email sent: ' + result?.msg);
          return res.status(OK).json({
            data: {},
            code: OK,
            message: RESET_PASSWORD_SUCCESS,
            success: true,
          });
        }
      } catch (emailError) {
        logger.error(
          'Failed to send email to user: ' +
            isUserExists.first_name +
            '(' +
            isUserExists.id +
            ')' +
            emailError.message
        );
        const ApiError = new APIError(CATCH_ERROR, null, INTERNAL_SERVER_ERROR);
        return ErrorHandler(ApiError, req, res, next);
      }
    }
  } catch (error) {
    return next(error);
  }
};

exports.isValidResetPage = async (req, res, next) => {
  try {
    const { token } = req?.query;

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          const ApiError = new APIError(
            RESET_PASSWORD_LINK_EXPIRED,
            null,
            BAD_REQUEST
          );
          return ErrorHandler(ApiError, req, res, next);
        } else {
          const ApiError = new APIError(
            RESET_PASSWORD_LINK_INVALID,
            null,
            BAD_REQUEST
          );
          return ErrorHandler(ApiError, req, res, next);
        }
      } else {
        const isValid = await PasswordResetToken.findOne({
          where: {
            user_id: decoded.id,
            is_used: false,
          },
        });
        if (!isValid) {
          const ApiError = new APIError(
            RESET_PASSWORD_LINK_INVALID,
            null,
            BAD_REQUEST
          );
          return ErrorHandler(ApiError, req, res, next);
        } else {
          const isUserExists = await User.findOne({
            where: { email: decoded.email },
          });
          if (!isUserExists) {
            const ApiError = new APIError(EMAIL_NO_FOUND, null, NOT_FOUND);
            return ErrorHandler(ApiError, req, res, next);
          } else {
            return res.status(OK).json({
              data: null,
              code: OK,
              message: RECORDS_FOUND,
              success: true,
            });
          }
        }
      }
    });
  } catch (err) {
    return next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { password, token } = req?.body;
    console.log('password, token==>', password, typeof(token));
    
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          const ApiError = new APIError(
            RESET_PASSWORD_LINK_EXPIRED,
            null,
            BAD_REQUEST
          );
          return ErrorHandler(ApiError, req, res, next);
        } else {
          console.log('err==>', err);
          
          const ApiError = new APIError(
            err,
            null,
            BAD_REQUEST
          );
          return ErrorHandler(ApiError, req, res, next);
        }
      } else {
        const isValid = await PasswordResetToken.findOne({
          where: {
            user_id: decoded.id,
            is_used: false,
          },
        });
        if (!isValid) {
          const ApiError = new APIError(
            RESET_PASSWORD_LINK_INVALID,
            null,
            BAD_REQUEST
          );
          return ErrorHandler(ApiError, req, res, next);
        } else {
          const isUserExists = await User.findOne({
            where: { email: decoded.email },
          });
          if (!isUserExists) {
            const ApiError = new APIError(EMAIL_NO_FOUND, null, NOT_FOUND);
            return ErrorHandler(ApiError, req, res, next);
          } else {
            const encryptedPassword = bcrypt.hashSync(password);
            const updateUser = {
              updateValue: { password: encryptedPassword },
              updateCondition: { id: isUserExists.id },
              req,
              change_logs: {
                activity: 'reset_password',
                description: 'updated_by_user',
              },
            };
            await updateUserWithLogs(updateUser);
            await PasswordResetToken.update(
              { is_used: true },
              {
                where: {
                  user_id: decoded.id,
                },
              }
            );
            return res.status(OK).json({
              data: null,
              code: OK,
              message: PASSWORD_RESET_SUCCESS,
              success: true,
            });
          }
        }
      }
    });
  } catch (err) {
    return next(err);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req?.query;

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          const ApiError = new APIError(ACTIVATION_LINK_EXPIRED, null, BAD_REQUEST);
          return ErrorHandler(ApiError, req, res, next);
        } else {
          const ApiError = new APIError(ACTIVATION_LINK_INVALID, null, BAD_REQUEST);
          return ErrorHandler(ApiError, req, res, next);
        }
      } else {
        const isUserExists = await User.findOne({
          where: { email: decoded.email },
        });
        if (!isUserExists) {
          const ApiError = new APIError(EMAIL_NO_FOUND, null, NOT_FOUND);
          return ErrorHandler(ApiError, req, res, next);
        }

        if (isUserExists.is_verified) {
          const ApiError = new APIError(ACCOUNT_ALREADY_ACTIVATED, null, BAD_REQUEST);
          return ErrorHandler(ApiError, req, res, next);
        }

        const updateUser = {
          updateValue: { is_verified: true },
          updateCondition: { id: isUserExists.id },
          req,
          change_logs: {
            activity: 'verify_email',
            description: 'updated_by_user',
          },
        };
        await updateUserWithLogs(updateUser);

        const token = jwt.sign(
          {
            id: isUserExists.id,
            email: isUserExists.email,
            role: isUserExists.role,
          },
          JWT_SECRET,
          {
            expiresIn: JWT_EXPIRESIN,
          }
        );

        return res.status(OK).json({
          data: {
            user: {
              id: isUserExists.id,
              first_name: isUserExists.first_name,
              email: isUserExists.email,
              role: isUserExists.role,
            },
            token,
          },
          code: OK,
          message: ACCOUNT_ACTIVATED,
          success: true,
        });
      }
    });
  } catch (err) {
    return next(err);
  }
};

exports.loginWithToken = async (req, res, next) => {
  let token = req?.query?.token;

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    console.log('decoded==>', decoded);
    
    if (err) {
      if (err?.name === 'TokenExpiredError') {
        const ApiError = new APIError(
          'Your token has been expired, Please login again',
          null,
          BAD_REQUEST
        );
        return ErrorHandler(ApiError, req, res, next);
      } else {
        const ApiError = new APIError(
          `Token verification failed for ${err?.message}`,
          null,
          UNAUTHORIZED
        );
        return ErrorHandler(ApiError, req, res, next);
      }
    } else {
      let whereConditions = {
        id: decoded.id,
        email: decoded.email,
        deactivated_user: false,
      };

      let user = await User.findOne({
        attributes: [
          'id',
          'first_name',
          'last_name',
          'email',
          'role',
          'phone',
          'is_verified',
        ],
        where: whereConditions,
      });

      if (!user) {
        const ApiError = new APIError(USER_NOT_FOUND, null, UNAUTHORIZED);
        return ErrorHandler(ApiError, req, res, next);
      }

      return res.status(OK).json({
        data: { user: user, token },
        code: OK,
        message: USER_LOGIN,
        success: true,
      });
    }
  });
};

/**
 * Change user password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} Response with status and message
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user?.id; // Assuming you have authentication middleware that adds user to req

    // Validate request
    if (!currentPassword || !newPassword || !confirmPassword) {
      const ApiError = new APIError('All password fields are required', null, BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }

    if (newPassword !== confirmPassword) {
      const ApiError = new APIError('New password and confirmation do not match', null, BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }

    // Find user by ID
    const user = await User.findOne({ where: { id: userId } });
    
    if (!user) {
      const ApiError = new APIError('User not found', null, NOT_FOUND);
      return ErrorHandler(ApiError, req, res, next);
    }

    // Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      const ApiError = new APIError('Current password is incorrect', null, UNAUTHORIZED);
      return ErrorHandler(ApiError, req, res, next);
    }

    // Hash new password
    const encryptedPassword = bcrypt.hashSync(newPassword, 10);

    // Update password using the existing updateUserWithLogs function
    const updateUser = {
      updateValue: { password: encryptedPassword },
      updateCondition: { id: userId },
      req,
      change_logs: {
        activity: 'change_password',
        description: 'password_updated_by_user',
      },
    };
    
    await updateUserWithLogs(updateUser);

    return res.status(OK).json({
      data: null,
      code: OK,
      message: 'Password updated successfully',
      success: true,
    });
    
  } catch (error) {
    logger.error(`Error changing password: ${error.message}`);
    return next(error);
  }
};
