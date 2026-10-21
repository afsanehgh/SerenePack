const AppError = require('../errors/AppError');

function validateRequest(schemas) {
  return (req, res, next) => {
    const errors = [];

    for (const location of ['params', 'query', 'body']) {
      const schema = schemas[location];
      if (!schema) continue;

      const result = schema.safeParse(req[location]);
      if (result.success) {
        req[location] = result.data;
        continue;
      }

      errors.push(
        ...result.error.issues.map((issue) => ({
          field: [location, ...issue.path].join('.'),
          message: issue.message,
        })),
      );
    }

    if (errors.length > 0) {
      return next(
        new AppError(
          400,
          'VALIDATION_FAILED',
          'Request validation failed.',
          errors,
        ),
      );
    }

    return next();
  };
}

module.exports = validateRequest;
