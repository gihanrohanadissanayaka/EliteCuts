/**
 * Seed script — run once to populate initial data
 * Usage: node src/seed.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Package  = require('./models/Package');
const Event    = require('./models/Event');
const User     = require('./models/User');

const packages = [
  {
    name: 'Classic Cut',
    description: 'A precision haircut tailored to your style and face shape.',
    price: 1500,
    duration: 30,
    features: ['Consultation', 'Shampoo & blow-dry', 'Styled finish'],
    popular: false,
    order: 1,
  },
  {
    name: 'Elite Grooming',
    description: 'Full grooming experience — haircut, beard trim, and scalp massage.',
    price: 3500,
    duration: 60,
    features: ['Haircut', 'Beard sculpting', 'Hot towel shave', 'Scalp massage', 'Styling'],
    popular: true,
    order: 2,
  },
  {
    name: 'Color & Style',
    description: 'Professional hair coloring with a precision cut and style.',
    price: 6500,
    duration: 90,
    features: ['Color consultation', 'Full color application', 'Toning', 'Cut & style', 'Deep conditioning'],
    popular: false,
    order: 3,
  },
  {
    name: 'Kids Cut',
    description: 'Fun and friendly haircut experience for children under 12.',
    price: 800,
    duration: 20,
    features: ['Gentle shampoo', 'Precision kid-friendly cut', 'Blow-dry'],
    popular: false,
    order: 4,
  },
];

const events = [
  {
    title: 'Spring Style Week',
    description: 'Celebrate spring with 20% off all color and highlight services all week long!',
    date: new Date('2026-04-14'),
    time: '9:00 AM – 6:00 PM',
    tag: 'Promotion',
    isPublished: true,
  },
  {
    title: "Father's Day Special",
    description: 'Treat dad to the Elite Grooming package at a special discounted rate.',
    date: new Date('2026-06-15'),
    time: 'All Day',
    tag: 'Special Offer',
    isPublished: true,
  },
  {
    title: 'Grand Opening Anniversary',
    description: 'Celebrating 10 years of EliteCuts! Free scalp treatment with every booking.',
    date: new Date('2026-05-01'),
    time: '10:00 AM – 8:00 PM',
    tag: 'Event',
    isPublished: true,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('[Seed] Connected to MongoDB');

  // Clear existing
  await Package.deleteMany({});
  await Event.deleteMany({});
  console.log('[Seed] Cleared packages and events');

  // Insert packages
  await Package.insertMany(packages);
  console.log(`[Seed] Inserted ${packages.length} packages`);

  // Insert events
  await Event.insertMany(events);
  console.log(`[Seed] Inserted ${events.length} events`);

  // Create admin user if not exists
  const adminExists = await User.findOne({ email: 'admin@elitecuts.com' });
  if (!adminExists) {
    await User.create({
      name:     'Admin',
      email:    'admin@elitecuts.com',
      password: 'Admin@123',
      role:     'admin',
    });
    console.log('[Seed] Admin user created: admin@elitecuts.com / Admin@123');
  } else {
    console.log('[Seed] Admin user already exists — skipped');
  }

  await mongoose.disconnect();
  console.log('[Seed] Done.');
}

seed().catch((err) => {
  console.error('[Seed] Error:', err);
  process.exit(1);
});
