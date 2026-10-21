const startDB = require('./mongodb');

class Loaders {
  start() {
    return startDB();
  }
}

module.exports = new Loaders();
