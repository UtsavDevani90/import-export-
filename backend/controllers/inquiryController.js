// controllers/inquiryController.js — Contact form inquiry management (PostgreSQL)
// Public: submit inquiry.  Admin: list, view, update status, delete.

const { pool }      = require('../config/db');
const Inquiry       = require('../models/Inquiry');
const emailService  = require('../services/emailService');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const logger        = require('../utils/logger');

// ── @route   POST /api/inquiries
// ── @desc    Submit contact/export inquiry form
// ── @access  Public
const submitInquiry = async (req, res, next) => {
  try {
    const {
      name, company, email, phone,
      country, product, quantity, subject, message,
    } = req.body;

    if (!name || !email || !country) {
      return sendError(res, 400, 'Name, email, and country are required');
    }

    // Sanitize IP: PostgreSQL INET type rejects IPv6-mapped IPv4 (::ffff:x.x.x.x)
    // Extract the plain IPv4 part when the address is IPv6-mapped
    let rawIp = req.ip || null;
    if (rawIp && rawIp.startsWith('::ffff:')) {
      rawIp = rawIp.substring(7); // '::ffff:127.0.0.1' → '127.0.0.1'
    }
    // If still an invalid-looking value, null it out rather than crash
    const ipAddress = (rawIp && rawIp.length <= 45) ? rawIp : null;

    const inquiry = await Inquiry.create({
      name, company, email, phone,
      country, product, quantity, subject, message,
      ipAddress,
      userAgent: req.get('user-agent'),
    });
    logger.info(`[Inquiry] Created: ${inquiry.id} from ${email}`);

    // Send notification email — non-blocking
    emailService.sendInquiryNotification(inquiry).catch((err) => {
      logger.warn(`Email notification failed for inquiry ${inquiry.id}: ${err.message}`);
    });

    logger.info(`New inquiry from ${email} (${country})`);

    return sendSuccess(res, 201, 'Your inquiry has been submitted. We will respond within 24 hours.', {
      id: inquiry.id,
    });
  } catch (err) {
    logger.error(`[Inquiry] Error submitting inquiry: ${err.message}`);
    next(err);
  }
};

// ── @route   GET /api/inquiries
// ── @access  Private/Admin
const getInquiries = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, search, country } = req.query;

    const filter = {};
    if (status)  filter.status  = status;
    if (country) filter.country = country;
    if (search)  filter.search  = search;

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Inquiry.countDocuments(filter);

    const inquiries = await Inquiry.find(filter, {
      sort:  'created_at DESC',
      skip,
      limit: parseInt(limit),
    });

    return sendSuccess(res, 200, 'Inquiries fetched', {
      inquiries,
      pagination: {
        total,
        page:  parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── @route   GET /api/inquiries/:id
// ── @access  Private/Admin
const getInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return sendError(res, 404, 'Inquiry not found');

    // Auto-mark as read when admin views it
    let result = inquiry;
    if (inquiry.status === 'new') {
      result = await Inquiry.markAsRead(inquiry.id);
    }

    return sendSuccess(res, 200, 'Inquiry fetched', result);
  } catch (err) {
    next(err);
  }
};

// ── @route   PUT /api/inquiries/:id/status
// ── @access  Private/Admin
const updateInquiryStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;

    const VALID_STATUSES = ['new', 'read', 'replied', 'closed', 'spam'];
    if (!VALID_STATUSES.includes(status)) {
      return sendError(res, 400, `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
    }

    const inquiry = await Inquiry.updateStatus(req.params.id, { status, adminNotes });
    if (!inquiry) return sendError(res, 404, 'Inquiry not found');

    return sendSuccess(res, 200, 'Inquiry status updated', inquiry);
  } catch (err) {
    next(err);
  }
};

// ── @route   DELETE /api/inquiries/:id
// ── @access  Private/Admin
const deleteInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) return sendError(res, 404, 'Inquiry not found');
    return sendSuccess(res, 200, 'Inquiry deleted successfully');
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/inquiries/:id/notes
// ── @access  Private/Admin
const addInquiryNote = async (req, res, next) => {
  try {
    const { note } = req.body;
    if (!note?.trim()) return sendError(res, 400, 'Note text is required');

    const { rows } = await pool.query(
      `INSERT INTO inquiry_notes (inquiry_id, admin_id, admin_name, note)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.params.id, req.admin.id, req.admin.name, note.trim()]
    );

    // Log to activity_logs — non-blocking
    const ActivityLog = require('../models/ActivityLog');
    await ActivityLog.insert({
      adminId:     req.admin.id,
      adminName:   req.admin.name,
      action:      'inquiry.note_added',
      entityType:  'inquiry',
      entityId:    req.params.id,
      details:     { note: note.trim().substring(0, 100) },
      ipAddress:   req.ip,
    }).catch(() => {});

    return sendSuccess(res, 201, 'Note added', rows[0]);
  } catch (err) { next(err); }
};

// ── @route   GET /api/inquiries/:id/notes
// ── @access  Private/Admin
const getInquiryNotes = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM inquiry_notes WHERE inquiry_id = $1 ORDER BY created_at DESC`,
      [req.params.id]
    );
    return sendSuccess(res, 200, 'Notes fetched', rows);
  } catch (err) { next(err); }
};

module.exports = {
  submitInquiry, getInquiries, getInquiry,
  updateInquiryStatus, deleteInquiry,
  addInquiryNote, getInquiryNotes,
};
