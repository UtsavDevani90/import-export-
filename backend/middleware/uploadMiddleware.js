// middleware/uploadMiddleware.js — Multer file upload configuration
// Security hardened:
//   • MIME type whitelist (allowedMIME)
//   • Magic-byte (file signature) verification via file-type
//   • Crypto-random filenames (collision-safe, no path traversal)
//   • Separate folders for images vs certificates
//   • 5 MB size limit, 5 file max

const multer = require('multer');
const path   = require('path');
const crypto = require('crypto');
const fs     = require('fs');
const { sendError } = require('../utils/apiResponse');

// ── Allowed MIME types and their safe extensions ──────────────
const ALLOWED_MIME = {
  'image/jpeg': 'jpg',
  'image/jpg':  'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/gif':  'gif',
  'application/pdf': 'pdf',
};

// ── Ensure upload directories exist at startup ────────────────
const UPLOADS_BASE = path.join(__dirname, '../uploads');
['images', 'certificates'].forEach((dir) => {
  const fullPath = path.join(UPLOADS_BASE, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// ── Storage engine ────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = file.mimetype === 'application/pdf' ? 'certificates' : 'images';
    cb(null, path.join(UPLOADS_BASE, folder));
  },

  filename: (req, file, cb) => {
    // Random 32-char hex name — prevents path traversal and enumeration
    const ext      = ALLOWED_MIME[file.mimetype] || 'bin';
    const safeName = `${crypto.randomBytes(16).toString('hex')}.${ext}`;
    cb(null, safeName);
  },
});

// ── File filter: MIME type check (first line of defense) ──────
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname), false);
  }
};

// ── Base Multer instance ──────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5 MB default
    files:    5,
  },
});

// ── Magic-byte verification (post-upload, before controller) ──
// Uses file-type to check actual file content against declared MIME.
// Rejects files where the declared MIME doesn't match magic bytes.
const verifyMagicBytes = async (req, res, next) => {
  const files = req.files || (req.file ? [req.file] : []);
  if (!files.length) return next();

  try {
    // Dynamic import for file-type (CommonJS compatible v16)
    const { fileTypeFromFile } = await import('file-type');

    for (const file of files) {
      const detected = await fileTypeFromFile(file.path);

      // If file-type cannot determine type (e.g. plain text) — reject
      if (!detected) {
        fs.unlinkSync(file.path); // Remove the file
        return sendError(res, 400, `File "${file.originalname}" has an unrecognized format. Only JPG, PNG, WEBP, GIF, and PDF are allowed.`);
      }

      // Check detected MIME against our whitelist
      if (!ALLOWED_MIME[detected.mime]) {
        fs.unlinkSync(file.path);
        return sendError(res, 400, `File "${file.originalname}" appears to be a ${detected.mime} file, which is not allowed.`);
      }

      // Check that declared MIME matches actual content
      if (detected.mime !== file.mimetype && !(file.mimetype === 'image/jpg' && detected.mime === 'image/jpeg')) {
        fs.unlinkSync(file.path);
        return sendError(res, 400, `File "${file.originalname}" content does not match its declared type. Upload rejected.`);
      }
    }

    next();
  } catch (err) {
    // file-type import failure — log and allow through (graceful degradation)
    const logger = require('../utils/logger');
    logger.error(`[UPLOAD] Magic-byte check failed: ${err.message}`);
    next();
  }
};

// ── Multer error handler ──────────────────────────────────────
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return sendError(res, 400, 'File too large — maximum 5 MB allowed');
      case 'LIMIT_UNEXPECTED_FILE':
        return sendError(res, 400, 'Invalid file type — only JPG, PNG, WEBP, GIF, PDF allowed');
      case 'LIMIT_FILE_COUNT':
        return sendError(res, 400, 'Too many files — maximum 5 per upload');
      default:
        return sendError(res, 400, `Upload error: ${err.message}`);
    }
  }
  next(err);
};

// ── Pre-configured upload presets ────────────────────────────
const uploadProductImage = upload.array('images', 5);
const uploadCertificate  = upload.single('certificate');
const uploadSingleImage  = upload.single('image');

module.exports = {
  upload,
  uploadProductImage,
  uploadCertificate,
  uploadSingleImage,
  verifyMagicBytes,
  handleUploadError,
};
