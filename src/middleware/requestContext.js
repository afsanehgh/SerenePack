const { randomUUID } = require('crypto');

function requestContext(req, res, next) {
  req.requestId = randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  return next();
}

module.exports = requestContext;
