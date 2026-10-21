const { verifyAccessToken } = require('../security');
const AppError = require('../errors/AppError');

function authenticate(req, res, next) {
  const authorization = req.get('Authorization');
  const match = authorization && authorization.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    return next(
      new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication required.'),
    );
  }

  try {
    const payload = verifyAccessToken(match[1]);
    if (typeof payload === 'string' || typeof payload.sub !== 'string') {
      return next(
        new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token.'),
      );
    }
    req.user = { id: payload.sub };
    return next();
  } catch (error) {
    if (error.message.includes('JWT_SECRET')) {
      return next(
        new AppError(
          500,
          'AUTHENTICATION_NOT_CONFIGURED',
          'Authentication is not configured.',
        ),
      );
    }
    return next(
      new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token.'),
    );
  }
}

module.exports = authenticate;
