// routes/googleAuthRoutes.js — Public Google OAuth routes
// ─────────────────────────────────────────────────────────────────────────
// These routes MUST remain public (no auth middleware).
// They are mounted at /api/users/auth in server.js BEFORE the generic
// /api/users route so that userProtect never intercepts them.
// ─────────────────────────────────────────────────────────────────────────

const express  = require('express');
const router   = express.Router();
const passport = require('passport');
const { googleCallback, googleAuthError } = require('../controllers/googleAuthController');

// ── GET /api/users/auth/google
// ── Initiates the OAuth2 flow — redirects browser to Google consent screen.
// ── No authentication required; user is not yet logged in.
router.get(
  '/google',
  passport.authenticate('google', {
    scope:   ['profile', 'email'],
    session: false,
  })
);

// ── GET /api/users/auth/google/callback
// ── Google redirects the browser here after the user grants consent.
// ── Passport verifies the token, calls the GoogleStrategy verify callback,
// ── then hands off to googleCallback which sets the JWT cookie and
// ── redirects to the frontend.
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session:         false,
    failureRedirect: `${(process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '')}/login?error=google_failed`,
  }),
  googleCallback
);

// ── GET /api/users/auth/google/error
// ── Explicit error landing page (used by googleAuthController on failure).
router.get('/google/error', googleAuthError);

module.exports = router;
