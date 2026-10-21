const mongoose = require('mongoose');

const DEFAULT_MONGO_URI = 'mongodb://127.0.0.1:27017/petregister';

async function startDB() {
  const uri = process.env.MONGO_URI || DEFAULT_MONGO_URI;
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log('DB connected.');
}

module.exports = startDB;
