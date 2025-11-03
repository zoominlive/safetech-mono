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
  FORBIDDEN
} = require("../helpers/constants");
const { ErrorHandler } = require("../helpers/errorHandler");
const { useFilter } = require("../helpers/pagination");
const { sequelize, User, Sequelize } = require("../models");
const AWS = require("aws-sdk");
const EmailService = require("../services/emailService");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { AWS_REGION, AWS_BUCKET, AWS_S3_SECRET_ACCESS_KEY, AWS_S3_ACCESS_KEY_ID } = require("../config/use_env_variable");

// AWS S3 configuration
const s3 = new AWS.S3({
  accessKeyId: AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: AWS_S3_SECRET_ACCESS_KEY,
  region: AWS_REGION
});

// Helper function to upload to S3
const uploadToS3 = (file) => {
  if (!s3) {
    throw new Error('AWS S3 configuration is missing');
  }
  
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: AWS_BUCKET,
      Key: `profiles/${Date.now()}-${file.originalname}`,
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

exports.createUser = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { user } = req;
    const { email, phone, role, first_name, last_name, profile_picture, technician_signature } = req.body;

    if (user.role == USER_ROLE.TECHNICIAN) {
      const ApiError = new APIError(NOT_ACCESS, null, FORBIDDEN);
      return ErrorHandler(ApiError, req, res, next);
    }

    // Generate activation token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // Token expires in 24 hours

    const userCreated = await User.create(
      {
        email: email,
        phone: phone,
        role: role,
        created_by: user.id,
        first_name: first_name,
        last_name: last_name,
        profile_picture: profile_picture,
        technician_signature: technician_signature,
        status: 'invited',
        activation_token: token,
        activation_token_expires: expires
      },
      { transaction }
    );

    // Send activation email
    const baseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
    
    try {
      await EmailService.sendActivationEmail(userCreated, baseUrl);
    } catch (error) {
      // If we're in development and it's an SES verification error, continue
      if (process.env.NODE_ENV === 'development' && 
          error.message && 
          error.message.includes('Email address is not verified')) {
        console.log('Development Mode: User created successfully, but email not sent');
      } else {
        throw error; // Re-throw other errors
      }
    }

    await transaction.commit();
    return res.status(CREATED).json({
      data: userCreated,
      code: CREATED,
      message: RECORD_CREATED,
      success: true,
    });
  } catch (err) {
    await transaction.rollback();
    return next(err);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const filters = useFilter(req.query, User);
    let whereCondition = {
      ...filters.filter,
      ...filters.search,
      id: { [Sequelize.Op.not]: req.user.id }, // This excludes the current user
    };
    // Custom sorting based on sortBy parameter
    let orderClause = [];
    if (req.query.sort)  {
      switch (req.query.sort) {
        case 'name_asc':
          orderClause = [['first_name', 'ASC']];
          break;
        case 'name_desc':
          orderClause = [['first_name', 'DESC']];
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
    // Add role filtering if role parameter is provided
    if (req.query.role) {
      whereCondition.role = req.query.role;
    }
    
    const options = {
      where: whereCondition,
      order: orderClause,
      limit: filters.limit,
      offset: filters.page ? (filters.page - 1) * filters.limit : undefined,
    };
    const users = await User.findAndCountAll(options);
    res.status(OK).json({
      data: users,
      code: OK,
      message: RECORDS_FOUND,
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res
        .status(NOT_FOUND)
        .json({ code: NOT_FOUND, message: NO_RECORD_FOUND, success: false });
    }

    res
      .status(OK)
      .json({ data: user, code: OK, message: RECORDS_FOUND, success: true });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { user } = req;
    const { id } = req.params;
    const { email, phone, role, created_by, first_name, last_name, profile_picture, technician_signature, deactivated_user } = req.body;

    if (user.role == USER_ROLE.TECHNICIAN && user.id != id) {
      const ApiError = new APIError(NOT_ACCESS, null, FORBIDDEN);
      return ErrorHandler(ApiError, req, res, next);
    }

    const updated = await User.update(
      {
        email: email,
        phone: phone,
        role: role,
        created_by: created_by,
        first_name: first_name,
        last_name: last_name,
        profile_picture: profile_picture,
        technician_signature: technician_signature,
        deactivated_user: deactivated_user
      },
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

    const updatedUser = await User.findByPk(id);
    res
      .status(OK)
      .json({
        code: OK,
        message: RECORD_UPDATED,
        data: updatedUser,
        success: true,
      });
  } catch (err) {
    next(err);
  }
};

module.exports.updateUserWithLogs = async (updateUser = {}) => {
  const { updateValue, updateCondition, req, change_logs } = updateUser;
  try {
    const oldUser = await User.findOne({
      where: updateCondition,
    });

    const newUser = await User.update(updateValue, {
      where: updateCondition,
    });
    
    return true;
  } catch (error) {
    logger.error(
      `${req?.ip} - ${req?.method} - ${req?.originalUrl} - ${
        error?.status || 500
      } - ${error?.message} - ${error?.stack}`
    );
    return false;
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const fetchedUser = await User.findByPk(id);

    if (user.role == USER_ROLE.TECHNICIAN) {
      const ApiError = new APIError(NOT_ACCESS, null, FORBIDDEN);
      return ErrorHandler(ApiError, req, res, next);
    }

    if (!fetchedUser) {
      return res
        .status(NOT_FOUND)
        .json({ code: NOT_FOUND, message: NO_RECORD_FOUND, success: false });
    }

    await fetchedUser.destroy();
    res.status(OK).json({ code: OK, message: RECORD_DELETED, success: true });
  } catch (err) {
    next(err);
  }
};

/**
 * Upload profile picture for a user
 */
exports.uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      const apiError = new APIError("File upload error", "No file provided", BAD_REQUEST);
      return ErrorHandler(apiError, req, res, next);
    }

    const { id } = req.params;
    const userToUpdate = await User.findByPk(id);
    
    if (!userToUpdate) {
      return res.status(NOT_FOUND).json({ 
        code: NOT_FOUND, 
        message: NO_RECORD_FOUND, 
        success: false 
      });
    }
    
    try {
      // Upload to S3
      const profilePictureUrl = await uploadToS3(req.file);
      
      // Update the user with the profile picture URL
      await User.update(
        { profile_picture: profilePictureUrl },
        {
          where: { id: id },
          returning: true,
        }
      );
      
      const updatedUser = await User.findByPk(id);
      
      res.status(OK).json({
        code: OK,
        message: RECORD_UPDATED,
        data: updatedUser,
        success: true,
      });
    } catch (s3Error) {
      const apiError = new APIError("S3 upload error", s3Error.message, BAD_REQUEST);
      return ErrorHandler(apiError, req, res, next);
    }
  } catch (err) {
    next(err);
  }
};

