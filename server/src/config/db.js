const mongoose = require('mongoose');

async function connectDB() {
  // Build URI from parts so special characters in the password are safely encoded
  const user = process.env.MONGO_USER;
  const pass = process.env.MONGO_PASS;
  const host = process.env.MONGO_HOST;
  const db   = process.env.MONGO_DB || 'elitecuts';

  // Fall back to a raw MONGO_URI if the split vars are not set
  const uri = (user && pass && host)
    ? `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}/${db}?retryWrites=true&w=majority&appName=EliteCuts`
    : process.env.MONGO_URI;

  if (!uri) {
    console.error('[DB] No MongoDB connection details found in environment variables.');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log('[DB] MongoDB connected');
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
