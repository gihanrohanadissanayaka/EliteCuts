const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');

const authRoutes        = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const packageRoutes     = require('./routes/packages');
const eventRoutes       = require('./routes/events');
const reviewRoutes      = require('./routes/reviews');
const errorHandler      = require('./middleware/errorHandler');

const app = express();

/* ─── Security ────────────────────────────────────────────────────────── */
app.use(helmet());

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, Postman)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS policy: origin ${origin} is not allowed`));
  },
  credentials: true,
}));

// Global rate limiter – 100 requests per 15 min per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use(limiter);

/* ─── Body parsing ────────────────────────────────────────────────────── */
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/* ─── Logging ─────────────────────────────────────────────────────────── */
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

/* ─── Health check ────────────────────────────────────────────────────── */
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'EliteCuts API' }));

/* ─── Routes ──────────────────────────────────────────────────────────── */
app.use('/api/auth',         authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/packages',     packageRoutes);
app.use('/api/events',       eventRoutes);
app.use('/api/reviews',      reviewRoutes);

/* ─── 404 handler ─────────────────────────────────────────────────────── */
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

/* ─── Global error handler ────────────────────────────────────────────── */
app.use(errorHandler);

module.exports = app;
