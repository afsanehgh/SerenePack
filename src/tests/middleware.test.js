const asyncHandler = require('../middleware/asyncHandler');
const requestContext = require('../middleware/requestContext');
const errorHandler = require('../middleware/errorHandler');

describe('Shared middleware', () => {
  it('forwards async handler rejections to Express error handling', async () => {
    const error = new Error('request failed');
    const next = jest.fn();
    const handler = asyncHandler(() => Promise.reject(error));

    handler({}, {}, next);
    await Promise.resolve();

    expect(next).toHaveBeenCalledWith(error);
  });

  it('adds a request ID to the request and response header', () => {
    const req = {};
    const res = { setHeader: jest.fn() };
    const next = jest.fn();

    requestContext(req, res, next);

    expect(req.requestId).toEqual(expect.any(String));
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-Id', req.requestId);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('passes errors onward when a response has already been sent', () => {
    const error = new Error('write after send');
    const next = jest.fn();
    const res = {
      headersSent: true,
      status: jest.fn(),
      json: jest.fn(),
    };

    errorHandler(error, { requestId: 'request-1' }, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it.each([
    [
      { type: 'entity.parse.failed' },
      400,
      'INVALID_JSON',
      'Request body must be valid JSON.',
    ],
    [
      { type: 'entity.too.large' },
      413,
      'REQUEST_TOO_LARGE',
      'Request body is too large.',
    ],
  ])(
    'maps parser failures to safe HTTP responses',
    (error, status, code, message) => {
      const req = {
        requestId: 'request-1',
        method: 'POST',
        path: '/auth/login',
      };
      const res = {
        headersSent: false,
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      errorHandler(error, req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(status);
      expect(res.json).toHaveBeenCalledWith({
        message,
        code,
        requestId: 'request-1',
      });
    },
  );
});
