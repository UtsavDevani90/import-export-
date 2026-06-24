// middleware/auditLog.js — Structured audit logging for admin actions
// Writes security-sensitive events to logs/audit.log (separate from app logs).
// Used as route middleware on admin mutation endpoints.

const fs     = require('fs');
const path   = require('path');
const logger = require('../utils/logger');

// ── Ensure audit log directory exists ────────────────────────
const AUDIT_LOG_PATH = path.join(__dirname, '../logs/audit.log');
const logsDir        = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ── Write a structured audit entry ───────────────────────────
const writeAuditEntry = (entry) => {
  const line = JSON.stringify({
    timestamp:   new Date().toISOString(),
    ...entry,
  }) + '\n';

  fs.appendFile(AUDIT_LOG_PATH, line, (err) => {
    if (err) logger.error(`[AUDIT] Failed to write audit log: ${err.message}`);
  });
};

// ── Log security event (call directly from controllers) ───────
const logSecurityEvent = (event) => {
  writeAuditEntry({ type: 'SECURITY', ...event });
  logger.info(`[SECURITY] ${event.action} | ${JSON.stringify(event)}`);
};

// ── Log admin action (call directly from controllers) ─────────
const logAdminAction = (event) => {
  writeAuditEntry({ type: 'ADMIN_ACTION', ...event });
};

// ── Middleware factory — automatically logs after response ─────
// Usage: router.delete('/:id', protect, adminOnly, auditMiddleware('product.deleted'), handler)
const auditMiddleware = (action) => (req, res, next) => {
  // Hook into response finish event to capture status code
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    // Log only after we know whether the action succeeded
    const success = body?.success !== false;
    writeAuditEntry({
      type:        'ADMIN_ACTION',
      action,
      success,
      adminId:     req.admin?.id,
      adminName:   req.admin?.name,
      adminRole:   req.admin?.role,
      entityId:    req.params?.id,
      ip:          req.ip,
      userAgent:   req.get('user-agent'),
      method:      req.method,
      path:        req.originalUrl,
      statusCode:  res.statusCode,
    });
    return originalJson(body);
  };
  next();
};

module.exports = { auditMiddleware, logSecurityEvent, logAdminAction, writeAuditEntry };
