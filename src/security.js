const jwt = require('jsonwebtoken');

const JWT_ISSUER = 'sitemate-api';
const JWT_AUDIENCE = 'sitemate-client';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error('JWT_SECRET must be set to at least 32 bytes.');
  }
  return secret;
}

function createAccessToken(userId) {
  return jwt.sign({ sub: userId }, getJwtSecret(), {
    algorithm: 'HS256',
    audience: JWT_AUDIENCE,
    expiresIn: '1h',
    issuer: JWT_ISSUER,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, getJwtSecret(), {
    algorithms: ['HS256'],
    audience: JWT_AUDIENCE,
    issuer: JWT_ISSUER,
  });
}

module.exports = { createAccessToken, getJwtSecret, verifyAccessToken };
