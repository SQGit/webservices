const httpStatus = require('http-status');

class ExtendableError extends Error {
  constructor({
    message, success, errors, status, isPublic, stack,
  }) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.success = success;
    this.errors = errors;
    this.status = status;
    this.isPublic = isPublic;
    this.isOperational = true;
    this.stack = stack;
  }
}

class MYError extends ExtendableError {
  constructor({
    message,
    success,
    errors,
    stack,
    status = httpStatus.INTERNAL_SERVER_ERROR,
    isPublic = false,
  }) {
    super({
      message, success, errors, status, isPublic, stack,
    });
  }
}

module.exports = MYError;
