// controllers/userController.js — Portal user self-service endpoints
// Profile, inquiries, quotations, favorites, notifications
// All routes protected by userProtect middleware.

const User         = require('../models/User');
const { pool }     = require('../config/db');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const logger        = require('../utils/logger');

// ══════════════════════════════════════════════════════════════
//  PROFILE
// ══════════════════════════════════════════════════════════════

// ── @route   GET /api/users/profile
const getProfile = async (req, res) => {
  return sendSuccess(res, 200, 'Profile fetched', req.user);
};

// ── @route   PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { full_name, phone, company_name, country } = req.body;

    if (full_name && full_name.trim().length < 2) {
      return sendError(res, 400, 'Full name must be at least 2 characters');
    }

    const updated = await User.updateProfile(req.user.id, {
      full_name: full_name?.trim(),
      phone,
      company_name,
      country,
    });

    if (!updated) return sendError(res, 404, 'User not found');

    logger.info(`[USER] Profile updated: ${req.user.email}`);
    return sendSuccess(res, 200, 'Profile updated successfully', updated);
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════════════════════
//  INQUIRIES
// ══════════════════════════════════════════════════════════════

// ── @route   GET /api/users/inquiries
const getMyInquiries = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions = ['(user_id = $1 OR email = $2)'];
    const params     = [req.user.id, req.user.email];
    let idx = 3;

    if (status) {
      conditions.push(`status = $${idx}`);
      params.push(status);
      idx++;
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*) AS total FROM inquiries ${where}`,
      params
    );
    const total = parseInt(countRows[0].total, 10);

    const { rows } = await pool.query(
      `SELECT id, name, email, company, country, product, quantity, subject,
              message, status, admin_notes, created_at, updated_at
       FROM inquiries ${where}
       ORDER BY created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, parseInt(limit), offset]
    );

    return sendSuccess(res, 200, 'Inquiries fetched', {
      inquiries: rows,
      total,
      page:  parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/users/inquiries
const submitInquiry = async (req, res, next) => {
  try {
    const { product, quantity, subject, message, company, country, phone } = req.body;

    if (!message) {
      return sendError(res, 400, 'Message is required');
    }

    const { rows } = await pool.query(
      `INSERT INTO inquiries
         (name, email, company, phone, country, product, quantity, subject, message, user_id, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id, name, email, company, country, product, quantity, subject, message, status, created_at`,
      [
        req.user.full_name,
        req.user.email,
        company  || req.user.company_name || null,
        phone    || req.user.phone        || null,
        country  || req.user.country      || null,
        product  || null,
        quantity || null,
        subject  || null,
        message,
        req.user.id,
        req.ip || null,
        req.headers['user-agent'] || null,
      ]
    );

    // Create a notification for the user
    await User.createNotification({
      user_id: req.user.id,
      title:   'Inquiry Submitted',
      message: `Your inquiry has been received. We'll respond within 24–48 hours.`,
      type:    'inquiry',
      link:    '/user/inquiries',
    });

    logger.info(`[USER] Inquiry submitted by: ${req.user.email}`);
    return sendSuccess(res, 201, 'Inquiry submitted successfully', rows[0]);
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════════════════════
//  QUOTATIONS
// ══════════════════════════════════════════════════════════════

// ── @route   GET /api/users/quotations
const getMyQuotations = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*) AS total FROM quotations WHERE user_id = $1 OR buyer_email = $2`,
      [req.user.id, req.user.email]
    );
    const total = parseInt(countRows[0].total, 10);

    const { rows } = await pool.query(
      `SELECT id, quotation_number, status, total_amount, currency,
              valid_until, notes, created_at, updated_at
       FROM quotations
       WHERE user_id = $1 OR buyer_email = $2
       ORDER BY created_at DESC
       LIMIT $3 OFFSET $4`,
      [req.user.id, req.user.email, parseInt(limit), offset]
    );

    return sendSuccess(res, 200, 'Quotations fetched', {
      quotations: rows,
      total,
      page:  parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    next(err);
  }
};

// ── @route   GET /api/users/quotations/:id
const getQuotationById = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM quotations WHERE id = $1 AND (user_id = $2 OR buyer_email = $3) LIMIT 1`,
      [req.params.id, req.user.id, req.user.email]
    );
    if (!rows[0]) return sendError(res, 404, 'Quotation not found');
    return sendSuccess(res, 200, 'Quotation fetched', rows[0]);
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════════════════════
//  FAVORITES
// ══════════════════════════════════════════════════════════════

// ── @route   GET /api/users/favorites
const getFavorites = async (req, res, next) => {
  try {
    const favorites = await User.getFavorites(req.user.id);
    return sendSuccess(res, 200, 'Favorites fetched', favorites);
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/users/favorites/:productId
const toggleFavorite = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Check if product exists
    const { rows: productRows } = await pool.query(
      `SELECT id FROM products WHERE id = $1 LIMIT 1`, [productId]
    );
    if (!productRows[0]) return sendError(res, 404, 'Product not found');

    const already = await User.isFavorite(req.user.id, productId);
    if (already) {
      await User.removeFavorite(req.user.id, productId);
      return sendSuccess(res, 200, 'Removed from favorites', { saved: false });
    } else {
      await User.addFavorite(req.user.id, productId);
      return sendSuccess(res, 200, 'Added to favorites', { saved: true });
    }
  } catch (err) {
    next(err);
  }
};

// ── @route   DELETE /api/users/favorites/:productId
const removeFavorite = async (req, res, next) => {
  try {
    const removed = await User.removeFavorite(req.user.id, req.params.productId);
    if (!removed) return sendError(res, 404, 'Favorite not found');
    return sendSuccess(res, 200, 'Removed from favorites');
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════════════════════
//  NOTIFICATIONS
// ══════════════════════════════════════════════════════════════

// ── @route   GET /api/users/notifications
const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unread } = req.query;
    const result = await User.getNotifications(req.user.id, {
      page:       parseInt(page),
      limit:      parseInt(limit),
      unreadOnly: unread === 'true',
    });
    return sendSuccess(res, 200, 'Notifications fetched', result);
  } catch (err) {
    next(err);
  }
};

// ── @route   PATCH /api/users/notifications/:id/read
const markNotificationRead = async (req, res, next) => {
  try {
    const result = await User.markNotificationRead(req.params.id, req.user.id);
    if (!result) return sendError(res, 404, 'Notification not found');
    return sendSuccess(res, 200, 'Marked as read');
  } catch (err) {
    next(err);
  }
};

// ── @route   PATCH /api/users/notifications/read-all
const markAllRead = async (req, res, next) => {
  try {
    await User.markAllNotificationsRead(req.user.id);
    return sendSuccess(res, 200, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getMyInquiries,
  submitInquiry,
  getMyQuotations,
  getQuotationById,
  getFavorites,
  toggleFavorite,
  removeFavorite,
  getNotifications,
  markNotificationRead,
  markAllRead,
};
