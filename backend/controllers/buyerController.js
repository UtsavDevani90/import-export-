// controllers/buyerController.js — Buyer management (PostgreSQL)
// Admin-only CRUD for buyer records with inquiry and quotation history.

const Buyer       = require('../models/Buyer');
const ActivityLog = require('../models/ActivityLog');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// ── @route   GET /api/buyers
// ── @desc    List buyers with search, country filter, pagination
// ── @access  Private/Admin
const getBuyers = async (req, res, next) => {
  try {
    const { search, country, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (search)  filter.search  = search;
    if (country) filter.country = country;

    const total = await Buyer.countDocuments(filter);
    const buyers = await Buyer.findAll({
      search,
      country,
      page:  parseInt(page),
      limit: parseInt(limit),
    });

    return sendSuccess(res, 200, 'Buyers fetched', {
      buyers,
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

// ── @route   GET /api/buyers/:id
// ── @desc    Get single buyer with inquiry & quotation history
// ── @access  Private/Admin
const getBuyer = async (req, res, next) => {
  try {
    const buyer = await Buyer.findById(req.params.id);
    if (!buyer) return sendError(res, 404, 'Buyer not found');

    // Attach related history in parallel
    const [inquiries, quotations] = await Promise.all([
      Buyer.findInquiries(buyer.email),
      Buyer.findQuotations(buyer.id),
    ]);

    return sendSuccess(res, 200, 'Buyer fetched', {
      ...buyer,
      inquiries,
      quotations,
    });
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/buyers
// ── @desc    Create a new buyer
// ── @access  Private/Admin
const createBuyer = async (req, res, next) => {
  try {
    const { name, company, email, phone, country, notes } = req.body;

    if (!name || !email) {
      return sendError(res, 400, 'Name and email are required');
    }

    const buyer = await Buyer.create({ name, company, email, phone, country, notes });

    await ActivityLog.insert({
      adminId:     req.admin.id,
      adminName:   req.admin.name,
      action:      'buyer.created',
      entityType:  'buyer',
      entityId:    buyer.id,
      entityLabel: buyer.name,
      details:     { email: buyer.email, company: buyer.company },
      ipAddress:   req.ip,
    }).catch(() => {});

    return sendSuccess(res, 201, 'Buyer created successfully', buyer);
  } catch (err) {
    next(err);
  }
};

// ── @route   PUT /api/buyers/:id
// ── @desc    Update buyer details
// ── @access  Private/Admin
const updateBuyer = async (req, res, next) => {
  try {
    const existing = await Buyer.findById(req.params.id);
    if (!existing) return sendError(res, 404, 'Buyer not found');

    const { name, company, email, phone, country, notes } = req.body;
    const buyer = await Buyer.update(req.params.id, {
      name, company, email, phone, country, notes,
    });

    await ActivityLog.insert({
      adminId:     req.admin.id,
      adminName:   req.admin.name,
      action:      'buyer.updated',
      entityType:  'buyer',
      entityId:    buyer.id,
      entityLabel: buyer.name,
      details:     { updated_fields: Object.keys(req.body) },
      ipAddress:   req.ip,
    }).catch(() => {});

    return sendSuccess(res, 200, 'Buyer updated successfully', buyer);
  } catch (err) {
    next(err);
  }
};

// ── @route   DELETE /api/buyers/:id
// ── @desc    Delete a buyer
// ── @access  Private/Admin
const deleteBuyer = async (req, res, next) => {
  try {
    const buyer = await Buyer.remove(req.params.id);
    if (!buyer) return sendError(res, 404, 'Buyer not found');

    await ActivityLog.insert({
      adminId:     req.admin.id,
      adminName:   req.admin.name,
      action:      'buyer.deleted',
      entityType:  'buyer',
      entityId:    req.params.id,
      entityLabel: buyer.name,
      details:     { email: buyer.email },
      ipAddress:   req.ip,
    }).catch(() => {});

    return sendSuccess(res, 200, 'Buyer deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { getBuyers, getBuyer, createBuyer, updateBuyer, deleteBuyer };
