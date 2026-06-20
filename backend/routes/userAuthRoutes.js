// routes/userAuthRoutes.js — /api/users/auth/*
const express    = require('express');
const router     = express.Router();
const passport   = require('passport');
const {
  register, login, getMe, changePassword, logout,
} = require('../controllers/userAuthController');
const { googleCallback, googleAuthError } = require('../controllers/googleAuthController');
const { userProtect } = require('../middleware/userMiddleware');

// POST /api/users/auth/register
router.post('/register', register);

// POST /api/users/auth/login
router.post('/login', login);

// GET  /api/users/auth/me
router.get('/me', userProtect, getMe);

// PUT  /api/users/auth/change-password
router.put('/change-password', userProtect, changePassword);

// POST /api/users/auth/logout
router.post('/logout', userProtect, logout);

// ── Google OAuth ─────────────────────────────────────────────────────────
// GET /api/users/auth/google — Start OAuth flow (redirect to Google consent)
router.get(
  '/google',
  passport.authenticate('google', {
    scope:   ['profile', 'email'],
    session: false,
  })
);

// GET /api/users/auth/google/callback — Google redirects here after consent
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session:      false,
    failureRedirect: `${(process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '')}/login?error=google_failed`,
  }),
  googleCallback
);

module.exports = router;
