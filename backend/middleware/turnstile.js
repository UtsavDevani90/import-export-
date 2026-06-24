// middleware/turnstile.js — Cloudflare Turnstile bot protection
// Validates the cf-turnstile-response token on protected public forms.
// Requires TURNSTILE_SECRET_KEY env var (get from dash.cloudflare.com).
//
// Frontend setup:
//   1. Add <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
//   2. Add <div class="cf-turnstile" data-sitekey="YOUR_SITE_KEY"></div> to forms
//   3. The widget auto-fills a hidden input named "cf-turnstile-response"
//   4. Include it in your form POST body as { "cf-turnstile-response": token }
//
// Dev bypass: when NODE_ENV !== 'production', Turnstile check is skipped.

const https  = require('https');
const qs     = require('querystring');
const { sendError } = require('../utils/apiResponse');
const logger = require('../utils/logger');

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// ── Call Turnstile siteverify API ─────────────────────────────
const verifyChallengeToken = (token, ip) => new Promise((resolve, reject) => {
  const secretKey = process.env.TURNSTILE_SECRET_KEY || '';

  const postData = qs.stringify({
    secret:   secretKey,
    response: token,
    remoteip: ip || undefined,
  });

  const options = {
    method:  'POST',
    headers: {
      'Content-Type':   'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const req = https.request(VERIFY_URL, options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error('Invalid Turnstile API response'));
      }
    });
  });

  req.on('error', reject);
  req.write(postData);
  req.end();
});

// ── Turnstile verification middleware ─────────────────────────
const verifyTurnstile = async (req, res, next) => {
  // Skip in development/test — avoids needing a token during local testing
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  // Also skip if secret is not configured (graceful degradation with warning)
  if (!process.env.TURNSTILE_SECRET_KEY) {
    logger.warn('[TURNSTILE] TURNSTILE_SECRET_KEY is not set — bot protection is disabled.');
    return next();
  }

  const token = req.body?.['cf-turnstile-response'];

  if (!token) {
    return sendError(res, 400, 'Bot verification token is missing. Please complete the verification.');
  }

  try {
    const result = await verifyChallengeToken(token, req.ip);

    if (!result.success) {
      logger.warn(`[TURNSTILE] Verification failed | IP: ${req.ip} | codes: ${result['error-codes']?.join(',')}`);
      return sendError(res, 400, 'Bot verification failed. Please try again.');
    }

    logger.info(`[TURNSTILE] Verification passed | IP: ${req.ip}`);
    next();
  } catch (err) {
    logger.error(`[TURNSTILE] API error: ${err.message}`);
    // Fail open — don't block legitimate users if Turnstile API is down
    next();
  }
};

module.exports = { verifyTurnstile };
