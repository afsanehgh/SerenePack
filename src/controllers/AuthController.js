const bcrypt = require('bcryptjs');
const UserModel = require('../models/UserModel');
const { createAccessToken } = require('../security');
const AppError = require('../errors/AppError');

const SALT_ROUNDS = 12;

function respondWithToken(user, res, status = 200) {
  return res.status(status).json({
    token: createAccessToken(user._id.toString()),
    user: {
      id: user._id.toString(),
      email: user.email,
    },
  });
}

class AuthController {
  async register(req, res) {
    const email = req.body.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(req.body.password, SALT_ROUNDS);
    const user = await UserModel.create({ email, passwordHash });
    return respondWithToken(user, res, 201);
  }

  async login(req, res) {
    const email = req.body.email.trim().toLowerCase();
    const user = await UserModel.findOne({ email }).select('+passwordHash');
    if (
      !user ||
      !(await bcrypt.compare(req.body.password, user.passwordHash))
    ) {
      throw new AppError(
        401,
        'INVALID_CREDENTIALS',
        'Invalid email or password.',
      );
    }
    return respondWithToken(user, res);
  }
}

module.exports = new AuthController();
