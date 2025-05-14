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
const { sequelize, User } = require("../models");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const AWS = require("aws-sdk");

// Configure storage for local uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../../uploads/profiles");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `profile-${uniqueSuffix}${ext}`);
  }
});

// Configure multer
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
}).single('profilePicture');

// AWS S3 configuration
const s3 = process.env.AWS_ACCESS_KEY_ID ? new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
}) : null;

// Helper function to upload to S3
const uploadToS3 = (file) => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `profiles/${Date.now()}-${file.originalname}`,
      Body: fs.createReadStream(file.path),
      ContentType: file.mimetype,
      ACL: 'public-read'
    };
    
    s3.upload(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        // Remove local file after successful upload
        fs.unlink(file.path, () => {
          console.log(`Local file deleted: ${file.path}`);
        });
        resolve(data.Location);
      }
    });
  });
};

exports.createUser = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { user } = req;
    const { name, email, phone, role, password } = req.body;

    if (user.role == USER_ROLE.TECHNICIAN) {
      const ApiError = new APIError(NOT_ACCESS, null, BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }

    const userCreated = await User.create(
      {
        name: name,
        email: email,
        phone: phone,
        role: role,
        password: password,
        created_by: user.id
      },
      { transaction }
    );

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
    };
    const options = {
      where: whereCondition,
      order: filters.sort,
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
    const { name, email, phone, role, created_by } = req.body;

    // if (user.role == USER_ROLE.TECHNICIAN) {
    //   const ApiError = new APIError(NOT_ACCESS, null, BAD_REQUEST);
    //   return ErrorHandler(ApiError, req, res, next);
    // }

    const updated = await User.update(
      { name: name, email: email, phone: phone, role: role, created_by: created_by },
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
      const ApiError = new APIError(NOT_ACCESS, null, BAD_REQUEST);
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
    upload(req, res, async function(err) {
      if (err instanceof multer.MulterError) {
        // A multer error occurred when uploading
        const apiError = new APIError("File upload error", err.message, BAD_REQUEST);
        return ErrorHandler(apiError, req, res, next);
      } else if (err) {
        // An unknown error occurred
        const apiError = new APIError("File upload error", err.message, BAD_REQUEST);
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
      
      let profilePictureUrl = '';
      
      // Determine if we should use S3 or local storage
      if (process.env.USE_AWS_S3 === 'true' && s3) {
        try {
          // Upload to S3
          profilePictureUrl = await uploadToS3(req.file);
        } catch (s3Error) {
          const apiError = new APIError("S3 upload error", s3Error.message, BAD_REQUEST);
          return ErrorHandler(apiError, req, res, next);
        }
      } else {
        // Use local path
        profilePictureUrl = `/uploads/profiles/${req.file.filename}`;
      }
      
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
    });
  } catch (err) {
    next(err);
  }
};
