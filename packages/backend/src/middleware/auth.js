const jwt = require('jsonwebtoken');
const { ErrorHandler } = require('../helpers/errorHandler');
const APIError = require('../helpers/apiError');
const { User } = require('../models');
const { UNAUTHORIZED, BAD_REQUEST, USER_NOT_FOUND, UNAUTHORIZE_ERROR } = require('../helpers/constants');
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

exports.authenticate = (req, res, next) => {
  try {
    const token =
      req.headers['x-access-token'] ||
      req.headers['authorization']?.split(' ')[1];
    console.log("token=>", token);
    if (!token) {
      const ApiError = new APIError(UNAUTHORIZE_ERROR, null, UNAUTHORIZED);
      return ErrorHandler(ApiError, req, res, next);
    } else {
      jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) {
          if (err?.name === 'TokenExpiredError') {
            const ApiError = new APIError(
              'Your token has been expired, Please login again',
              null,
              UNAUTHORIZED
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
            where: whereConditions
          });

          if (!user) {            
            const ApiError = new APIError(USER_NOT_FOUND, null, UNAUTHORIZED);
            return ErrorHandler(ApiError, req, res, next);
          }
          user = user.toJSON();
          req.user = user;
          next();
        }
      });
    }
  } catch (err) {  
    next(err);
  }
};