process.env.JWT_SECRET = 'test-jwt-secret-with-at-least-32-bytes';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AuthController = require('../controllers/AuthController');
const UserModel = require('../models/UserModel');
const authenticate = require('../middleware/authenticate');
const { createAccessToken } = require('../security');

jest.mock('../models/UserModel');

describe('Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('hashes the password and returns a token without exposing the hash', async () => {
      const req = {
        body: { email: 'PERSON@example.com', password: 'a-secure-password' },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      UserModel.create.mockImplementation(async (user) => ({
        ...user,
        _id: { toString: () => 'user-1' },
        email: user.email,
      }));

      await AuthController.register(req, res);

      const [createdUser] = UserModel.create.mock.calls[0];
      expect(createdUser.email).toBe('person@example.com');
      expect(
        await bcrypt.compare(req.body.password, createdUser.passwordHash),
      ).toBe(true);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json.mock.calls[0][0]).toMatchObject({
        user: { id: 'user-1', email: 'person@example.com' },
      });
      expect(res.json.mock.calls[0][0].user).not.toHaveProperty('passwordHash');
      expect(res.json.mock.calls[0][0].token).toEqual(expect.any(String));
    });
  });

  describe('login', () => {
    it('normalizes the email and returns a token for valid credentials', async () => {
      const req = {
        body: { email: ' PERSON@example.com ', password: 'a-secure-password' },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const user = {
        _id: { toString: () => 'user-1' },
        email: 'person@example.com',
        passwordHash: await bcrypt.hash(req.body.password, 4),
      };
      UserModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(user),
      });

      await AuthController.login(req, res);

      expect(UserModel.findOne).toHaveBeenCalledWith({
        email: 'person@example.com',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0]).toMatchObject({
        user: { id: 'user-1', email: 'person@example.com' },
        token: expect.any(String),
      });
    });

    it('returns a generic authentication error for incorrect credentials', async () => {
      const req = {
        body: { email: 'person@example.com', password: 'incorrect-password' },
      };
      UserModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(AuthController.login(req, {})).rejects.toMatchObject({
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      });
    });
  });

  describe('authenticate middleware', () => {
    it('rejects requests without a bearer token', () => {
      const req = { get: jest.fn().mockReturnValue(undefined) };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      authenticate(req, res, next);

      expect(res.status).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: 'AUTHENTICATION_REQUIRED',
        }),
      );
    });

    it('attaches the verified user id to the request', () => {
      const req = {
        get: jest.fn().mockReturnValue(`Bearer ${createAccessToken('user-1')}`),
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      authenticate(req, res, next);

      expect(req.user).toEqual({ id: 'user-1' });
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('forwards malformed tokens as typed authentication errors', () => {
      const req = { get: jest.fn().mockReturnValue('Bearer not-a-jwt') };
      const next = jest.fn();

      authenticate(req, {}, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token.',
        }),
      );
    });

    it('rejects validly signed tokens without a string subject', () => {
      const token = jwt.sign({ role: 'user' }, process.env.JWT_SECRET, {
        algorithm: 'HS256',
        audience: 'sitemate-client',
        expiresIn: '1h',
        issuer: 'sitemate-api',
      });
      const req = { get: jest.fn().mockReturnValue(`Bearer ${token}`) };
      const next = jest.fn();

      authenticate(req, {}, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: 'INVALID_TOKEN',
        }),
      );
    });

    it('reports missing JWT configuration as a server error', () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
      const req = { get: jest.fn().mockReturnValue('Bearer some-token') };
      const next = jest.fn();

      try {
        authenticate(req, {}, next);
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 500,
            code: 'AUTHENTICATION_NOT_CONFIGURED',
          }),
        );
      } finally {
        process.env.JWT_SECRET = originalSecret;
      }
    });
  });
});
