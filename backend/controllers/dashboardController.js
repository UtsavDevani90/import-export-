// controllers/dashboardController.js — Admin dashboard statistics (PostgreSQL)
// Returns aggregated counts and recent activity for the dashboard overview.

const Product     = require('../models/Product');
const Inquiry     = require('../models/Inquiry');
const Blog        = require('../models/Blog');
const Certificate = require('../models/Certificate');
const { sendSuccess } = require('../utils/apiResponse');

// ── @route   GET /api/dashboard/stats
// ── @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    // Run all counts in parallel for speed
    const [
      totalProducts,
      activeProducts,
      totalInquiries,
      newInquiries,
      totalBlogs,
      publishedBlogs,
      totalCertificates,
      recentInquiries,
      inquiryStatusRows,
    ] = await Promise.all([
      Product.countDocuments({}),
      Product.countDocuments({ status: 'active' }),
      Inquiry.countDocuments({}),
      Inquiry.countDocuments({ status: 'new' }),
      Blog.countDocuments({}),
      Blog.countDocuments({ status: 'published' }),
      Certificate.countDocuments({ isActive: true }),

      // Last 5 inquiries for the dashboard feed
      Inquiry.find({}, {
        sort:   'created_at DESC',
        skip:   0,
        limit:  5,
        select: 'id, name, email, country, product, status, created_at',
      }),

      // Aggregate inquiry counts per status
      Inquiry.aggregateByStatus(),
    ]);

    // Reshape status rows into { new: N, read: N, … }
    const statusMap = {};
    for (const row of inquiryStatusRows) {
      statusMap[row.status] = parseInt(row.count);
    }

    return sendSuccess(res, 200, 'Dashboard stats', {
      products: {
        total:  totalProducts,
        active: activeProducts,
      },
      inquiries: {
        total:    totalInquiries,
        new:      newInquiries,
        byStatus: statusMap,
        recent:   recentInquiries,
      },
      blogs: {
        total:     totalBlogs,
        published: publishedBlogs,
      },
      certificates: {
        total: totalCertificates,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardStats };
