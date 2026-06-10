// controllers/cmsController.js — CMS content management (PostgreSQL)
// Admin CRUD for testimonials, FAQs, and site statistics.
// Public GET endpoints for frontend consumption.

const Cms = require('../models/Cms');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// ════════════════════════════════════════════════════════════
//  TESTIMONIALS
// ════════════════════════════════════════════════════════════

// ── @route   GET /api/cms/testimonials
// ── @access  Public
const getTestimonials = async (req, res, next) => {
  try {
    // Public consumers get active-only; admin query param ?all=true gets all
    const activeOnly = req.query.all !== 'true';
    const testimonials = await Cms.getTestimonials(activeOnly);
    return sendSuccess(res, 200, 'Testimonials fetched', testimonials);
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/cms/testimonials
// ── @access  Private/Admin
const createTestimonial = async (req, res, next) => {
  try {
    const { authorName, authorTitle, company, country, quote, rating, avatarUrl, sortOrder, isActive } = req.body;

    if (!authorName || !quote) {
      return sendError(res, 400, 'Author name and quote are required');
    }

    const testimonial = await Cms.createTestimonial({
      authorName, authorTitle, company, country, quote,
      rating, avatarUrl, sortOrder, isActive,
    });

    return sendSuccess(res, 201, 'Testimonial created', testimonial);
  } catch (err) {
    next(err);
  }
};

// ── @route   PUT /api/cms/testimonials/:id
// ── @access  Private/Admin
const updateTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Cms.updateTestimonial(req.params.id, req.body);
    if (!testimonial) return sendError(res, 404, 'Testimonial not found');
    return sendSuccess(res, 200, 'Testimonial updated', testimonial);
  } catch (err) {
    next(err);
  }
};

// ── @route   DELETE /api/cms/testimonials/:id
// ── @access  Private/Admin
const deleteTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Cms.deleteTestimonial(req.params.id);
    if (!testimonial) return sendError(res, 404, 'Testimonial not found');
    return sendSuccess(res, 200, 'Testimonial deleted');
  } catch (err) {
    next(err);
  }
};

// ── @route   PUT /api/cms/testimonials/reorder
// ── @desc    Accepts { orderedIds: [id1, id2, ...] } and sets sort_order
// ── @access  Private/Admin
const reorderTestimonials = async (req, res, next) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return sendError(res, 400, 'orderedIds array is required');
    }
    const testimonials = await Cms.reorderTestimonials(orderedIds);
    return sendSuccess(res, 200, 'Testimonials reordered', testimonials);
  } catch (err) {
    next(err);
  }
};

// ════════════════════════════════════════════════════════════
//  FAQs
// ════════════════════════════════════════════════════════════

// ── @route   GET /api/cms/faqs
// ── @access  Public
const getFaqs = async (req, res, next) => {
  try {
    const activeOnly = req.query.all !== 'true';
    const faqs = await Cms.getFaqs(activeOnly);
    return sendSuccess(res, 200, 'FAQs fetched', faqs);
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/cms/faqs
// ── @access  Private/Admin
const createFaq = async (req, res, next) => {
  try {
    const { question, answer, category, sortOrder, isActive } = req.body;

    if (!question || !answer) {
      return sendError(res, 400, 'Question and answer are required');
    }

    const faq = await Cms.createFaq({ question, answer, category, sortOrder, isActive });
    return sendSuccess(res, 201, 'FAQ created', faq);
  } catch (err) {
    next(err);
  }
};

// ── @route   PUT /api/cms/faqs/:id
// ── @access  Private/Admin
const updateFaq = async (req, res, next) => {
  try {
    const faq = await Cms.updateFaq(req.params.id, req.body);
    if (!faq) return sendError(res, 404, 'FAQ not found');
    return sendSuccess(res, 200, 'FAQ updated', faq);
  } catch (err) {
    next(err);
  }
};

// ── @route   DELETE /api/cms/faqs/:id
// ── @access  Private/Admin
const deleteFaq = async (req, res, next) => {
  try {
    const faq = await Cms.deleteFaq(req.params.id);
    if (!faq) return sendError(res, 404, 'FAQ not found');
    return sendSuccess(res, 200, 'FAQ deleted');
  } catch (err) {
    next(err);
  }
};

// ════════════════════════════════════════════════════════════
//  STATS
// ════════════════════════════════════════════════════════════

// ── @route   GET /api/cms/stats
// ── @access  Public
const getStats = async (req, res, next) => {
  try {
    const stats = await Cms.getStats();
    // Also reshape into a key-value map for convenience
    const map = {};
    for (const row of stats) {
      map[row.key] = { label: row.label, value: row.value };
    }
    return sendSuccess(res, 200, 'Stats fetched', { rows: stats, map });
  } catch (err) {
    next(err);
  }
};

// ── @route   PUT /api/cms/stats
// ── @desc    Batch update: { updates: [{key, value}] }
// ── @access  Private/Admin
const updateStats = async (req, res, next) => {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
      return sendError(res, 400, 'updates array of { key, value } is required');
    }

    const results = [];
    for (const { key, value } of updates) {
      if (!key) continue;
      const updated = await Cms.updateStat(key, value);
      results.push(updated);
    }

    return sendSuccess(res, 200, 'Stats updated', results);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  reorderTestimonials,
  getFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  getStats,
  updateStats,
};
