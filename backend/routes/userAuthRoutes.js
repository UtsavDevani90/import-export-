// routes/userAuthRoutes.js — /api/users/auth/*
const express = require('express');
const router  = express.Router();
const {
  register, login, getMe, changePassword, logout,
} = require('../controllers/userAuthController');
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

module.exports = router;
