const http = require('http');
const app = require('../App');
const AuthValidator = require('../validators/AuthValidator');
const PetValidator = require('../validators/PetValidator');

function runMiddleware(middleware, req) {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const next = jest.fn();

  middleware(req, res, next);

  return { req, res, next };
}

describe('Request validation', () => {
  let server;

  beforeAll(async () => {
    server = app.listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
  });

  afterAll(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it('requires authentication for pet routes', async () => {
    const address = server.address();
    const get = (path) =>
      new Promise((resolve, reject) => {
        http
          .get(
            {
              host: '127.0.0.1',
              port: address.port,
              path,
            },
            (response) => {
              let responseBody = '';
              response.setEncoding('utf8');
              response.on('data', (chunk) => {
                responseBody += chunk;
              });
              response.on('end', () =>
                resolve({
                  status: response.statusCode,
                  requestId: response.headers['x-request-id'],
                  body: JSON.parse(responseBody),
                }),
              );
            },
          )
          .on('error', reject);
      });

    await expect(get('/pet')).resolves.toMatchObject({
      status: 401,
      body: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required.',
      },
    });
  });

  it('trims pet data before validating and passing it to the controller', () => {
    const req = {
      body: {
        petName: '  Snowy  ',
        description: `  ${'a'.repeat(50)}  `,
      },
    };

    const { next } = runMiddleware(PetValidator.create, req);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.body).toEqual({
      petName: 'Snowy',
      description: 'a'.repeat(50),
    });
  });

  it('rejects a pet name that is empty after trimming', () => {
    const { res, next } = runMiddleware(PetValidator.create, {
      body: { petName: '   ', description: 'a'.repeat(50) },
    });

    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        code: 'VALIDATION_FAILED',
        details: [
          {
            field: 'body.petName',
            message: 'Pet name must be at least 2 characters long.',
          },
        ],
      }),
    );
  });

  it('requires pet descriptions to be at least 50 characters long', () => {
    const { res, next } = runMiddleware(PetValidator.create, {
      body: { petName: 'Snowy', description: 'a'.repeat(49) },
    });

    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'VALIDATION_FAILED',
        details: [
          {
            field: 'body.description',
            message: 'Description must be at least 50 characters long.',
          },
        ],
      }),
    );
  });

  it('rejects unexpected pet fields such as a client-supplied owner', () => {
    const { res, next } = runMiddleware(PetValidator.create, {
      body: {
        petName: 'Snowy',
        description: 'a'.repeat(50),
        owner: 'another-user',
      },
    });

    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'VALIDATION_FAILED' }),
    );
  });

  it('rejects malformed pet IDs with the common validation response', () => {
    const { res, next } = runMiddleware(PetValidator.read, {
      params: { id: 'not-an-object-id' },
    });

    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'VALIDATION_FAILED',
        details: [{ field: 'params.id', message: 'The ID is not valid.' }],
      }),
    );
  });

  it('applies the minimum password length only during registration', () => {
    const registerResult = runMiddleware(AuthValidator.register, {
      body: { email: 'user@example.com', password: 'short' },
    });
    const loginResult = runMiddleware(AuthValidator.login, {
      body: { email: 'user@example.com', password: 'short' },
    });

    expect(registerResult.res.status).not.toHaveBeenCalled();
    expect(registerResult.next).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'VALIDATION_FAILED' }),
    );
    expect(loginResult.next).toHaveBeenCalledTimes(1);
  });

  it('rejects unknown authentication fields', () => {
    const { res, next } = runMiddleware(AuthValidator.login, {
      body: {
        email: 'user@example.com',
        password: 'short',
        role: 'admin',
      },
    });

    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'VALIDATION_FAILED' }),
    );
  });

  it('returns 400 for malformed JSON and 413 for oversized bodies', async () => {
    const address = server.address();
    const send = (body, headers = {}) =>
      new Promise((resolve, reject) => {
        const request = http.request(
          {
            host: '127.0.0.1',
            port: address.port,
            path: '/auth/login',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(body),
              ...headers,
            },
          },
          (response) => {
            let responseBody = '';
            response.setEncoding('utf8');
            response.on('data', (chunk) => {
              responseBody += chunk;
            });
            response.on('end', () => {
              resolve({
                status: response.statusCode,
                requestId: response.headers['x-request-id'],
                body: JSON.parse(responseBody),
              });
            });
          },
        );

        request.on('error', reject);
        request.end(body);
      });

    await expect(send('{"email":')).resolves.toEqual({
      status: 400,
      requestId: expect.any(String),
      body: {
        message: 'Request body must be valid JSON.',
        code: 'INVALID_JSON',
        requestId: expect.any(String),
      },
    });

    await expect(
      send(JSON.stringify({ payload: 'a'.repeat(11 * 1024) })),
    ).resolves.toEqual({
      status: 413,
      requestId: expect.any(String),
      body: {
        message: 'Request body is too large.',
        code: 'REQUEST_TOO_LARGE',
        requestId: expect.any(String),
      },
    });

    await expect(
      send(JSON.stringify({ email: 'invalid', password: 'short' })),
    ).resolves.toMatchObject({
      status: 400,
      body: {
        message: 'Request validation failed.',
        code: 'VALIDATION_FAILED',
        requestId: expect.any(String),
        errors: expect.arrayContaining([
          expect.objectContaining({ field: 'body.email' }),
        ]),
      },
    });
  });
});
