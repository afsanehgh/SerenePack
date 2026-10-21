const app = require('./App');
const Loaders = require('./Loaders/index');
const { getJwtSecret } = require('./security');
const safeErrorMessage = require('./utils/safeErrorMessage');

async function start() {
  getJwtSecret();
  await Loaders.start();

  const port = Number(process.env.PORT) || 8000;
  const server = app.listen(port, () => {
    console.log(`API listening on port ${port}.`);
  });

  server.on('error', (error) => {
    console.error(`API failed to listen: ${safeErrorMessage(error)}`);
    process.exitCode = 1;
  });
}

start().catch((error) => {
  console.error(
    `API startup failed: ${error.name}: ${safeErrorMessage(error)}. Check JWT_SECRET and MongoDB configuration.`,
  );
  process.exitCode = 1;
});
