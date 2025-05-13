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
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(BAD_REQUEST).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role });

    // Optionally send verification email here

    res.status(CREATED).json({ message: 'Registered successfully', user });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });    
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(UNAUTHORIZED).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({ id: user.id, role: user.role, email: user.email });
    res.json({ token, user });
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
          userName: isUserExists.name,
          resetPasswordLink: formatLink,
          supportEmail: 'abc@gmail.com',
        },
      };

      try {
        const result = await sendEmail(templateInfo);
        if (result?.res === 0) {
          logger.error(
            'Email not sent to user for password change: ' +
              isUserExists.name +
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
            isUserExists.name +
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
        const isUserExists = await User.findOne({
          where: { email: decoded.email },
        });
        if (!isUserExists) {
          const ApiError = new APIError(EMAIL_NO_FOUND, null, NOT_FOUND);
          return ErrorHandler(ApiError, req, res, next);
        } else {
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
                name: isUserExists.name,
                email: isUserExists.email,
                role: isUserExists.role,
              },
              token,
            },
            code: OK,
            message: 'Email verified successfully',
            success: true,
          });
        }
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
          'name',
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
