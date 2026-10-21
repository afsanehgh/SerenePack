const { z } = require('zod');
const validateRequest = require('../middleware/validateRequest');

const email = z.string().trim().email().max(254);
const passwordWithinBcryptLimit = (schema) =>
  schema.refine(
    (value) => Buffer.byteLength(value, 'utf8') <= 72,
    'Password must not exceed 72 UTF-8 bytes.',
  );

const password = passwordWithinBcryptLimit(
  z.string().min(1, 'Password is required.'),
);

const register = validateRequest({
  body: z
    .object({
      email,
      password: passwordWithinBcryptLimit(
        z.string().min(12, 'Password must be at least 12 characters long.'),
      ),
    })
    .strict(),
});

const login = validateRequest({
  body: z
    .object({
      email,
      password,
    })
    .strict(),
});

module.exports = { register, login };
