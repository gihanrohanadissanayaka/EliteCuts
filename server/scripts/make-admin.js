/**
 * One-time script — promote a user to admin by email.
 * Usage:  node scripts/make-admin.js your@email.com
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('../src/models/User');

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/make-admin.js <email>');
  process.exit(1);
}

const { MONGO_USER, MONGO_PASS, MONGO_HOST, MONGO_DB = 'elitecuts', MONGO_URI } = process.env;

const uri = (MONGO_USER && MONGO_PASS && MONGO_HOST)
  ? `mongodb+srv://${encodeURIComponent(MONGO_USER)}:${encodeURIComponent(MONGO_PASS)}@${MONGO_HOST}/${MONGO_DB}?retryWrites=true&w=majority&appName=EliteCuts`
  : MONGO_URI;

(async () => {
  await mongoose.connect(uri);
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { role: 'admin' },
    { new: true }
  );
  if (!user) {
    console.error(`No user found with email: ${email}`);
  } else {
    console.log(`✓ ${user.name} (${user.email}) is now an admin.`);
  }
  await mongoose.disconnect();
})();
