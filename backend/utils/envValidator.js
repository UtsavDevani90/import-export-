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

  // Critical vars — must exist in all environments
  const criticalVars = ['DATABASE_URL', 'JWT_SECRET'];
  for (const v of criticalVars) {
    if (!requireEnv(v)) fatal = true;
  }

  // JWT_REFRESH_SECRET required when refresh tokens are in use
  if (!requireEnv('JWT_REFRESH_SECRET')) {
    logger.warn('[ENV] JWT_REFRESH_SECRET not set — refresh token rotation disabled.');
    // Non-fatal but strongly recommended
  }

  // Secret strength
  if (process.env.JWT_SECRET && !validateSecret('JWT_SECRET', 32)) fatal = true;
  if (process.env.JWT_REFRESH_SECRET && !validateSecret('JWT_REFRESH_SECRET', 32)) {
    logger.warn('[ENV] JWT_REFRESH_SECRET is weak — please rotate it before production.');
  }

  // Production-specific checks
  if (isProduction) {
    // Warn if register endpoint is left open
    if (process.env.ALLOW_ADMIN_REGISTER === 'true') {
      logger.warn(
        '[ENV] WARNING: ALLOW_ADMIN_REGISTER=true in production. ' +
        'Admin registration endpoint is PUBLIC. Disable after setup.'
      );
    }

    // Warn if debug-level logging is on
    if (process.env.LOG_LEVEL === 'debug') {
      logger.warn('[ENV] LOG_LEVEL=debug in production — this may expose sensitive data in logs.');
    }

    // Ensure CLIENT_URL is set (not localhost)
    const clientUrl = process.env.CLIENT_URL || '';
    if (!clientUrl || clientUrl.includes('localhost')) {
      logger.warn('[ENV] CLIENT_URL is not set or points to localhost in production.');
    }
  }

  if (fatal && isProduction) {
    logger.error('[ENV] Critical environment validation failed. Server will not start.');
    process.exit(1);
  } else if (fatal) {
    logger.warn('[ENV] Critical environment issues detected (dev mode — continuing anyway).');
  } else {
    logger.info('[ENV] Environment validation passed ✅');
  }
};

module.exports = { validateEnv };
