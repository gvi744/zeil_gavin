const mongoose = require('mongoose');
const { MONGO_URI } = require('./config');

async function connectDb() {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not set. Add it to server/.env (see server/.env.example).');
  }
  await mongoose.connect(MONGO_URI);
  console.log(`[db] connected to ${mongoose.connection.host}/${mongoose.connection.name}`);
}

module.exports = { connectDb };
