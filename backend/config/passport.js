// config/passport.js — Google OAuth2 Passport strategy
// ─────────────────────────────────────────────────────────────────────────
// We use Passport ONLY for the OAuth redirect/callback dance.
// Session management is handled by our own JWT cookie system, NOT by
// Passport sessions. After verification we hand off to googleAuthController
// which sets the user_token cookie and redirects the browser.
// ─────────────────────────────────────────────────────────────────────────

const passport        = require('passport');
const GoogleStrategy  = require('passport-google-oauth20').Strategy;
const User            = require('../models/User');
const logger          = require('../utils/logger');

// Only register Google OAuth strategy when credentials are configured.
// If GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are absent, skip registration
// and log a warning — Google login routes will return an error gracefully.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID:     process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:  process.env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const email    = profile.emails?.[0]?.value?.toLowerCase().trim();
          const fullName = profile.displayName || email?.split('@')[0] || 'Google User';
          const avatar   = profile.photos?.[0]?.value || null;

          // ── Step 1: Look up by google_id (returning user) ─────────────
          let user = await User.findByGoogleId(googleId);
          if (user) {
            logger.info(`[GOOGLE AUTH] Returning Google user: ${email}`);
            // Refresh avatar in case it changed
            if (avatar && avatar !== user.avatar) {
              await User.linkGoogleId(user.id, googleId, avatar);
            }
            return done(null, user);
          }

          // ── Step 2: Look up by email (account merge) ──────────────────
          if (email) {
            user = await User.findByEmail(email);
            if (user) {
              // Existing email/password account — link Google ID to it
              logger.info(`[GOOGLE AUTH] Linking Google ID to existing account: ${email}`);
              user = await User.linkGoogleId(user.id, googleId, avatar);
              return done(null, user);
            }
          }

          // ── Step 3: New user — create account ─────────────────────────
          if (!email) {
            return done(null, false, { message: 'No email provided by Google.' });
          }
          logger.info(`[GOOGLE AUTH] Creating new Google user: ${email}`);
          user = await User.createGoogleUser({ full_name: fullName, email, google_id: googleId, avatar });
          return done(null, user);

        } catch (err) {
          logger.error(`[GOOGLE AUTH] Strategy error: ${err.message}`);
          return done(err, null);
        }
      }
    )
  );
  logger.info('[PASSPORT] Google OAuth strategy registered ✅');
} else {
  logger.warn('[PASSPORT] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set — Google OAuth disabled.');
}

// Minimal stubs — Passport requires these even when not using sessions.
// We do NOT call passport.session() so these are never invoked in practice.
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, { id }));

module.exports = passport;
