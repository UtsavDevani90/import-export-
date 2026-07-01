// ════════════════════════════════════════════════════════════
//  server.js — Tanzora Export Backend Entry Point
//  Node.js / Express / PostgreSQL
//  Production-grade security hardening — 2026
// ════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
//  DIAGNOSTIC STARTUP LOGGING
//  Every require() is wrapped in try/catch.
//  console.log is used deliberately (synchronous stdout,
//  works before Winston/logger loads).
//  Remove this block once the root cause is confirmed.
// ─────────────────────────────────────────────────────────────
console.log('[BOOT] ▶ Starting server.js');

// ── Load environment variables FIRST ─────────────────────────
console.log('[BOOT] Loading dotenv...');
try {
  require('dotenv').config();
  console.log('[BOOT] dotenv loaded. NODE_ENV=' + process.env.NODE_ENV);
  console.log('[BOOT] PORT=' + process.env.PORT);
  console.log('[BOOT] DATABASE_URL set=' + !!process.env.DATABASE_URL);
  console.log('[BOOT] JWT_SECRET set=' + !!process.env.JWT_SECRET);
  console.log('[BOOT] JWT_REFRESH_SECRET set=' + !!process.env.JWT_REFRESH_SECRET);
  console.log('[BOOT] GOOGLE_CLIENT_ID set=' + !!process.env.GOOGLE_CLIENT_ID);
  console.log('[BOOT] GOOGLE_CLIENT_SECRET set=' + !!process.env.GOOGLE_CLIENT_SECRET);
} catch (e) {
  console.error('[BOOT] FATAL: dotenv failed:', e.message);
  console.error(e.stack);
  process.exit(1);
}

// ── Validate environment before anything else ─────────────────
console.log('[BOOT] Loading envValidator...');
let validateEnv;
try {
  validateEnv = require('./utils/envValidator').validateEnv;
  console.log('[BOOT] envValidator loaded');
} catch (e) {
  console.error('[BOOT] FATAL: envValidator require failed:', e.message);
  console.error(e.stack);
  process.exit(1);
}

console.log("[1] Before validateEnv");

try {
    console.log("[2] Calling validateEnv()");
    validateEnv();
    console.log("[3] validateEnv returned");
} catch (err) {
    console.error("VALIDATE ERROR:", err);
}

console.log("[4] After validateEnv");

// ── Core npm modules ──────────────────────────────────────────
console.log('[BOOT] Loading express...');
let express, cors, helmet, morgan, rateLimit, cookieParser, path, fs;
try {
  express      = require('express');
  console.log('[BOOT] express loaded');
  cors         = require('cors');
  console.log('[BOOT] cors loaded');
  helmet       = require('helmet');
  console.log('[BOOT] helmet loaded');
  morgan       = require('morgan');
  console.log('[BOOT] morgan loaded');
  rateLimit    = require('express-rate-limit');
  console.log('[BOOT] express-rate-limit loaded');
  cookieParser = require('cookie-parser');
  console.log('[BOOT] cookie-parser loaded');
  path         = require('path');
  fs           = require('fs');
  console.log('[BOOT] path + fs loaded');
} catch (e) {
  console.error('[BOOT] FATAL: npm module require failed:', e.message);
  console.error(e.stack);
  process.exit(1);
}

// ── Internal modules ──────────────────────────────────────────
console.log('[BOOT] Loading config/db...');
let connectDB;
try {
  connectDB = require('./config/db').connectDB;
  console.log('[BOOT] config/db loaded');
} catch (e) {
  console.error('[BOOT] FATAL: config/db require failed:', e.message);
  console.error(e.stack);
  process.exit(1);
}

console.log('[BOOT] Loading utils/logger...');
let logger;
try {
  logger = require('./utils/logger');
  console.log('[BOOT] utils/logger loaded');
} catch (e) {
  console.error('[BOOT] FATAL: utils/logger require failed:', e.message);
  console.error(e.stack);
  process.exit(1);
}

console.log('[BOOT] Loading middleware/errorMiddleware...');
let notFound, errorHandler;
try {
  ({ notFound, errorHandler } = require('./middleware/errorMiddleware'));
  console.log('[BOOT] errorMiddleware loaded');
} catch (e) {
  console.error('[BOOT] FATAL: errorMiddleware require failed:', e.message);
  console.error(e.stack);
  process.exit(1);
}

console.log('[BOOT] Loading utils/initializeDB...');
let initializeDatabase;
try {
  initializeDatabase = require('./utils/initializeDB').initializeDatabase;
  console.log('[BOOT] initializeDB loaded');
} catch (e) {
  console.error('[BOOT] FATAL: initializeDB require failed:', e.message);
  console.error(e.stack);
  process.exit(1);
}

console.log('[BOOT] Loading config/passport...');
let passport;
try {
  passport = require('./config/passport');
  console.log('[BOOT] config/passport loaded');
} catch (e) {
  console.error('[BOOT] FATAL: config/passport require failed:', e.message);
  console.error(e.stack);
  process.exit(1);
}

// ── Route imports ─────────────────────────────────────────────
console.log('[BOOT] Loading routes...');
let authRoutes, productRoutes, inquiryRoutes, blogRoutes, certificateRoutes;
let dashboardRoutes, buyerRoutes, quotationRoutes, cmsRoutes, settingsRoutes;
let activityLogRoutes, adminRoutes, userAuthRoutes, userRoutes, adminUserRoutes, googleAuthRoutes;

