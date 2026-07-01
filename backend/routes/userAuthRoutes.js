// routes/userAuthRoutes.js — /api/users/auth/*
// Security hardened:
//   • Joi validation on register/login/change-password
//   • Lockout middleware on login
//   • Refresh token endpoint added

const express = require('express');
const router  = express.Router();
const {
  register, login, refresh, getMe, changePassword, logout,
} = require('../controllers/userAuthController');
const { forgotPassword, resetPassword } = require('../controllers/passwordResetController');
const { userProtect }       = require('../middleware/userMiddleware');
const { validate }          = require('../middleware/validate');
const { checkLockout }      = require('../middleware/loginLockout');
const rateLimit             = require('express-rate-limit');
const {
  userRegisterSchema,
  userLoginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validators/authValidators');

// Rate limiting for forgot password to prevent spam
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { success: false, message: 'Too many password reset requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/users/auth/register  — public, validated
router.post('/register',
  validate(userRegisterSchema),
  register
);

// POST /api/users/auth/login     — validated, lockout protected
router.post('/login',
  validate(userLoginSchema),
  checkLockout('users'),
  login
);

// POST /api/users/auth/refresh   — rotate refresh token
router.post('/refresh', refresh);

// GET  /api/users/auth/me        — protected
router.get('/me', userProtect, getMe);

// PUT  /api/users/auth/change-password — protected + validated
router.put('/change-password',
  userProtect,
  validate(changePasswordSchema),
  changePassword
);

// POST /api/users/auth/logout    — protected
router.post('/logout', userProtect, logout);

// POST /api/users/auth/forgot-password — public, rate-limited, validated
router.post('/forgot-password',
  forgotPasswordLimiter,
  validate(forgotPasswordSchema),
  forgotPassword
);

// POST /api/users/auth/reset-password — public, validated
router.post('/reset-password',
  validate(resetPasswordSchema),
  resetPassword
);

module.exports = router;
