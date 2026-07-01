// services/emailService.js — Nodemailer inquiry notification
// Sends an HTML email to the admin when a new inquiry is submitted.
// Configure SMTP credentials in .env

const nodemailer = require('nodemailer');
const logger     = require('../utils/logger');

// ── Create reusable transporter ───────────────────────────────
const createTransporter = () => {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT || '587'),
    secure: false,  // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// ── Send inquiry notification to admin ────────────────────────
const sendInquiryNotification = async (inquiry) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logger.warn('Email not configured — skipping inquiry notification');
    return;
  }

  const transporter = createTransporter();

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #d97706; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="color: #fff; margin: 0;">🌿 New Export Inquiry — Tanzora Export</h2>
      </div>
      <div style="background: #fefce8; padding: 24px; border: 1px solid #fde68a;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; font-weight: bold; width: 140px;">Name</td>
              <td style="padding: 8px;">${inquiry.name}</td></tr>
          <tr style="background:#fff8dc;"><td style="padding: 8px; font-weight: bold;">Company</td>
              <td style="padding: 8px;">${inquiry.company || '—'}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Email</td>
              <td style="padding: 8px;"><a href="mailto:${inquiry.email}">${inquiry.email}</a></td></tr>
          <tr style="background:#fff8dc;"><td style="padding: 8px; font-weight: bold;">Phone</td>
              <td style="padding: 8px;">${inquiry.phone || '—'}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Country</td>
              <td style="padding: 8px;">${inquiry.country}</td></tr>
          <tr style="background:#fff8dc;"><td style="padding: 8px; font-weight: bold;">Product</td>
              <td style="padding: 8px;">${inquiry.product || '—'}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Quantity</td>
              <td style="padding: 8px;">${inquiry.quantity || '—'}</td></tr>
          <tr style="background:#fff8dc;"><td style="padding: 8px; font-weight: bold;">Subject</td>
              <td style="padding: 8px;">${inquiry.subject || '—'}</td></tr>
        </table>
        <div style="margin-top: 16px; padding: 12px; background: #fff; border-radius: 4px; border-left: 4px solid #d97706;">
          <strong>Message:</strong>
          <p style="margin: 8px 0 0;">${inquiry.message || 'No message provided.'}</p>
        </div>
      </div>
      <div style="background: #1c1917; padding: 16px; border-radius: 0 0 8px 8px; text-align: center;">
        <p style="color: #a8a29e; font-size: 12px; margin: 0;">
          Tanzora Export Co. — Amreli, Gujarat, India
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from:    `"Tanzora Export Website" <${process.env.SMTP_USER}>`,
    to:      process.env.ADMIN_EMAIL || process.env.SMTP_USER,
    subject: `📬 New Inquiry from ${inquiry.name} (${inquiry.country})`,
    html:    htmlBody,
    replyTo: inquiry.email,
  });

  logger.info(`Inquiry notification sent to ${process.env.ADMIN_EMAIL}`);
};

// ── Send password reset email to user ────────────────────────
const sendPasswordResetEmail = async (toEmail, resetUrl, fullName) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logger.warn('[EMAIL] SMTP not configured — skipping password reset email');
    return;
  }

  const transporter = createTransporter();
  const displayName = fullName || 'there';

  const htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Reset Your Password — Tanzora Export</title>
    </head>
    <body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0a;padding:40px 20px;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" border="0"
                 style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;
                        border:1px solid rgba(212,160,23,0.25);">

            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#1a1208,#0f0c04);
                         padding:36px 40px;text-align:center;
                         border-bottom:1px solid rgba(212,160,23,0.2);">
                <div style="font-size:10px;letter-spacing:0.5em;color:#d4a017;
                            text-transform:uppercase;margin-bottom:6px;">TANZORA EXPORT CO.</div>
                <div style="font-size:22px;font-weight:bold;color:#ffffff;
                            font-family:Georgia,serif;letter-spacing:0.05em;">Password Reset Request</div>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="background:#111111;padding:40px;">
                <p style="color:#cccccc;font-size:15px;line-height:1.6;margin:0 0 20px;">
                  Hi ${displayName},
                </p>
                <p style="color:#cccccc;font-size:15px;line-height:1.6;margin:0 0 28px;">
                  We received a request to reset the password for your Tanzora Export account.
                  Click the button below to set a new password.
                </p>

                <!-- CTA Button -->
                <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 28px;">
                  <tr>
                    <td align="center"
                        style="background:linear-gradient(135deg,#d4a017,#b8860b);
                               border-radius:10px;">
                      <a href="${resetUrl}"
                         style="display:inline-block;padding:16px 36px;
                                font-size:15px;font-weight:bold;color:#0a0a0a;
                                text-decoration:none;letter-spacing:0.05em;">Reset My Password</a>
                    </td>
                  </tr>
                </table>

                <p style="color:#888888;font-size:13px;line-height:1.6;margin:0 0 12px;">
                  This link will expire in <strong style="color:#d4a017;">1 hour</strong>.
                </p>
                <p style="color:#888888;font-size:13px;line-height:1.6;margin:0 0 28px;">
                  If you did not request a password reset, please ignore this email.
                  Your password will remain unchanged.
                </p>

                <!-- URL fallback -->
                <div style="background:#1a1a1a;border:1px solid rgba(255,255,255,0.08);
                            border-radius:8px;padding:14px 18px;margin-bottom:24px;">
                  <p style="color:#666;font-size:11px;margin:0 0 6px;
                            text-transform:uppercase;letter-spacing:0.1em;">Or copy this link:</p>
                  <p style="color:#d4a017;font-size:12px;margin:0;word-break:break-all;">${resetUrl}</p>
                </div>

                <p style="color:#555;font-size:12px;line-height:1.6;margin:0;">
                  For security reasons, this link can only be used once and will expire in 1 hour.
                  If you need a new link, visit the Forgot Password page again.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#0d0d0d;padding:24px 40px;text-align:center;
                         border-top:1px solid rgba(255,255,255,0.05);">
                <p style="color:#444;font-size:12px;margin:0 0 6px;">
                  Tanzora Export Co. &nbsp;|&nbsp; Amreli, Gujarat, India
                </p>
                <p style="color:#333;font-size:11px;margin:0;">
                  You are receiving this email because a password reset was requested for your account.
                </p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from:    `"Tanzora Export" <${process.env.SMTP_USER}>`,
    to:      toEmail,
    subject: 'Reset Your Password — Tanzora Export',
    html:    htmlBody,
  });

  logger.info(`[EMAIL] Password reset email sent to ${toEmail}`);
};

module.exports = { sendInquiryNotification, sendPasswordResetEmail };
