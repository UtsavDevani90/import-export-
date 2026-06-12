// routes/adminUserRoutes.js — /api/admin/users/*
// Admin management of portal user accounts
const express = require('express');
const router  = express.Router();
const {
  getAllUsers, getUserById, updateUserStatus, deleteUser, notifyUser,
} = require('../controllers/adminUserController');
const { protect, adminOnly, superAdminOnly } = require('../middleware/authMiddleware');

// Apply admin protection to all routes
router.use(protect, adminOnly);

// GET  /api/admin/users          — paginated list with search/filter
router.get('/', getAllUsers);

// GET  /api/admin/users/:id      — user detail
router.get('/:id', getUserById);

// PATCH /api/admin/users/:id/status — activate or deactivate
router.patch('/:id/status', updateUserStatus);

// POST /api/admin/users/:id/notify — send in-app notification
router.post('/:id/notify', notifyUser);

// DELETE /api/admin/users/:id    — superadmin only
router.delete('/:id', superAdminOnly, deleteUser);

module.exports = router;
