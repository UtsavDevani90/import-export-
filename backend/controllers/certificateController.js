// controllers/certificateController.js — Certificate file management (PostgreSQL)
// Public: list active certificates.  Admin: upload, update, delete.

const Certificate = require('../models/Certificate');
const path        = require('path');
const fs          = require('fs');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// ── @route   GET /api/certificates
// ── @access  Public
const getCertificates = async (req, res, next) => {
  try {
    const { type } = req.query;
    const filter = { isActive: true };
    if (type) filter.type = type;

    const certificates = await Certificate.find(filter);
    return sendSuccess(res, 200, 'Certificates fetched', certificates);
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/certificates
// ── @access  Private/Admin
const createCertificate = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'Certificate file is required');
    }

    const folder   = req.file.mimetype === 'application/pdf' ? 'certificates' : 'images';
    const fileUrl  = `/uploads/${folder}/${req.file.filename}`;
    const fileType = req.file.mimetype === 'application/pdf' ? 'pdf'
      : req.file.mimetype.split('/')[1];

    const cert = await Certificate.create({
      ...req.body,
      fileUrl,
      fileType,
    });

    return sendSuccess(res, 201, 'Certificate uploaded successfully', cert);
  } catch (err) {
    next(err);
  }
};

// ── @route   PUT /api/certificates/:id
// ── @access  Private/Admin
const updateCertificate = async (req, res, next) => {
  try {
    const existing = await Certificate.findById(req.params.id);
    if (!existing) return sendError(res, 404, 'Certificate not found');

    if (req.file) {
      // Delete old file from disk
      const oldPath = path.join(__dirname, '..', existing.file_url);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

      const folder      = req.file.mimetype === 'application/pdf' ? 'certificates' : 'images';
      req.body.fileUrl  = `/uploads/${folder}/${req.file.filename}`;
      req.body.fileType = req.file.mimetype === 'application/pdf' ? 'pdf'
        : req.file.mimetype.split('/')[1];
    }

    const cert = await Certificate.findByIdAndUpdate(req.params.id, req.body);
    return sendSuccess(res, 200, 'Certificate updated', cert);
  } catch (err) {
    next(err);
  }
};

// ── @route   DELETE /api/certificates/:id
// ── @access  Private/Admin
const deleteCertificate = async (req, res, next) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) return sendError(res, 404, 'Certificate not found');

    const filePath = path.join(__dirname, '..', cert.file_url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await Certificate.findByIdAndDelete(req.params.id);
    return sendSuccess(res, 200, 'Certificate deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { getCertificates, createCertificate, updateCertificate, deleteCertificate };
