const { Router } = require('express');
const AuthController = require('./controllers/AuthController');
const PetController = require('./controllers/PetController');
const AuthValidator = require('./validators/AuthValidator');
const PetValidator = require('./validators/PetValidator');
const authenticate = require('./middleware/authenticate');
const asyncHandler = require('./middleware/asyncHandler');

const routes = Router();

routes.post(
  '/auth/register',
  AuthValidator.register,
  asyncHandler(AuthController.register),
);
routes.post(
  '/auth/login',
  AuthValidator.login,
  asyncHandler(AuthController.login),
);

routes.use('/pet', authenticate);
routes.post('/pet', PetValidator.create, asyncHandler(PetController.create));
routes.get('/pet/:id?', PetValidator.read, asyncHandler(PetController.read));
routes.delete(
  '/pet/:id',
  PetValidator.destroy,
  asyncHandler(PetController.destroy),
);
routes.put('/pet/:id', PetValidator.update, asyncHandler(PetController.update));

module.exports = routes;
