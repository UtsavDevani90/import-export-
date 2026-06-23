// controllers/dashboardController.js — Admin dashboard statistics (PostgreSQL)
// Returns aggregated counts and recent activity for the dashboard overview.

const { pool }    = require('../config/db');
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
      buyerCountResult,
      quotationCountResult,
      sentQuotationCountResult,
      recentBuyersResult,
      recentQuotationsResult,
    ] = await Promise.all([
      Product.countDocuments({}),
      Product.countDocuments({ status: 'active' }),
      Inquiry.countDocuments({}),
      Inquiry.countDocuments({ status: 'new' }),
      Blog.countDocuments({}),
      Blog.countDocuments({ status: 'published' }),
      Certificate.countDocuments({ isActive: true }),

      // Last 5 inquiries for the dashboard feed — SELECT * to get every column
      Inquiry.find({}, {
        sort:  'created_at DESC',
        skip:  0,
        limit: 5,
      }),

      // Aggregate inquiry counts per status
      Inquiry.aggregateByStatus(),

      // Buyer statistics
      pool.query('SELECT COUNT(*) FROM buyers'),
      pool.query('SELECT COUNT(*) FROM quotations'),
      pool.query("SELECT COUNT(*) FROM quotations WHERE status = $1", ['sent']),

      // Recent buyers
      pool.query(
        `SELECT id, name, company, country, email, created_at
         FROM buyers
         ORDER BY created_at DESC
         LIMIT 5`
      ),

      // Recent quotations
      pool.query(
        `SELECT id, quote_number, buyer_name, buyer_company, status,
                total_amount, currency, created_at
         FROM quotations
         ORDER BY created_at DESC
         LIMIT 5`
      ),
    ]);

    // Reshape status rows into { new: N, read: N, … }
    const statusMap = {};
    for (const row of inquiryStatusRows) {
      statusMap[row.status] = parseInt(row.count);
    }

    const totalBuyers       = parseInt(buyerCountResult.rows[0].count);
    const totalQuotations   = parseInt(quotationCountResult.rows[0].count);
    const sentQuotations    = parseInt(sentQuotationCountResult.rows[0].count);
    const recentBuyers      = recentBuyersResult.rows;
    const recentQuotations  = recentQuotationsResult.rows;

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
      buyers: {
        total:  totalBuyers,
        recent: recentBuyers,
      },
      quotations: {
        total:  totalQuotations,
        sent:   sentQuotations,
        recent: recentQuotations,
      },
      recentBuyers,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardStats };
