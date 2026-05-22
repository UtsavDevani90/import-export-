// controllers/blogController.js — Blog post CRUD (PostgreSQL)
// Public: list published posts, get single post.
// Admin: create, update, delete, manage draft/published status.

const Blog  = require('../models/Blog');
const path  = require('path');
const fs    = require('fs');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// ── @route   GET /api/blogs
// ── @access  Public
const getBlogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 9, tag, search } = req.query;

    const filter = { status: 'published' };
    if (tag)    filter.tag    = tag;
    if (search) filter.search = search;

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Blog.countDocuments(filter);

    const blogs = await Blog.find(filter, {
      sort:   'published_at DESC',
      skip,
      limit:  parseInt(limit),
      select: 'b.id, b.title, b.slug, b.excerpt, b.featured_image, b.author_name, b.category, b.views, b.published_at',
    });

    return sendSuccess(res, 200, 'Blogs fetched', {
      blogs,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

// ── @route   GET /api/blogs/:slug
// ── @access  Public
const getBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findOneAndIncrementViews({
      slug:   req.params.slug,
      status: 'published',
    });

    if (!blog) return sendError(res, 404, 'Blog post not found');

    return sendSuccess(res, 200, 'Blog fetched', blog);
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/blogs
// ── @access  Private/Admin
const createBlog = async (req, res, next) => {
  try {
    const featuredImage = req.file
      ? `/uploads/images/${req.file.filename}`
      : req.body.featuredImage || req.body.featured_image;

    const blog = await Blog.create({
      ...req.body,
      featuredImage,
      author:     req.admin.id,
      authorName: req.admin.name,
    });

    return sendSuccess(res, 201, 'Blog created successfully', blog);
  } catch (err) {
    next(err);
  }
};

// ── @route   PUT /api/blogs/:id
// ── @access  Private/Admin
const updateBlog = async (req, res, next) => {
  try {
    const existing = await Blog.findOne({ id: req.params.id });
    if (!existing) return sendError(res, 404, 'Blog not found');

    if (req.file) {
      req.body.featuredImage = `/uploads/images/${req.file.filename}`;
      // Remove old image if it was a local upload
      if (existing.featured_image?.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', existing.featured_image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body);
    return sendSuccess(res, 200, 'Blog updated successfully', blog);
  } catch (err) {
    next(err);
  }
};

// ── @route   DELETE /api/blogs/:id
// ── @access  Private/Admin
const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ id: req.params.id });
    if (!blog) return sendError(res, 404, 'Blog not found');

    if (blog.featured_image?.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', blog.featured_image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await Blog.findByIdAndDelete(req.params.id);
    return sendSuccess(res, 200, 'Blog deleted successfully');
  } catch (err) {
    next(err);
  }
};

// ── @route   GET /api/blogs/admin/all
// ── @access  Private/Admin
const getAllBlogsAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = status ? { status } : {};
    const skip   = (parseInt(page) - 1) * parseInt(limit);
    const total  = await Blog.countDocuments(filter);
    const blogs  = await Blog.find(filter, {
      sort:   'created_at DESC',
      skip,
      limit:  parseInt(limit),
      select: 'b.id, b.title, b.slug, b.status, b.published_at, b.views, b.created_at',
    });

    return sendSuccess(res, 200, 'Admin blogs fetched', {
      blogs,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getBlogs, getBlog, createBlog, updateBlog, deleteBlog, getAllBlogsAdmin };
