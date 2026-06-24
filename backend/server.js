// ════════════════════════════════════════════════════════════
//  server.js — Tanzora Export Backend Entry Point
//  Node.js / Express / PostgreSQL
//  Production-grade security hardening — 2026
// ════════════════════════════════════════════════════════════

// ── Load environment variables FIRST ─────────────────────────
require('dotenv').config();

// ── Validate environment before anything else ─────────────────
const { validateEnv } = require('./utils/envValidator');
validateEnv();

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path         = require('path');
const fs           = require('fs');

const { connectDB }  = require('./config/db');
const logger         = require('./utils/logger');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { initializeDatabase }     = require('./utils/initializeDB');
const passport       = require('./config/passport');

// ── Route imports ─────────────────────────────────────────────
const authRoutes        = require('./routes/authRoutes');
const productRoutes     = require('./routes/productRoutes');
const inquiryRoutes     = require('./routes/inquiryRoutes');
const blogRoutes        = require('./routes/blogRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const dashboardRoutes   = require('./routes/dashboardRoutes');
const buyerRoutes       = require('./routes/buyerRoutes');
const quotationRoutes   = require('./routes/quotationRoutes');
const cmsRoutes         = require('./routes/cmsRoutes');
const settingsRoutes    = require('./routes/settingsRoutes');
const activityLogRoutes = require('./routes/activityLogRoutes');
const adminRoutes       = require('./routes/adminRoutes');
const userAuthRoutes    = require('./routes/userAuthRoutes');
const userRoutes        = require('./routes/userRoutes');
const adminUserRoutes   = require('./routes/adminUserRoutes');
const googleAuthRoutes  = require('./routes/googleAuthRoutes');

// ── Connect to PostgreSQL ─────────────────────────────────────
connectDB();

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Trust Render's proxy (needed for correct req.ip behind load balancer)
app.set('trust proxy', 1);

// ═══════════════════════════════════════════════════════════
//  PHASE 1 — SECURITY HEADERS (Helmet)
// ═══════════════════════════════════════════════════════════

app.use(helmet({
  // Content Security Policy — restricts where resources can be loaded from
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc:      ["'self'"],
      scriptSrc:       ["'self'"],
      styleSrc:        ["'self'", "'unsafe-inline'"],            // Required for some CSS-in-JS
      imgSrc:          ["'self'", 'data:', 'https:'],            // Allow HTTPS images
      connectSrc:      ["'self'"],
      fontSrc:         ["'self'", 'https://fonts.gstatic.com'],
      objectSrc:       ["'none'"],
      mediaSrc:        ["'none'"],
      frameSrc:        ["'none'"],
      frameAncestors:  ["'none'"],                              // X-Frame-Options equivalent
      formAction:      ["'self'"],
      baseUri:         ["'self'"],
      upgradeInsecureRequests: isProduction ? [] : undefined,
    },
  },

  // HTTP Strict Transport Security — forces HTTPS for 1 year
  hsts: isProduction
    ? { maxAge: 31536000, includeSubDomains: true, preload: true }
    : false,

  // Prevent MIME type sniffing
  noSniff: true,

  // X-Frame-Options: DENY
  frameguard: { action: 'deny' },

  // X-XSS-Protection header (legacy browsers)
  xssFilter: true,

  // Hide "X-Powered-By: Express"
  hidePoweredBy: true,

  // Referrer-Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

  // Cross-origin policies
  crossOriginEmbedderPolicy: false,               // Keep false — breaks uploaded file serving
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow frontend to load uploads
  crossOriginOpenerPolicy:   { policy: 'same-origin-allow-popups' }, // Required for Google OAuth
}));

// ── Permissions-Policy (Helmet 8 doesn't include it) ─────────
app.use((req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  next();
});

// ═══════════════════════════════════════════════════════════
//  PHASE 2 — CORS
// ═══════════════════════════════════════════════════════════

const corsOptions = {
  origin: function (origin, callback) {
    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
    const allowedOrigins = [
      clientUrl,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'https://import-export-ae4u.vercel.app',
      'https://import-export-pink.vercel.app',
      'https://import-export-ae4u-lnckgcyey-utsavdevani90-2605s-projects.vercel.app',
    ];

    // Allow server-to-server requests (no Origin header) — e.g. Postman, cURL in dev only
    if (!origin) {
      if (!isProduction) return callback(null, true);
      // In production: block no-origin requests (may want to allow for health checks)
      return callback(null, false);
    }

    // Allow any Vercel preview deployment for this project
    const isVercelPreview = /^https:\/\/import-export-[a-z0-9-]+-utsavdevani90-2605s-projects\.vercel\.app$/.test(origin);

    if (allowedOrigins.includes(origin) || isVercelPreview) {
      callback(null, true);
    } else {
      logger.warn(`[CORS] Blocked origin: ${origin}`);
      callback(new Error(`CORS: Origin ${origin} is not allowed`));
    }
  },
  credentials:          true,
  methods:              ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders:       ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders:       ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  optionsSuccessStatus: 200,
  maxAge:               86400, // Cache preflight for 24 hours
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle pre-flight for all routes

// ═══════════════════════════════════════════════════════════
//  PHASE 3 — RATE LIMITING
// ═══════════════════════════════════════════════════════════

// ── Global API limiter: 100 req/15min per IP ──────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      100,
  message:  { success: false, message: 'Too many requests — please try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders:   false,
  skip: (req) => req.method === 'OPTIONS', // Skip CORS preflight
});

