const { INTERNAL_SERVER_ERROR } = require('./constants');

// API Error Response Structure
class APIError extends Error {
  constructor(message, errors = [], statusCode = INTERNAL_SERVER_ERROR) {
    super(message);
    this.message = message;
    this.errors = errors;
    this.status = statusCode;
  }
}

module.exports = APIError;
