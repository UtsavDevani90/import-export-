import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../context/AuthContext";

// ─────────────────────────────────────────────────────────────────────────────
// GoogleAuthCallback — /auth/google/callback
//
// The backend redirects here after a successful Google OAuth handshake.
// URL params: ?token=<jwt>&user=<json-encoded-user-object>
//
// This page:
//  1. Reads token + user from URL search params
//  2. Stores them in localStorage (same keys as email/password login)
//  3. Updates AuthContext state via googleLoginCallback
//  4. Redirects to /user/dashboard
//
// On any failure it redirects to /login?error=google_failed.
// ─────────────────────────────────────────────────────────────────────────────

export function GoogleAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const { googleLoginCallback } = useAuth();
  const [status, setStatus] = useState<"processing" | "error">("processing");

  useEffect(() => {
    const token   = searchParams.get("token");
    const userRaw = searchParams.get("user");

    // Handle error redirect from backend (e.g. /login?error=google_failed coming back here)
    const backendError = searchParams.get("error");
    if (backendError) {
      setStatus("error");
      setTimeout(() => navigate("/login?error=google_failed", { replace: true }), 1500);
      return;
    }

    if (!token || !userRaw) {
      setStatus("error");
      setTimeout(() => navigate("/login?error=google_failed", { replace: true }), 1500);
      return;
    }

    try {
      const userData = JSON.parse(decodeURIComponent(userRaw));
      googleLoginCallback(token, userData);
      navigate("/user/dashboard", { replace: true });
    } catch {
      setStatus("error");
      setTimeout(() => navigate("/login?error=google_failed", { replace: true }), 1500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "#080808" }}
    >
      {status === "processing" ? (
        <>
          {/* Spinner */}
          <div
            className="w-14 h-14 rounded-full border-4 border-[#d4a017]/20 border-t-[#d4a017] animate-spin mb-6"
          />
          <p className="text-white/60 text-sm">Signing you in with Google…</p>
        </>
      ) : (
        <>
          {/* Error state */}
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
          >
            <span className="text-red-400 text-2xl">✕</span>
          </div>
          <p className="text-white/70 text-sm mb-1">Google sign-in failed.</p>
          <p className="text-white/30 text-xs">Redirecting back to login…</p>
        </>
      )}
    </div>
  );
}
