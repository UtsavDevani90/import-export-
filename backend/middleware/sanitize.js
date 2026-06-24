// middleware/sanitize.js — HTML sanitization middleware
// Uses sanitize-html to strip XSS payloads from text and rich-text fields.
// Two modes:
//   sanitizeBody(fields) — strips ALL HTML from plain text fields
//   sanitizeHtmlContent  — allows safe HTML subset for blog/CMS rich content

const sanitizeHtml = require('sanitize-html');

// ── Allowed HTML for rich text (blog content, CMS) ────────────
const RICH_TEXT_OPTIONS = {
  allowedTags: [
    'b', 'i', 'u', 'em', 'strong', 'del', 's',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'div', 'span',
  ],
  allowedAttributes: {
    a:   ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
    '*': ['class', 'id'],
  },
  allowedSchemes:          ['http', 'https', 'mailto'],
  allowedSchemesByTag:     { img: ['http', 'https', 'data'] },
  allowProtocolRelative:   false,
  // Force all links to be safe
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        rel: 'noopener noreferrer',
        // Only allow http/https hrefs
        href: /^https?:\/\//i.test(attribs.href || '') ? attribs.href : '#',
      },
    }),
  },
};

// ── Plain text — strip ALL HTML ───────────────────────────────
const PLAIN_TEXT_OPTIONS = {
  allowedTags:       [],
  allowedAttributes: {},
};

// ── Sanitize plain text (no HTML allowed) ─────────────────────
const sanitizePlain = (str) => {
  if (typeof str !== 'string') return str;
  return sanitizeHtml(str.trim(), PLAIN_TEXT_OPTIONS);
};

// ── Sanitize rich HTML content ────────────────────────────────
const sanitizeRichHtml = (str) => {
  if (typeof str !== 'string') return str;
  return sanitizeHtml(str, RICH_TEXT_OPTIONS);
};

// ── Middleware: sanitize specific fields in req.body ──────────
// Usage: sanitizeBody(['name', 'company', 'message'])
const sanitizeBody = (fields) => (req, res, next) => {
  if (!req.body || typeof req.body !== 'object') return next();

  for (const field of fields) {
    if (req.body[field] !== undefined) {
      req.body[field] = sanitizePlain(req.body[field]);
    }
  }
  next();
};

// ── Middleware: sanitize rich HTML fields in req.body ─────────
// Usage: sanitizeRichBody(['content', 'description'])
const sanitizeRichBody = (fields) => (req, res, next) => {
  if (!req.body || typeof req.body !== 'object') return next();

  for (const field of fields) {
    if (req.body[field] !== undefined) {
      req.body[field] = sanitizeRichHtml(req.body[field]);
    }
  }
  next();
};

module.exports = {
  sanitizeBody,
  sanitizeRichBody,
  sanitizePlain,
  sanitizeRichHtml,
};
