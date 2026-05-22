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

module.exports = { sendInquiryNotification };
