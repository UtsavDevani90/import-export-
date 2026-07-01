// controllers/passwordResetController.js — Handles forgot & reset password flows
// Security:
//  • Raw tokens are never stored, only SHA-256 hashes
//  • "Forgot Password" endpoint always returns the same generic message to prevent email enumeration
//  • Tokens expire after 1 hour (enforced in DB query)

const crypto = require('crypto');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { sendPasswordResetEmail } = require('../services/emailService');
const { logSecurityEvent } = require('../middleware/auditLog');
const logger = require('../utils/logger');

const logTag = '[PASSWORD RESET]';

// ── @route   POST /api/users/auth/forgot-password
// ── @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // 1. Check if user exists
    const user = await User.findByEmail(email);
    
    // To prevent email enumeration, we always return success
    if (!user || !user.is_active) {
      logSecurityEvent({ action: 'user.password_reset_requested_invalid_user', email, ip: req.ip });
      return sendSuccess(res, 200, 'If an account with that email exists, a password reset link has been sent.');
    }

    // 2. Generate secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    
    // 3. Set expiry (1 hour)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    
    // 4. Save hash to DB
    await User.setResetToken(email, tokenHash, expiresAt);
    
    // 5. Send email
    // Get frontend URL from env
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;
    
    await sendPasswordResetEmail(user.email, resetUrl, user.full_name);
    
    logSecurityEvent({ action: 'user.password_reset_requested', userId: user.id, email, ip: req.ip });
    logger.info(`${logTag} Password reset link sent to ${email}`);
    
    return sendSuccess(res, 200, 'If an account with that email exists, a password reset link has been sent.');
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/users/auth/reset-password
// ── @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    
    // 1. Hash the incoming raw token to compare with DB
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // 2. Find user by unexpired token hash
    const user = await User.findByResetToken(tokenHash);
    
    if (!user) {
      logSecurityEvent({ action: 'user.password_reset_failed_invalid_token', ip: req.ip });
      return sendError(res, 400, 'Invalid or expired password reset token. Please request a new one.');
    }

    if (!user.is_active) {
      logSecurityEvent({ action: 'user.password_reset_blocked_inactive', userId: user.id, ip: req.ip });
      return sendError(res, 403, 'Your account has been deactivated. Please contact support.');
    }

    // 3. Update password (the model method hashes it)
    await User.updatePassword(user.id, newPassword);
    
    // 4. Clear reset token
    await User.clearResetToken(user.id);
    
    logSecurityEvent({ action: 'user.password_reset_success', userId: user.id, email: user.email, ip: req.ip });
    logger.info(`${logTag} Password successfully reset for ${user.email}`);
    
    return sendSuccess(res, 200, 'Password has been reset successfully. You can now log in.');
  } catch (err) {
    next(err);
  }
};

module.exports = { forgotPassword, resetPassword };
