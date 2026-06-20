// routes/userAuthRoutes.js — /api/users/auth/*
// ─────────────────────────────────────────────────────────────────────────
// NOTE: Google OAuth routes (/google and /google/callback) are intentionally
// NOT here. They live in googleAuthRoutes.js which is mounted separately in
// server.js to guarantee they are never touched by auth middleware.
// ─────────────────────────────────────────────────────────────────────────
const express = require('express');
const router  = express.Router();
const {
  register, login, getMe, changePassword, logout,
} = require('../controllers/userAuthController');
const { userProtect } = require('../middleware/userMiddleware');

// POST /api/users/auth/register  — public
router.post('/register', register);

// POST /api/users/auth/login     — public
router.post('/login', login);

// GET  /api/users/auth/me        — protected
router.get('/me', userProtect, getMe);

// PUT  /api/users/auth/change-password — protected
router.put('/change-password', userProtect, changePassword);

// POST /api/users/auth/logout    — protected
router.post('/logout', userProtect, logout);

module.exports = router;
