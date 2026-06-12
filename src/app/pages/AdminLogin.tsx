import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Eye, EyeOff, LogIn, Shield, Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function AdminLogin() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const { adminLogin } = useAuth();
  const navigate        = useNavigate();
  const location        = useLocation();
  const from            = (location.state as { from?: { pathname: string } })?.from?.pathname || "/admin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    const { ok, error: msg } = await adminLogin(email, password, true);
    if (ok) navigate(from, { replace: true });
    else { setError(msg || "Invalid credentials. Please try again."); setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "radial-gradient(ellipse at top, #0f0c02 0%, #080808 60%)" }}>
      {/* Subtle grid bg */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(212,160,23,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,160,23,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}>
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)", boxShadow: "0 8px 32px rgba(212,160,23,0.3)" }}>
              <Shield size={24} className="text-[#0a0a0a]" />
            </div>
          </div>

          <h1 className="text-white text-2xl font-bold text-center mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Admin Portal</h1>
          <p className="text-white/40 text-sm text-center mb-8">Tanzora Export — Restricted Access</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm text-red-400 border border-red-500/30 bg-red-500/10">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-white/50 text-xs font-semibold block mb-1.5">Admin Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="admin@tanzoraexport.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  onFocus={e => e.currentTarget.style.borderColor = "rgba(212,160,23,0.5)"}
                  onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-white/50 text-xs font-semibold block mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  id="admin-password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  onFocus={e => e.currentTarget.style.borderColor = "rgba(212,160,23,0.5)"}
                  onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="admin-login-submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 mt-2"
              style={{ background: loading ? "rgba(212,160,23,0.4)" : "linear-gradient(135deg,#d4a017,#b8860b)", color: "#0a0a0a", boxShadow: loading ? "none" : "0 4px 20px rgba(212,160,23,0.25)" }}
            >
              {loading
                ? <span className="w-5 h-5 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
                : <><LogIn size={15} /> Sign In to Admin Panel</>}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-center text-white/30 text-xs">
              Not an admin?{" "}
              <Link to="/login" className="text-[#d4a017] hover:underline">Go to User Login</Link>
            </p>
          </div>
        </div>

        {/* Back to site */}
        <div className="text-center mt-4">
          <Link to="/" className="text-white/25 text-xs hover:text-white/50 transition-colors">
            ← Back to Tanzora Export
          </Link>
        </div>
      </div>
    </div>
  );
}
