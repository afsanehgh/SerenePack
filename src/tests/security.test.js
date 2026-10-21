const jwt = require('jsonwebtoken');
const {
  createAccessToken,
  getJwtSecret,
  verifyAccessToken,
} = require('../security');

describe('JWT security helpers', () => {
  const originalSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-jwt-secret-with-at-least-32-bytes';
  });

  afterAll(() => {
    if (originalSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalSecret;
    }
  });

  it('requires a secret with at least 32 UTF-8 bytes', () => {
    process.env.JWT_SECRET = 'short';
    expect(() => getJwtSecret()).toThrow(
      'JWT_SECRET must be set to at least 32 bytes.',
    );

    delete process.env.JWT_SECRET;
    expect(() => getJwtSecret()).toThrow(
      'JWT_SECRET must be set to at least 32 bytes.',
    );
  });

  it('creates a token with the expected identity and expiry claims', () => {
    const token = createAccessToken('user-123');
    const payload = jwt.decode(token);

    expect(payload).toMatchObject({
      sub: 'user-123',
      iss: 'sitemate-api',
      aud: 'sitemate-client',
    });
    expect(payload.exp).toEqual(expect.any(Number));
    expect(payload.exp).toBeGreaterThan(payload.iat);
  });

  it('verifies tokens and rejects tokens with invalid signatures', () => {
    const token = createAccessToken('user-123');

    expect(verifyAccessToken(token)).toMatchObject({ sub: 'user-123' });
    expect(() => verifyAccessToken(`${token.slice(0, -1)}x`)).toThrow();
  });

  it('rejects tokens signed with an unexpected algorithm', () => {
    const token = jwt.sign({ sub: 'user-123' }, getJwtSecret(), {
      algorithm: 'HS384',
      audience: 'sitemate-client',
      issuer: 'sitemate-api',
      expiresIn: '1h',
    });

    expect(() => verifyAccessToken(token)).toThrow();
  });
});
