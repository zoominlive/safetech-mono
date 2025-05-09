const logger = require("../config/logger");
const { INTERNAL_SERVER_ERROR } = require("./constants");

const Handler = (err, req, res, next) => {
  console.error('Error Stack Trace:', err.stack || err);

  const statusCode =
    typeof err.status === 'number' && err.status >= 400 && err.status < 600
      ? err.status
      : INTERNAL_SERVER_ERROR;

  const response = {
    code: statusCode,
    message: err.message || 'Internal Server Error',
    errors: err.errors || { default: err.message || 'Unexpected error occurred' },
    success: false,
  };

  res.status(statusCode).json(response);
};

exports.ErrorHandler = Handler;

exports.ValidationErrorHandler = (err, req, res, next) => {
  let ConvertedError = err;

  // Joi validation error
  if (err instanceof ValidationError) {
    const errors = {};
    Object.keys(err.details).forEach((key) => {
      err.details[key].forEach((e) => {
        errors[e.path[0]] = e.message.replace(/[^\w\s]/gi, '');
      });
    });

    ConvertedError = new APIError(VALIDATION_ERROR, errors, BAD_REQUEST);
  }

  // Unknown error (not already an APIError)
  else if (!(err instanceof APIError)) {
    const message =
      err?.response?.data?.error?.message || err?.message || CATCH_ERROR;

    if (!err.status || err.status >= 500) {
      logger.error(
        `${req?.ip} - ${req?.method} ${req?.originalUrl} - ${err?.status || 500} - ${message} - ${err?.stack}`
      );
    }

    ConvertedError = new APIError(
      message,
      null,
      err?.status || err?.response?.status || INTERNAL_SERVER_ERROR
    );
  }

  return Handler(ConvertedError, req, res, next);
};

exports.thirdPartyErrorHandler = (location, error) => {
  logger.error(`Location:-${location} - Response:-${JSON.stringify(error)}`);
};