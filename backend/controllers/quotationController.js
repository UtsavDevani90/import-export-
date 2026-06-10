// controllers/quotationController.js — Quotation management (PostgreSQL)
// Admin-only CRUD for export quotations with PDF generation.

const Quotation    = require('../models/Quotation');
const ActivityLog  = require('../models/ActivityLog');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// ── @route   GET /api/quotations
// ── @desc    List quotations with optional status/buyer filter and pagination
// ── @access  Private/Admin
const getQuotations = async (req, res, next) => {
  try {
    const { status, buyerId, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status)  filter.status  = status;
    if (buyerId) filter.buyerId = buyerId;

    const total = await Quotation.countDocuments(filter);
    const quotations = await Quotation.findAll({
      status,
      buyerId,
      page:  parseInt(page),
      limit: parseInt(limit),
    });

    return sendSuccess(res, 200, 'Quotations fetched', {
      quotations,
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

// ── @route   GET /api/quotations/:id
// ── @desc    Get single quotation with line items
// ── @access  Private/Admin
const getQuotation = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return sendError(res, 404, 'Quotation not found');
    return sendSuccess(res, 200, 'Quotation fetched', quotation);
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/quotations
// ── @desc    Create a new quotation with line items
// ── @access  Private/Admin
const createQuotation = async (req, res, next) => {
  try {
    const {
      buyerId, buyerName, buyerEmail, buyerCompany, buyerCountry,
      status, notes, totalAmount, currency, validUntil, items = [],
    } = req.body;

    if (!buyerName || !buyerEmail) {
      return sendError(res, 400, 'Buyer name and email are required');
    }
    if (!Array.isArray(items) || items.length === 0) {
      return sendError(res, 400, 'At least one line item is required');
    }

    const quoteNumber = await Quotation.generateQuoteNumber();

    const quotation = await Quotation.create(
      {
        quoteNumber,
        buyerId:      buyerId     || null,
        buyerName,
        buyerEmail,
        buyerCompany: buyerCompany || null,
        buyerCountry: buyerCountry || null,
        status:       status       || 'draft',
        notes:        notes        || null,
        totalAmount:  totalAmount  || 0,
        currency:     currency     || 'USD',
        validUntil:   validUntil   || null,
        createdBy:    req.admin.id,
      },
      items
    );


    await ActivityLog.insert({
      adminId:     req.admin.id,
      adminName:   req.admin.name,
      action:      'quotation.created',
      entityType:  'quotation',
      entityId:    quotation.id,
      entityLabel: quoteNumber,
      details:     { buyerName, buyerEmail, status: quotation.status, totalAmount: quotation.total_amount },
      ipAddress:   req.ip,
    }).catch(() => {});

    return sendSuccess(res, 201, 'Quotation created successfully', quotation);
  } catch (err) {
    next(err);
  }
};

// ── @route   PUT /api/quotations/:id
// ── @desc    Update quotation header and replace line items
// ── @access  Private/Admin
const updateQuotation = async (req, res, next) => {
  try {
    const existing = await Quotation.findById(req.params.id);
    if (!existing) return sendError(res, 404, 'Quotation not found');

    const {
      buyerId, buyerName, buyerEmail, buyerCompany, buyerCountry,
      status, notes, totalAmount, currency, validUntil, items,
    } = req.body;

    const quotation = await Quotation.update(
      req.params.id,
      {
        buyerId, buyerName, buyerEmail, buyerCompany, buyerCountry,
        status, notes, totalAmount, currency, validUntil,
      },
      items // may be undefined — model handles that gracefully
    );

    await ActivityLog.insert({
      adminId:     req.admin.id,
      adminName:   req.admin.name,
      action:      'quotation.updated',
      entityType:  'quotation',
      entityId:    quotation.id,
      entityLabel: quotation.quote_number,
      details:     { status: quotation.status },
      ipAddress:   req.ip,
    }).catch(() => {});

    return sendSuccess(res, 200, 'Quotation updated successfully', quotation);
  } catch (err) {
    next(err);
  }
};

// ── @route   DELETE /api/quotations/:id
// ── @desc    Delete a quotation
// ── @access  Private/Admin
const deleteQuotation = async (req, res, next) => {
  try {
    const quotation = await Quotation.remove(req.params.id);
    if (!quotation) return sendError(res, 404, 'Quotation not found');

    await ActivityLog.insert({
      adminId:     req.admin.id,
      adminName:   req.admin.name,
      action:      'quotation.deleted',
      entityType:  'quotation',
      entityId:    req.params.id,
      entityLabel: quotation.quote_number,
      details:     {},
      ipAddress:   req.ip,
    }).catch(() => {});

    return sendSuccess(res, 200, 'Quotation deleted successfully');
  } catch (err) {
    next(err);
  }
};

// ── @route   GET /api/quotations/:id/pdf
// ── @desc    Return a print-ready HTML invoice for the quotation
// ── @access  Private/Admin
const getQuotationPdf = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return sendError(res, 404, 'Quotation not found');

    const items = quotation.items || [];

    const formatCurrency = (amount, currency = 'USD') => {
      const num = parseFloat(amount) || 0;
      return `${currency} ${num.toFixed(2)}`;
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '—';
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
    };

    const itemRows = items.map((item, i) => `
      <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
        <td>${i + 1}</td>
        <td>
          <strong>${escapeHtml(item.product_name)}</strong>
          ${item.description ? `<br/><small>${escapeHtml(item.description)}</small>` : ''}
        </td>
        <td class="center">${item.quantity}</td>
        <td class="right">${formatCurrency(item.unit_price, quotation.currency)}</td>
        <td class="right">${formatCurrency(item.total_price, quotation.currency)}</td>
      </tr>
    `).join('');

    const statusColor = {
      draft:    '#6c757d',
      sent:     '#0d6efd',
      accepted: '#198754',
      rejected: '#dc3545',
    }[quotation.status] || '#6c757d';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Quotation ${escapeHtml(quotation.quote_number)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 13px;
      color: #222;
      background: #fff;
      padding: 40px;
    }
    .page { max-width: 860px; margin: 0 auto; }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #1a472a;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .company-name {
      font-size: 26px;
      font-weight: 700;
      color: #1a472a;
      letter-spacing: 1px;
    }
    .company-sub {
      font-size: 12px;
      color: #555;
      margin-top: 4px;
    }
    .quote-meta { text-align: right; }
    .quote-number {
      font-size: 20px;
      font-weight: 700;
      color: #1a472a;
    }
    .status-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      color: #fff;
      background: ${statusColor};
      margin-top: 6px;
      text-transform: uppercase;
    }

    /* Info grid */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    .info-box {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      padding: 16px;
    }
    .info-box h3 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #1a472a;
      margin-bottom: 10px;
      font-weight: 700;
    }
    .info-box p { line-height: 1.8; color: #444; }
    .info-box strong { color: #222; }

    /* Line items table */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    thead th {
      background: #1a472a;
      color: #fff;
      padding: 10px 12px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    thead th.center { text-align: center; }
    thead th.right  { text-align: right; }
    tbody td { padding: 10px 12px; border-bottom: 1px solid #e9ecef; }
    tbody td.center { text-align: center; }
    tbody td.right  { text-align: right; }
    tbody tr.even   { background: #fff; }
    tbody tr.odd    { background: #f8f9fa; }
    tbody small     { color: #777; font-size: 11px; }

    /* Totals */
    .totals {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 30px;
    }
    .totals-box {
      min-width: 260px;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      overflow: hidden;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 16px;
      border-bottom: 1px solid #dee2e6;
    }
    .totals-row:last-child { border-bottom: none; }
    .totals-row.grand {
      background: #1a472a;
      color: #fff;
      font-weight: 700;
      font-size: 14px;
    }

    /* Notes */
    .notes-section {
      background: #fff8e1;
      border-left: 4px solid #f0a500;
      padding: 14px 16px;
      border-radius: 0 6px 6px 0;
      margin-bottom: 30px;
    }
    .notes-section h3 {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #b07d00;
      margin-bottom: 6px;
      font-weight: 700;
    }

    /* Footer */
    .footer {
      border-top: 2px solid #1a472a;
      padding-top: 16px;
      text-align: center;
      color: #777;
      font-size: 11px;
      line-height: 1.8;
    }

    @media print {
      body { padding: 20px; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- Company Header -->
  <div class="header">
    <div>
      <div class="company-name">TANZORA EXPORT CO.</div>
      <div class="company-sub">Premium Agricultural &amp; Industrial Exports</div>
      <div class="company-sub" style="margin-top:8px;">
        Email: exports@tanzora.com &nbsp;|&nbsp; Tel: +255 XXX XXX XXX
      </div>
    </div>
    <div class="quote-meta">
      <div class="quote-number">${escapeHtml(quotation.quote_number)}</div>
      <div style="color:#555; margin-top:4px; font-size:12px;">
        Date: ${formatDate(quotation.created_at)}
      </div>
      ${quotation.valid_until ? `<div style="color:#555; font-size:12px;">Valid Until: ${formatDate(quotation.valid_until)}</div>` : ''}
      <div><span class="status-badge">${escapeHtml(quotation.status)}</span></div>
    </div>
  </div>

  <!-- Buyer / Company Info -->
  <div class="info-grid">
    <div class="info-box">
      <h3>Bill To</h3>
      <p>
        <strong>${escapeHtml(quotation.buyer_name)}</strong><br/>
        ${quotation.buyer_company ? `${escapeHtml(quotation.buyer_company)}<br/>` : ''}
        ${escapeHtml(quotation.buyer_email)}<br/>
        ${quotation.buyer_country ? escapeHtml(quotation.buyer_country) : ''}
      </p>
    </div>
    <div class="info-box">
      <h3>Quotation Details</h3>
      <p>
        <strong>Reference:</strong> ${escapeHtml(quotation.quote_number)}<br/>
        <strong>Currency:</strong> ${escapeHtml(quotation.currency || 'USD')}<br/>
        <strong>Status:</strong> ${escapeHtml(quotation.status)}<br/>
        ${quotation.valid_until ? `<strong>Valid Until:</strong> ${formatDate(quotation.valid_until)}` : ''}
      </p>
    </div>
  </div>

  <!-- Line Items Table -->
  <table>
    <thead>
      <tr>
        <th style="width:40px;">#</th>
        <th>Product / Description</th>
        <th class="center" style="width:80px;">Qty</th>
        <th class="right" style="width:130px;">Unit Price</th>
        <th class="right" style="width:130px;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows || '<tr><td colspan="5" style="text-align:center;padding:20px;color:#999;">No items</td></tr>'}
    </tbody>
  </table>

  <!-- Totals -->
  <div class="totals">
    <div class="totals-box">
      <div class="totals-row">
        <span>Subtotal</span>
        <span>${formatCurrency(quotation.total_amount, quotation.currency)}</span>
      </div>
      <div class="totals-row grand">
        <span>TOTAL</span>
        <span>${formatCurrency(quotation.total_amount, quotation.currency)}</span>
      </div>
    </div>
  </div>

  ${quotation.notes ? `
  <!-- Notes -->
  <div class="notes-section">
    <h3>Notes &amp; Terms</h3>
    <p>${escapeHtml(quotation.notes)}</p>
  </div>
  ` : ''}

  <!-- Footer -->
  <div class="footer">
    <p>Thank you for your business. This quotation is valid for 30 days from the date of issue unless otherwise stated.</p>
    <p style="margin-top:6px;">Tanzora Export Co. &nbsp;|&nbsp; exports@tanzora.com &nbsp;|&nbsp; www.tanzora.com</p>
  </div>

</div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  } catch (err) {
    next(err);
  }
};

// ── HTML escape helper ─────────────────────────────────────────
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}

module.exports = {
  getQuotations,
  getQuotation,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  getQuotationPdf,
};