try {
  console.log('[BOOT]   authRoutes...');
  authRoutes        = require('./routes/authRoutes');
  console.log('[BOOT]   productRoutes...');
  productRoutes     = require('./routes/productRoutes');
  console.log('[BOOT]   inquiryRoutes...');
  inquiryRoutes     = require('./routes/inquiryRoutes');
  console.log('[BOOT]   blogRoutes...');
  blogRoutes        = require('./routes/blogRoutes');
  console.log('[BOOT]   certificateRoutes...');
  certificateRoutes = require('./routes/certificateRoutes');
  console.log('[BOOT]   dashboardRoutes...');
  dashboardRoutes   = require('./routes/dashboardRoutes');
  console.log('[BOOT]   buyerRoutes...');
  buyerRoutes       = require('./routes/buyerRoutes');
  console.log('[BOOT]   quotationRoutes...');
  quotationRoutes   = require('./routes/quotationRoutes');
  console.log('[BOOT]   cmsRoutes...');
  cmsRoutes         = require('./routes/cmsRoutes');
  console.log('[BOOT]   settingsRoutes...');
  settingsRoutes    = require('./routes/settingsRoutes');
  console.log('[BOOT]   activityLogRoutes...');
  activityLogRoutes = require('./routes/activityLogRoutes');
  console.log('[BOOT]   adminRoutes...');
  adminRoutes       = require('./routes/adminRoutes');
  console.log('[BOOT]   userAuthRoutes...');
  userAuthRoutes    = require('./routes/userAuthRoutes');
  console.log('[BOOT]   userRoutes...');
  userRoutes        = require('./routes/userRoutes');
  console.log('[BOOT]   adminUserRoutes...');
  adminUserRoutes   = require('./routes/adminUserRoutes');
  console.log('[BOOT]   googleAuthRoutes...');
  googleAuthRoutes  = require('./routes/googleAuthRoutes');
  console.log('[BOOT] All routes loaded');
} catch (e) {
  console.error('[BOOT] FATAL: Route require failed:', e.message);
  console.error('[BOOT] File that caused failure:', e.requireStack ? e.requireStack.join(' -> ') : '(check stack below)');
  console.error(e.stack);
  process.exit(1);
}

console.log('[BOOT] Creating Express app...');
const app = express();
const isProduction = process.env.NODE_ENV === 'production';
console.log('[BOOT] Express app created. isProduction=' + isProduction);


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
//  Express MUST bind to a port first. All async init (DB
//  connection, migrations, admin seeding) runs AFTER listen()
//  so Render's port scanner always finds an open port.
// ═══════════════════════════════════════════════════════════

const PORT = process.env.PORT || 5000;
let server;

console.log('[BOOT] About to call app.listen() on port ' + PORT + '...');
try {
  server = app.listen(PORT, async () => {
    console.log('[BOOT] ✅ app.listen() callback fired — port is BOUND on ' + PORT);
    logger.info(`🚀  Tanzora Export API listening on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    logger.info(`📡  Health check: http://localhost:${PORT}/api/health`);

    // ── Phase A: Connect to the database ────────────────────
    // connectDB() is non-fatal — errors are logged and the server
    // continues serving requests (DB-dependent routes return 503).
    logger.info('[STARTUP] Connecting to PostgreSQL...');
    await connectDB();

    // ── Phase B: Run migrations + seed admin ─────────────────
    // initializeDatabase() is also fully wrapped in try/catch.
    logger.info('[STARTUP] Running database initialization...');
    try {
      await initializeDatabase();
      logger.info('[STARTUP] ✅  Database initialization complete');
    } catch (err) {
      logger.error(`[STARTUP] ❌  Database initialization error: ${err.message}`);
      logger.error(err.stack);
      // Non-fatal — server keeps running
    }

    logger.info('[STARTUP] ✅  Server fully ready');
  });
} catch (err) {
  // Synchronous listen() error (e.g., port already in use)
  console.error(`[STARTUP] FATAL: Failed to start Express server: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
}

// ── Graceful shutdown ─────────────────────────────────────────
// Helper: close server with a timeout fallback so a hung connection
// never blocks the process from exiting.
const gracefulShutdown = (exitCode) => {
  const timeout = setTimeout(() => {
    logger.warn('[SHUTDOWN] Server close timed out — forcing exit');
    process.exit(exitCode);
  }, 10000);
  timeout.unref(); // Don't prevent other cleanup from running

  if (server && server.listening) {
    server.close(() => {
      clearTimeout(timeout);
      process.exit(exitCode);
    });
  } else {
    clearTimeout(timeout);
    process.exit(exitCode);
  }
};

process.on('unhandledRejection', (reason, promise) => {
  const msg = reason instanceof Error ? reason.message : String(reason);
  const stack = reason instanceof Error ? reason.stack : '';
  logger.error(`💀  Unhandled Promise Rejection: ${msg}`);
  if (stack) logger.error(stack);
  // Log-only — do NOT exit. Render will restart if truly unrecoverable.
  // Exiting here on a transient rejection (e.g., a failed DB query) would
  // take down the entire server unnecessarily.
});

process.on('uncaughtException', (err) => {
  logger.error(`💀  Uncaught Exception: ${err.message}`);
  logger.error(err.stack);
  // Uncaught exceptions leave the process in an undefined state — must exit.
  gracefulShutdown(1);
});

process.on('SIGTERM', () => {
  logger.info('[SHUTDOWN] SIGTERM received — shutting down gracefully');
  gracefulShutdown(0);
});

module.exports = app;
