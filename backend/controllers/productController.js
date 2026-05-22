// controllers/productController.js — Product CRUD (PostgreSQL)
// Public: list, single, search.  Admin-protected: create, update, delete.

const Product = require('../models/Product');
const path    = require('path');
const fs      = require('fs');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// ─────────────────────────────────────────────────────────────
// PUBLIC ENDPOINTS
// ─────────────────────────────────────────────────────────────

// ── @route   GET /api/products
// ── @desc    List all active products with pagination, search & filter
// ── @access  Public
const getProducts = async (req, res, next) => {
  try {
    const {
      category, search,
      page  = 1, limit = 12,
      sort  = 'created_at DESC',
    } = req.query;

    const filter = { status: 'active' };
    if (category && category !== 'all') filter.category = category;
    if (search) filter.search = search;

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter, {
      sort,
      skip,
      limit: parseInt(limit),
    });

    return sendSuccess(res, 200, 'Products fetched', {
      products,
      pagination: {
        total,
        page:  parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── @route   GET /api/products/:id
// ── @desc    Get single product by UUID or slug
// ── @access  Public
const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // UUID regex check — otherwise treat as slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const filter = isUUID
      ? { id, status: 'active' }
      : { slug: id, status: 'active' };

    const product = await Product.findOne(filter);
    if (!product) return sendError(res, 404, 'Product not found');

    return sendSuccess(res, 200, 'Product fetched', product);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// ADMIN ENDPOINTS (require protect + adminOnly middleware)
// ─────────────────────────────────────────────────────────────

// ── @route   POST /api/products
// ── @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const images = req.files
      ? req.files.map((f) => `/uploads/images/${f.filename}`)
      : [];

    const product = await Product.create({
      ...req.body,
      images,
      featuredImage: images[0] || req.body.featuredImage || req.body.featured_image,
    });

    return sendSuccess(res, 201, 'Product created successfully', product);
  } catch (err) {
    next(err);
  }
};

// ── @route   PUT /api/products/:id
// ── @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const existing = await Product.findOne({ id: req.params.id });
    if (!existing) return sendError(res, 404, 'Product not found');

    // Append new uploaded images if provided
    const newData = { ...req.body };
    if (req.files && req.files.length > 0) {
      newData.images = req.files.map((f) => `/uploads/images/${f.filename}`);
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, newData);
    return sendSuccess(res, 200, 'Product updated successfully', updated);
  } catch (err) {
    next(err);
  }
};

// ── @route   DELETE /api/products/:id
// ── @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) return sendError(res, 404, 'Product not found');

    // Delete associated image files from disk
    for (const img of product.images || []) {
      const filePath = path.join(__dirname, '..', img);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await Product.findByIdAndDelete(req.params.id);
    return sendSuccess(res, 200, 'Product deleted successfully');
  } catch (err) {
    next(err);
  }
};

// ── @route   GET /api/products/admin/all
// ── @access  Private/Admin — returns ALL statuses
const getAllProductsAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, category, status } = req.query;
    const filter = {};
    if (status)   filter.status   = status;
    if (category) filter.category = category;
    if (search)   filter.search   = search;

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter, {
      sort:  'created_at DESC',
      skip,
      limit: parseInt(limit),
    });

    return sendSuccess(res, 200, 'Admin products fetched', {
      products,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getAllProductsAdmin };
