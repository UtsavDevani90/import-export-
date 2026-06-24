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
const { userProtect }       = require('../middleware/userMiddleware');
const { validate }          = require('../middleware/validate');
const { checkLockout }      = require('../middleware/loginLockout');
const {
  userRegisterSchema,
  userLoginSchema,
  changePasswordSchema,
} = require('../validators/authValidators');

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

module.exports = router;
