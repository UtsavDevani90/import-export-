// routes/certificateRoutes.js
const express = require('express');
const router  = express.Router();
const {
  getCertificates, createCertificate, updateCertificate, deleteCertificate,
} = require('../controllers/certificateController');
const { protect, adminOnly }     = require('../middleware/authMiddleware');
const { uploadCertificate, handleUploadError } = require('../middleware/uploadMiddleware');

// ── Public ───────────────────────────────────────────────────
router.get('/', getCertificates);   // GET /api/certificates

// ── Admin ────────────────────────────────────────────────────
router.post(
  '/',
  protect, adminOnly,
  uploadCertificate, handleUploadError,
  createCertificate
);

router.put(
  '/:id',
  protect, adminOnly,
  uploadCertificate, handleUploadError,
  updateCertificate
);

router.delete('/:id', protect, adminOnly, deleteCertificate);

module.exports = router;
