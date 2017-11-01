const httpStatus = require('http-status');
const expressValidation = require('express-validation');
const MYError = require('../utils/MYError');
const { env } = require('../config/vars');

const handler = (err, req, res, next) => {
  const response = {
    code: err.status,
    message: err.message || httpStatus[err.status],
    errors: err.errors,
    success: err.success,
    stack: err.stack,
  };

  if (env !== 'development') {
    delete response.stack;
  }

  res.status(err.status);
  res.json(response);
  res.end();
};

exports.handler = handler;

exports.converter = (err, req, res, next) => {
  let convertedError = err;

  if (err instanceof expressValidation.ValidationError) {
    convertedError = new MYError({
      message: 'Validation error',
      success: err.success,
      errors: err.errors,
      status: err.status,
      stack: err.stack,
    });
  } else if (!(err instanceof MYError)) {
    convertedError = new MYError({
      message: err.message,
      success: err.success,
      status: err.status,
      stack: err.stack,
    });
  }

  return handler(convertedError, req, res);
};

exports.notFound = (req, res, next) => {
  const err = new MYError({
    message: 'Not found',
    status: httpStatus.NOT_FOUND,
  });
  return handler(err, req, res);
};
