  // ════════════════════════════════════════════════════════════
//  server.js — Tanzora Export Backend Entry Point
//  Node.js / Express / PostgreSQL
//  Production-ready with full security middleware stack
// ════════════════════════════════════════════════════════════

// ── Load environment variables FIRST ─────────────────────────
require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');
const xss          = require('xss-clean');
const cookieParser = require('cookie-parser');
const path         = require('path');
const fs           = require('fs');

const { connectDB } = require('./config/db');
const logger        = require('./utils/logger');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

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

// ── Connect to PostgreSQL ─────────────────────────────────────
connectDB();

const app = express();

app.set('trust proxy', 1);
// ═══════════════════════════════════════════════════════════
//  PHASE 1 — SECURITY MIDDLEWARE
// ═══════════════════════════════════════════════════════════

// Helmet: sets secure HTTP response headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow frontend to load uploaded files
}));

// CORS: allow only the frontend origin
const corsOptions = {
  origin: function (origin, callback) {
    // Strip trailing slash from CLIENT_URL (browsers never include it in Origin headers)
    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
    const allowedOrigins = [
      clientUrl,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'https://import-export-ae4u.vercel.app',
    ];
    // Allow requests with no origin (Postman, curl, mobile)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} is not allowed`));
    }
  },
  credentials: true,  // Allow cookies to be sent
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle pre-flight for all routes

// Rate limiter: prevent brute force and DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      100,             // Max 100 requests per IP per window
  message: {
    success: false,
    message: 'Too many requests from this IP — please try again in 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders:   false,
});

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10, // Only 10 login attempts per 15 minutes
  message: { success: false, message: 'Too many login attempts — please try again later' },
  skipSuccessfulRequests: true,
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);

// ═══════════════════════════════════════════════════════════
//  PHASE 2 — PARSING & SANITIZATION MIDDLEWARE
// ═══════════════════════════════════════════════════════════

// Parse JSON bodies (limit 10kb to prevent large payload attacks)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Clean user input from XSS attacks
app.use(xss());

// ═══════════════════════════════════════════════════════════
//  PHASE 3 — LOGGING
// ═══════════════════════════════════════════════════════════

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Log to file in production
  const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'logs/access.log'),
    { flags: 'a' }
  );
  app.use(morgan('combined', { stream: accessLogStream }));
}

// ═══════════════════════════════════════════════════════════
//  PHASE 4 — STATIC FILES
// ═══════════════════════════════════════════════════════════

// Serve uploaded files: product images, certificate PDFs
// URL: http://localhost:5000/uploads/images/filename.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ═══════════════════════════════════════════════════════════
//  PHASE 5 — API ROUTES
// ═══════════════════════════════════════════════════════════

app.use('/api/auth',         authRoutes);
app.use('/api/products',     productRoutes);
app.use('/api/inquiries',    inquiryRoutes);
app.use('/api/blogs',        blogRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/dashboard',    dashboardRoutes);
app.use('/api/buyers',       buyerRoutes);
app.use('/api/quotations',   quotationRoutes);
app.use('/api/cms',          cmsRoutes);
app.use('/api/settings',     settingsRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/admins',        adminRoutes);

// ── Health check endpoint ─────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Tanzora Export API is running',
    env:     process.env.NODE_ENV,
    time:    new Date().toISOString(),
  });
});

// ═══════════════════════════════════════════════════════════
//  PHASE 6 — ERROR HANDLING
// ═══════════════════════════════════════════════════════════

app.use(notFound);       // 404 for unmatched routes
app.use(errorHandler);   // Central error handler

// ═══════════════════════════════════════════════════════════
//  START SERVER
// ═══════════════════════════════════════════════════════════

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`🚀  Tanzora Export API running on port ${PORT} [${process.env.NODE_ENV}]`);
  logger.info(`📡  Health: http://localhost:${PORT}/api/health`);
});

// ── Graceful shutdown ─────────────────────────────────────────
process.on('unhandledRejection', (err) => {
  logger.error(`💀  Unhandled Promise Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received — shutting down gracefully');
  server.close(() => process.exit(0));
});

module.exports = app;
