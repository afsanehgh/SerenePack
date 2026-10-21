const errorHandler = require('../middleware/errorHandler');
const AppError = require('../errors/AppError');
const safeErrorMessage = require('../utils/safeErrorMessage');
const formatError = require('../client/services/formatError');

describe('Centralized error handling', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      requestId: 'request-123',
      method: 'GET',
      path: '/pet',
    };
    res = {
      headersSent: false,
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('returns safe, consistent validation errors and preserves field details', () => {
    const error = new AppError(
      400,
      'VALIDATION_FAILED',
      'Request validation failed.',
      [{ field: 'body.petName', message: 'Pet name is required.' }],
    );

    errorHandler(error, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Request validation failed.',
      code: 'VALIDATION_FAILED',
      requestId: 'request-123',
      errors: [{ field: 'body.petName', message: 'Pet name is required.' }],
    });
  });

  it('does not expose unexpected internal errors to API clients', () => {
    const log = jest.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Database password must stay private');

    errorHandler(error, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'An unexpected error occurred.',
      code: 'INTERNAL_SERVER_ERROR',
      requestId: 'request-123',
    });
    expect(log).toHaveBeenCalledTimes(1);
    log.mockRestore();
  });

  it('maps database duplicate-key errors to a safe conflict response', () => {
    errorHandler(
      { code: 11000, message: 'private database detail' },
      req,
      res,
      jest.fn(),
    );

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: 'An account with that email already exists.',
      code: 'EMAIL_ALREADY_EXISTS',
      requestId: 'request-123',
    });
  });

  it('redacts credentials from database connection strings in logs', () => {
    expect(
      safeErrorMessage(
        new Error(
          'failed mongodb://private-user:private-password@db.example/pets',
        ),
      ),
    ).toBe('failed mongodb://[REDACTED]@db.example/pets');
  });
});

describe('CLI error messages', () => {
  it('shows safe API validation messages and request references', () => {
    expect(
      formatError({
        response: {
          data: {
            message: 'Request validation failed.',
            errors: [{ field: 'body.email', message: 'Invalid email.' }],
            requestId: 'request-123',
          },
        },
      }),
    ).toBe(
      'Request validation failed. body.email: Invalid email. (reference: request-123)',
    );
  });

  it('gives actionable messages when the API cannot be reached', () => {
    expect(formatError({ code: 'ECONNREFUSED' })).toBe(
      'Cannot reach the API. Start the server and try again.',
    );
  });

  it.each(['ECONNABORTED', 'ETIMEDOUT'])(
    'explains timeout error %s',
    (code) => {
      expect(formatError({ code })).toBe(
        'The API request timed out. Check the server and try again.',
      );
    },
  );

  it('uses a safe fallback for errors without an API response', () => {
    expect(formatError(new Error('socket failure'))).toBe(
      'The request could not be completed. Check your connection and try again.',
    );
  });

  it('uses a safe fallback if an API error response has no message', () => {
    expect(formatError({ response: { data: {} } })).toBe('The request failed.');
  });
});
