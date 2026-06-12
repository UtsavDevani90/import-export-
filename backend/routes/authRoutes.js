// routes/authRoutes.js
const express = require('express');
const router  = express.Router();
const {
  register, login, getMe, changePassword, logout, debugConnection,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/register  — Create admin (restrict in production)
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET  /api/auth/me        — Get logged-in admin profile
router.get('/me', protect, getMe);

// PUT  /api/auth/change-password
router.put('/change-password', protect, changePassword);

// POST /api/auth/logout
router.post('/logout', protect, logout);

// GET  /api/auth/debug-connection  — Verify DB + env (safe to expose, no secrets returned)
// Usage: GET /api/auth/debug-connection?email=utsavdevani90@gmail.com
router.get('/debug-connection', debugConnection);

module.exports = router;
