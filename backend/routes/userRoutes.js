// routes/userRoutes.js — /api/users/*
// All routes require userProtect (valid user_token cookie or Bearer)
const express = require('express');
const router  = express.Router();
const {
  getProfile, updateProfile,
  getMyInquiries, submitInquiry,
  getMyQuotations, getQuotationById,
  getFavorites, toggleFavorite, removeFavorite,
  getNotifications, markNotificationRead, markAllRead,
} = require('../controllers/userController');
const { userProtect } = require('../middleware/userMiddleware');

// Apply userProtect to all routes below
router.use(userProtect);

// ── Profile ────────────────────────────────────────────────────
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// ── Inquiries ─────────────────────────────────────────────────
router.get('/inquiries',  getMyInquiries);
router.post('/inquiries', submitInquiry);

// ── Quotations ────────────────────────────────────────────────
router.get('/quotations',     getMyQuotations);
router.get('/quotations/:id', getQuotationById);

// ── Favorites ─────────────────────────────────────────────────
router.get('/favorites',                 getFavorites);
router.post('/favorites/:productId',     toggleFavorite);
router.delete('/favorites/:productId',   removeFavorite);

// ── Notifications ─────────────────────────────────────────────
router.get('/notifications',              getNotifications);
router.patch('/notifications/read-all',   markAllRead);
router.patch('/notifications/:id/read',   markNotificationRead);

module.exports = router;
