// utils/envValidator.js — Startup environment variable validation
// Called once at boot. Exits the process if critical vars are missing or insecure.
// Logs warnings for non-critical issues.

const logger = require('./logger');

// ── Known weak/default secrets that must be replaced ──────────
const WEAK_SECRETS = new Set([
  '8f7d9s8f7s9df87sdf98s7df98s7df',
  'secret',
  'changeme',
  'your_jwt_secret_here',
  'jwt_secret',
  'supersecret',
]);

// ── Validate a single env var ─────────────────────────────────
const requireEnv = (name) => {
  const val = process.env[name];
  if (!val || val.trim() === '') {
    logger.error(`[ENV] FATAL: Required environment variable "${name}" is not set.`);
    return false;
  }
  return true;
};

// ── Check secret strength ─────────────────────────────────────
const validateSecret = (name, minLength = 32) => {
  const val = process.env[name];
  if (!val) return false;

  if (WEAK_SECRETS.has(val.trim())) {
    logger.error(`[ENV] FATAL: "${name}" is set to a known weak/default value. Replace it immediately.`);
    return false;
  }
  if (val.length < minLength) {
    logger.error(`[ENV] FATAL: "${name}" is too short (${val.length} chars). Minimum is ${minLength} characters.`);
    return false;
  }
  return true;
};

// ── Main validator ────────────────────────────────────────────
const validateEnv = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  let fatal = false;

  logger.info('[ENV] Validating environment variables...');

  // ── Truly required — server cannot function without these ────
  const criticalVars = ['DATABASE_URL', 'JWT_SECRET'];
  for (const v of criticalVars) {
    if (!requireEnv(v)) fatal = true;
  }

  // ── Secret strength checks ───────────────────────────────────
  if (process.env.JWT_SECRET && !validateSecret('JWT_SECRET', 32)) fatal = true;

  // ── Optional but strongly recommended ───────────────────────
  // JWT_REFRESH_SECRET — enables refresh token rotation.
  // Missing = refresh tokens disabled, NOT a fatal error.
  if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.trim() === '') {
    logger.warn('[ENV] JWT_REFRESH_SECRET not set — refresh token rotation disabled.');
  } else if (!validateSecret('JWT_REFRESH_SECRET', 32)) {
    logger.warn('[ENV] JWT_REFRESH_SECRET is weak — please rotate it before production.');
  }

  // ── Production-specific warnings ────────────────────────────
  if (isProduction) {
    if (process.env.ALLOW_ADMIN_REGISTER === 'true') {
      logger.warn(
        '[ENV] WARNING: ALLOW_ADMIN_REGISTER=true in production. ' +
        'Admin registration endpoint is PUBLIC. Disable after setup.'
      );
    }

    if (process.env.LOG_LEVEL === 'debug') {
      logger.warn('[ENV] LOG_LEVEL=debug in production — this may expose sensitive data in logs.');
    }

    const clientUrl = process.env.CLIENT_URL || '';
    if (!clientUrl || clientUrl.includes('localhost')) {
      logger.warn('[ENV] CLIENT_URL is not set or points to localhost in production.');
    }

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      logger.warn('[ENV] Google OAuth credentials not set — Google login will be unavailable.');
    }
  }

  // ── Exit only if truly critical vars are missing in production ─
  if (fatal && isProduction) {
    logger.error('[ENV] ❌  Critical environment validation failed — DATABASE_URL or JWT_SECRET is missing.');
    logger.error('[ENV]     Set these in your Render environment variables and redeploy.');
    process.exit(1);
  } else if (fatal) {
    logger.warn('[ENV] Critical environment issues detected (dev mode — continuing anyway).');
  } else {
    logger.info('[ENV] ✅  Environment validation passed');
  }
};

module.exports = { validateEnv };