exports.uploadTechnicianSignature = async (req, res, next) => {
  try {
    if (!req.file) {
      const apiError = new APIError("File upload error", "No file provided", BAD_REQUEST);
      return ErrorHandler(apiError, req, res, next);
    }

    const { id } = req.params;
    const userToUpdate = await User.findByPk(id);
    
    if (!userToUpdate) {
      return res.status(NOT_FOUND).json({ 
        code: NOT_FOUND, 
        message: NO_RECORD_FOUND, 
        success: false 
      });
    }
    
    try {
      // Upload to S3
      const signatureUrl = await uploadToS3(req.file);
      
      // Update the user with the profile picture URL
      await User.update(
        { technician_signature: signatureUrl },
        {
          where: { id: id },
          returning: true,
        }
      );
      
      const updatedUser = await User.findByPk(id);
      
      res.status(OK).json({
        code: OK,
        message: RECORD_UPDATED,
        data: updatedUser,
        success: true,
      });
    } catch (s3Error) {
      const apiError = new APIError("S3 upload error", s3Error.message, BAD_REQUEST);
      return ErrorHandler(apiError, req, res, next);
    }
  } catch (err) {
    next(err);
  }
};

exports.activateUser = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      where: {
        activation_token: token,
        activation_token_expires: { [Sequelize.Op.gt]: new Date() },
        status: 'invited'
      }
    });

    if (!user) {
      return res.status(BAD_REQUEST).json({
        code: BAD_REQUEST,
        message: 'Invalid or expired activation token',
        success: false
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user
    await user.update({
      password: hashedPassword,
      status: 'activated',
      activation_token: null,
      activation_token_expires: null,
      is_verified: true
    });

    res.status(OK).json({
      code: OK,
      message: 'Account activated successfully',
      success: true
    });
  } catch (err) {
    next(err);
  }
};

exports.resendActivationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({
      where: {
        email,
        status: 'invited'
      }
    });

    if (!user) {
      return res.status(NOT_FOUND).json({
        code: NOT_FOUND,
        message: 'No invited user found with this email',
        success: false
      });
    }

    // Generate new token if current one is null or expired
    const now = new Date();
    if (!user.activation_token || !user.activation_token_expires || user.activation_token_expires < now) {
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date();
      expires.setHours(expires.getHours() + 24); // Token expires in 24 hours

      await user.update({
        activation_token: token,
        activation_token_expires: expires
      });
    }

    const baseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
    await EmailService.sendActivationEmail(user, baseUrl);

    res.status(OK).json({
      code: OK,
      message: 'Activation email sent successfully',
      success: true
    });
  } catch (err) {
    next(err);
  }
};