// ── Auth limiter: 10 attempts/15min (admin + user login) ──────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message:  { success: false, message: 'Too many login attempts — please try again later' },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders:   false,
});

// ── Inquiry/contact form limiter: 5/15min per IP ─────────────
const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      5,
  message:  { success: false, message: 'Too many form submissions — please wait 15 minutes before trying again' },
  standardHeaders: true,
  legacyHeaders:   false,
});

// ── User registration limiter: 10/hour per IP ─────────────────
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max:      10,
  message:  { success: false, message: 'Too many accounts created from this IP — please try again later' },
  standardHeaders: true,
  legacyHeaders:   false,
});

// Apply limiters
app.use('/api/', globalLimiter);
app.use('/api/auth/login',           authLimiter);      // Admin login
app.use('/api/users/auth/login',     authLimiter);      // User login
app.use('/api/inquiries',            inquiryLimiter);   // Contact form (POST only via method check in route)
app.use('/api/users/auth/register',  registerLimiter);  // User registration

// ═══════════════════════════════════════════════════════════
//  PHASE 4 — PARSING MIDDLEWARE
// ═══════════════════════════════════════════════════════════

// Parse JSON bodies — 10kb limit prevents large payload attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Initialize Passport (no session — we use JWT cookies)
app.use(passport.initialize());

// ═══════════════════════════════════════════════════════════
//  PHASE 5 — REQUEST LOGGING
// ═══════════════════════════════════════════════════════════

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

if (!isProduction) {
  app.use(morgan('dev'));
} else {
  // Production: log to file, skip sensitive routes
  const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'logs/access.log'),
    { flags: 'a' }
  );
  app.use(morgan('combined', {
    stream: accessLogStream,
    skip: (req) => {
      // Don't log health checks to keep access logs clean
      return req.originalUrl === '/api/health';
    },
  }));
}

// ═══════════════════════════════════════════════════════════
//  PHASE 6 — STATIC FILES
// ═══════════════════════════════════════════════════════════

// Serve uploaded files (images, PDFs)
// URL: https://backend.render.com/uploads/images/filename.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  // Prevent directory listing
  index: false,
  // Set cache control for uploaded assets
  maxAge: '1d',
}));

// ═══════════════════════════════════════════════════════════
//  PHASE 7 — API ROUTES
// ═══════════════════════════════════════════════════════════

app.use('/api/auth',          authRoutes);
app.use('/api/products',      productRoutes);
app.use('/api/inquiries',     inquiryRoutes);
app.use('/api/blogs',         blogRoutes);
app.use('/api/certificates',  certificateRoutes);
app.use('/api/dashboard',     dashboardRoutes);
app.use('/api/buyers',        buyerRoutes);
app.use('/api/quotations',    quotationRoutes);
app.use('/api/cms',           cmsRoutes);
app.use('/api/settings',      settingsRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/admins',        adminRoutes);

// Google OAuth — MUST come before /api/users/auth (no auth middleware on this)
app.use('/api/users/auth',    googleAuthRoutes);
app.use('/api/users/auth',    userAuthRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/admin/users',   adminUserRoutes);

// ── Health check ──────────────────────────────────────────────
// Returns minimal info — no NODE_ENV exposed in production
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Tanzora Export API is operational',
    time:    new Date().toISOString(),
    // Only expose env in development
    ...(process.env.NODE_ENV !== 'production' && { env: process.env.NODE_ENV }),
  });
});

// ═══════════════════════════════════════════════════════════
//  PHASE 8 — ERROR HANDLING
// ═══════════════════════════════════════════════════════════

app.use(notFound);
app.use(errorHandler);

// ═══════════════════════════════════════════════════════════
//  START SERVER
// ═══════════════════════════════════════════════════════════

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`🚀  Tanzora Export API running on port ${PORT} [${process.env.NODE_ENV}]`);
  logger.info(`📡  Health: http://localhost:${PORT}/api/health`);

  // Auto-initialize database (runs migrations + seeds admins from env vars)
  initializeDatabase().catch((err) => {
    logger.error(`Database initialization error: ${err.message}`);
  });
});

// ── Graceful shutdown ─────────────────────────────────────────
process.on('unhandledRejection', (err) => {
  logger.error(`💀  Unhandled Promise Rejection: ${err.message}`);
  logger.error(err.stack);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error(`💀  Uncaught Exception: ${err.message}`);
  logger.error(err.stack);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received — shutting down gracefully');
  server.close(() => process.exit(0));
});

module.exports = app;
