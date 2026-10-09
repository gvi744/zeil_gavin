const path = require('path');
const dotenv = require('dotenv');

// server/.env is the source of truth. A root .env is read as a fallback
// (dotenv never overrides a value that's already set).
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
};
