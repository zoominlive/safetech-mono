const AWS = require('aws-sdk');
const multer = require('multer');
const { sequelize, Project, ProjectDrawing } = require('../models');
const APIError = require('../helpers/apiError');
const {
  USER_ROLE,
  OK,
  CREATED,
  RECORDS_FOUND,
  RECORD_CREATED,
  RECORD_DELETED,
  NOT_FOUND,
  NO_RECORD_FOUND,
  BAD_REQUEST,
  NOT_ACCESS,
} = require('../helpers/constants');
const { ErrorHandler } = require('../helpers/errorHandler');
const { AWS_REGION, AWS_BUCKET, AWS_S3_SECRET_ACCESS_KEY, AWS_S3_ACCESS_KEY_ID } = require('../config/use_env_variable');

const s3 = new AWS.S3({
  accessKeyId: AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: AWS_S3_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

const ALLOWED_MIME = ['application/pdf', 'image/png', 'image/jpeg'];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

const isAllowed = (file) => ALLOWED_MIME.includes(file.mimetype) && file.size <= MAX_FILE_SIZE;

const uploadBufferToS3 = async (buffer, originalname, mimetype, projectId) => {
  const params = {
    Bucket: AWS_BUCKET,
    Key: `drawings/${projectId}/${Date.now()}-${originalname}`,
    Body: buffer,
    ContentType: mimetype,
    ACL: 'public-read',
  };
  const res = await s3.upload(params).promise();
  return res.Location;
};

exports.list = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(NOT_FOUND).json({ code: NOT_FOUND, message: NO_RECORD_FOUND, success: false });
    }

    const drawings = await ProjectDrawing.findAll({
      where: { project_id: projectId },
      order: [['created_at', 'DESC']],
      attributes: ['id', 'project_id', 'file_name', 'file_url', 'is_marked', 'created_at'],
    });

    return res.status(OK).json({ code: OK, message: RECORDS_FOUND, success: true, data: drawings });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { user } = req;
    if (!user || ![USER_ROLE.TECHNICIAN, USER_ROLE.PROJECT_MANAGER, USER_ROLE.SUPER_ADMIN].includes(user.role)) {
      const ApiError = new APIError(NOT_ACCESS, null, BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }

    const { projectId } = req.params;
    const project = await Project.findByPk(projectId);
    if (!project) {
      await transaction.rollback();
      return res.status(NOT_FOUND).json({ code: NOT_FOUND, message: NO_RECORD_FOUND, success: false });
    }

    const { files } = req;
    const { is_marked } = req.body;

    if (!files || files.length === 0) {
      await transaction.rollback();
      const ApiError = new APIError('File upload error', 'No files provided', BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }

    // Validate file types and sizes
    for (const f of files) {
      if (!isAllowed(f)) {
        await transaction.rollback();
        const ApiError = new APIError('Invalid file', 'Unsupported type or too large', BAD_REQUEST);
        return ErrorHandler(ApiError, req, res, next);
      }
    }

    // Upload to S3 and persist
    const created = [];
    for (const f of files) {
      const url = await uploadBufferToS3(f.buffer, f.originalname, f.mimetype, projectId);
      const rec = await ProjectDrawing.create({
        project_id: projectId,
        file_name: f.originalname,
        file_url: url,
        is_marked: String(is_marked).toLowerCase() === 'true',
        created_by: user.id,
      }, { transaction });
      created.push({ id: rec.id, project_id: rec.project_id, file_name: rec.file_name, file_url: rec.file_url, is_marked: rec.is_marked, created_at: rec.created_at });
    }

    await transaction.commit();
    return res.status(CREATED).json({ code: CREATED, message: RECORD_CREATED, success: true, data: created });
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { user } = req;
    if (!user || ![USER_ROLE.TECHNICIAN, USER_ROLE.PROJECT_MANAGER, USER_ROLE.SUPER_ADMIN].includes(user.role)) {
      const ApiError = new APIError(NOT_ACCESS, null, BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }

    const { projectId, drawingId } = req.params;
    const drawing = await ProjectDrawing.findOne({ where: { id: drawingId, project_id: projectId } });
    if (!drawing) {
      await transaction.rollback();
      return res.status(NOT_FOUND).json({ code: NOT_FOUND, message: NO_RECORD_FOUND, success: false });
    }

    // Try to delete underlying S3 object (best-effort). Key inferred from URL.
    try {
      const url = new URL(drawing.file_url);
      const key = decodeURIComponent(url.pathname.replace(/^\//, ''));
      await s3.deleteObject({ Bucket: AWS_BUCKET, Key: key }).promise();
    } catch (_) { /* ignore */ }

    await ProjectDrawing.destroy({ where: { id: drawingId } }, { transaction });
    await transaction.commit();
    return res.status(OK).json({ code: OK, message: RECORD_DELETED, success: true });
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
};


