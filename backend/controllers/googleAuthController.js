// controllers/googleAuthController.js — Google OAuth callback handler
// ─────────────────────────────────────────────────────────────────────────
// Called by Passport after it verifies the Google token.
// Generates a JWT using the same mechanism as userAuthController.js and
// sets the same user_token cookie, then redirects the browser to the
// frontend callback page which finalises the session.
// ─────────────────────────────────────────────────────────────────────────

const generateToken = require('../utils/generateToken');
const User          = require('../models/User');
const logger        = require('../utils/logger');

const COOKIE_NAME = 'user_token';
const logTag      = '[GOOGLE AUTH]';

// ── Cookie options (mirrors userAuthController.js) ────────────────
const cookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure:   isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
  };
};

// ── @route   GET /api/users/auth/google/callback (after Passport verify)
// ── @access  Public (OAuth redirect)
const googleCallback = async (req, res) => {
  try {
    // req.user is set by Passport's verify callback in config/passport.js
    if (!req.user) {
      logger.warn(`${logTag} No user on req after Passport verify — redirecting to error`);
      return googleAuthError(req, res);
    }

    // Update last_login timestamp
    await User.updateLastLogin(req.user.id);

    // Generate JWT (same payload shape as userAuthController login)
    const token = generateToken({ id: req.user.id, role: req.user.role || 'user', type: 'user' });

    // Set httpOnly cookie (same as email/password login)
    res.cookie(COOKIE_NAME, token, cookieOptions());

    logger.info(`${logTag} Successful login: ${req.user.email}`);

    // Build a safe user object to pass to the frontend via URL params.
    // The frontend callback page reads these and stores them in localStorage.
    const userData = {
      id:      req.user.id,
      name:    req.user.full_name,
      email:   req.user.email,
      role:    req.user.role || 'user',
      avatar:  req.user.avatar || null,
      phone:   req.user.phone || null,
      company: req.user.company_name || null,
      country: req.user.country || null,
    };

    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
    const params    = new URLSearchParams({
      token,
      user: JSON.stringify(userData),
    });

    return res.redirect(`${clientUrl}/auth/google/callback?${params.toString()}`);

  } catch (err) {
    logger.error(`${logTag} Callback error: ${err.message}`);
    return googleAuthError(req, res);
  }
};

// ── @route   GET /api/users/auth/google/error
// ── Called when Passport authentication fails
const googleAuthError = (_req, res) => {
  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  return res.redirect(`${clientUrl}/login?error=google_failed`);
};

module.exports = { googleCallback, googleAuthError };
