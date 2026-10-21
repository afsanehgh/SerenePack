const express = require('express');
const routes = require('./routes');
const cors = require('cors');
const AppError = require('./errors/AppError');
const errorHandler = require('./middleware/errorHandler');
const requestContext = require('./middleware/requestContext');

require('dotenv').config();
const app = express();

app.use(requestContext);
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.json({ limit: '10kb' }));
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, !origin || allowedOrigins.includes(origin));
    },
  }),
);
app.use(routes);
app.use((req, res, next) => {
  next(new AppError(404, 'ROUTE_NOT_FOUND', 'Route not found.'));
});
app.use(errorHandler);

module.exports = app;
