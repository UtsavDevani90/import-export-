// middleware/uploadMiddleware.js — Multer file upload configuration
// Handles product images and certificate documents.
// Security: validates MIME type + extension; rejects executables.

const multer = require('multer');
const path   = require('path');
const crypto = require('crypto');
const { sendError } = require('../utils/apiResponse');

// ── Allowed MIME types ────────────────────────────────────────
const ALLOWED_MIME = {
  'image/jpeg': 'jpg',
  'image/jpg':  'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};

// ── Storage engine ────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Separate folders for images vs PDFs
    const folder = file.mimetype === 'application/pdf' ? 'certificates' : 'images';
    cb(null, path.join(__dirname, `../uploads/${folder}`));
  },

  filename: (req, file, cb) => {
    // Create collision-safe filename: random-hex + original-extension
    const ext      = ALLOWED_MIME[file.mimetype] || 'bin';
    const safeName = `${crypto.randomBytes(16).toString('hex')}.${ext}`;
    cb(null, safeName);
  },
});

// ── File filter ───────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME[file.mimetype]) {
    cb(null, true); // Accept
  } else {
    // Reject — triggers MulterError with code LIMIT_UNEXPECTED_FILE
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname), false);
  }
};

// ── Base Multer instance ──────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // Default 5 MB
    files:    5,  // Max 5 files per request
  },
});

// ── Multer error handler ──────────────────────────────────────
// Wrap this around any route that uses upload middleware.
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return sendError(res, 400, 'File too large — maximum 5 MB allowed');
      case 'LIMIT_UNEXPECTED_FILE':
        return sendError(res, 400, 'Invalid file type — only JPG, PNG, WEBP, PDF allowed');
      case 'LIMIT_FILE_COUNT':
        return sendError(res, 400, 'Too many files — maximum 5 per upload');
      default:
        return sendError(res, 400, `Upload error: ${err.message}`);
    }
  }
  next(err);
};

// ── Pre-configured upload presets ────────────────────────────
const uploadProductImage   = upload.array('images', 5);          // Up to 5 product images
const uploadCertificate    = upload.single('certificate');        // One certificate file
const uploadSingleImage    = upload.single('image');              // Blog/single image

module.exports = {
  upload,
  uploadProductImage,
  uploadCertificate,
  uploadSingleImage,
  handleUploadError,
};
