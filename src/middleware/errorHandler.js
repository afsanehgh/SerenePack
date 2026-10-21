const AppError = require('../errors/AppError');
const safeErrorMessage = require('../utils/safeErrorMessage');

function getErrorResponse(error) {
  if (error.code === 11000) {
    return {
      statusCode: 409,
      code: 'EMAIL_ALREADY_EXISTS',
      message: 'An account with that email already exists.',
    };
  }

  if (error.type === 'entity.too.large') {
    return {
      statusCode: 413,
      code: 'REQUEST_TOO_LARGE',
      message: 'Request body is too large.',
    };
  }

  if (error.type === 'entity.parse.failed') {
    return {
      statusCode: 400,
      code: 'INVALID_JSON',
      message: 'Request body must be valid JSON.',
    };
  }

  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      details: error.details,
    };
  }

  return {
    statusCode: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred.',
  };
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  const response = getErrorResponse(error);
  const body = {
    message: response.message,
    code: response.code,
    requestId: req.requestId,
  };

  if (response.details) body.errors = response.details;

  if (response.statusCode >= 500) {
    console.error(
      JSON.stringify({
        level: 'error',
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        error: {
          name: error.name || 'Error',
          message: safeErrorMessage(error),
        },
      }),
    );
  }

  return res.status(response.statusCode).json(body);
}

module.exports = errorHandler;
