// routes/authRoutes.js — Admin authentication routes
// Security hardened:
//   • Register gated by ALLOW_ADMIN_REGISTER env var
//   • Joi validation on login/register/change-password
//   • Lockout middleware on login
//   • Debug endpoint removed from production routing
//   • Refresh token endpoint added

const express = require('express');
const router  = express.Router();
const {
  register, login, refresh, getMe, changePassword, logout, debugConnection,
} = require('../controllers/authController');
const { protect }         = require('../middleware/authMiddleware');
const { validate }        = require('../middleware/validate');
const { checkLockout }    = require('../middleware/loginLockout');
const {
  loginSchema,
  registerSchema,
  changePasswordSchema,
} = require('../validators/authValidators');

// POST /api/auth/register  — Gated by ALLOW_ADMIN_REGISTER=true
router.post('/register',
  validate(registerSchema),
  register
);

// POST /api/auth/login     — Validate → lockout check → handler
router.post('/login',
  validate(loginSchema),
  checkLockout('admins'),
  login
);

// POST /api/auth/refresh   — Rotate refresh token
router.post('/refresh', refresh);

// GET  /api/auth/me        — Get logged-in admin profile
router.get('/me', protect, getMe);

// PUT  /api/auth/change-password
router.put('/change-password',
  protect,
  validate(changePasswordSchema),
  changePassword
);

// POST /api/auth/logout
router.post('/logout', protect, logout);

// GET  /api/auth/debug-connection  — Dev only (returns 404 in production)
router.get('/debug-connection', debugConnection);

module.exports = router;
