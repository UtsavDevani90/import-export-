/// <reference types="vite/client" />

// ── Vite ImportMeta environment variable types ──────────────────────────────
// Augments ImportMetaEnv so TypeScript knows about every VITE_* variable
// used in this project.  Add new variables here as you introduce them.
//
// The triple-slash reference above loads vite/client which declares the base
// ImportMeta interface (import.meta.env, import.meta.hot, etc.).
// ─────────────────────────────────────────────────────────────────────────────

interface ImportMetaEnv {
  /**
   * Base URL of the backend API.
   * Set in .env:  VITE_API_URL=http://localhost:5000/api
   * Set in Vercel project settings for production.
   */
  readonly VITE_API_URL: string;

  // ── Vite built-ins (always available) ─────────────────────────────────────
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
