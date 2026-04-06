/**
 * One-time migration:
 *  1. Unset the `customer` field on existing guest reviews (where it is null)
 *     so the sparse index ignores them.
 *  2. Drop and recreate the sparse unique index cleanly.
 *
 * Usage: node scripts/fix-review-index.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const { MONGO_USER, MONGO_PASS, MONGO_HOST, MONGO_DB = 'elitecuts', MONGO_URI } = process.env;
const uri = (MONGO_USER && MONGO_PASS && MONGO_HOST)
  ? `mongodb+srv://${encodeURIComponent(MONGO_USER)}:${encodeURIComponent(MONGO_PASS)}@${MONGO_HOST}/${MONGO_DB}?retryWrites=true&w=majority&appName=EliteCuts`
  : MONGO_URI;

(async () => {
  await mongoose.connect(uri);
  const col = mongoose.connection.collection('reviews');

  // 1. Remove explicit null from all guest reviews
  const { modifiedCount } = await col.updateMany(
    { customer: null },
    { $unset: { customer: '' } }
  );
  console.log(`✓ Unset customer field on ${modifiedCount} guest review(s).`);

  // 2. Drop the old index (ignore error if it doesn't exist)
  try {
    await col.dropIndex('customer_1');
    console.log('✓ Dropped old customer_1 index.');
  } catch {
    console.log('  (customer_1 index not found — skipping drop)');
  }

  // 3. Recreate the clean sparse unique index
  await col.createIndex({ customer: 1 }, { unique: true, sparse: true, name: 'customer_1' });
  console.log('✓ Recreated sparse unique index on customer.');

  await mongoose.disconnect();
  console.log('Done.');
})();
