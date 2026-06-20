import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Eye, EyeOff, LogIn, ArrowRight, Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useStats } from "../hooks/useStats";

const SPICE_BG = "https://images.unsplash.com/photo-1768729341078-9da4e0ea959e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const { userLogin } = useAuth();
  const { stats: statsData, loading: statsLoading } = useStats();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Show error if redirected back from a failed Google OAuth attempt
  useEffect(() => {
    if (searchParams.get("error") === "google_failed") {
      setError("Google sign-in failed. Please try again or use email/password.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dynamic stats with fallback
  const clients = statsData.clients || '500+';
  const countries = statsData.countries || '50+';
  const years = statsData.years || '19+';
  const statsValues = [clients, countries, years];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    const { ok, error: msg } = await userLogin(email, password, remember);
    if (ok) navigate("/user/dashboard");
    else { setError(msg || "Invalid credentials. Please try again."); setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#080808" }}>
      {/* Left – Spice Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={SPICE_BG} alt="Spices" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(8,8,8,0.7) 0%, rgba(8,8,8,0.3) 100%)" }} />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <div className="inline-flex items-center gap-2 bg-[#d4a017]/20 border border-[#d4a017]/30 text-[#d4a017] text-xs px-3 py-1.5 rounded-full mb-4 w-fit">
            <span className="w-2 h-2 rounded-full bg-[#d4a017] animate-pulse" />
            Trusted by {statsLoading ? '...' : clients} Global Importers
          </div>
          <h2 className="text-white text-4xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            Access Your<br /><span className="text-[#d4a017]">Export Portal</span>
          </h2>
          <p className="text-white/60 text-sm max-w-xs">
            Manage inquiries, download certificates, track shipments, and access exclusive B2B pricing.
          </p>
          <div className="flex gap-4 mt-8">
            {statsValues.map((v, i) => (
              <div key={i} className="text-center">
                <div className="text-[#d4a017] font-bold text-xl">{statsLoading ? '...' : v}</div>
                <div className="text-white/40 text-xs">{["Clients", "Countries", "Years"][i]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right – Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-8">
            <img
              src="/logo.png"
              alt="Tanzora Export"
              className="w-14 h-14 object-contain"
            />
            <div>
              <div className="text-white font-bold text-base" style={{ letterSpacing: "0.12em" }}>
                TANZORA
              </div>
              <div className="text-[#d4a017] text-[9px]" style={{ letterSpacing: "0.3em" }}>
                EXPORT CO.
              </div>
            </div>
          </Link>

          <h1 className="text-white text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Welcome Back</h1>
          <p className="text-white/40 text-sm mb-8">Sign in to your Tanzora Export account</p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-400 border border-red-500/30 bg-red-500/10">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-white/60 text-xs font-semibold block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="you@company.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#d4a017]/60 transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-white/60 text-xs font-semibold">Password</label>
                <Link to="/forgot-password" className="text-[#d4a017] text-xs hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#d4a017]/60 transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" checked={remember} onChange={e => setRemember(e.target.checked)} className="w-4 h-4 accent-[#d4a017] rounded" />
              <label htmlFor="remember" className="text-white/50 text-sm">Remember me for 30 days</label>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)", color: "#0a0a0a", boxShadow: "0 4px 20px rgba(212,160,23,0.3)", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? <span className="w-5 h-5 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" /> : <><LogIn size={16} /> Sign In</>}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-white/30 text-xs">or continue with</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            <button type="button"
              onClick={() => {
                setGoogleLoading(true);
                const apiBase = import.meta.env.VITE_API_URL || 'https://import-export-jhik.onrender.com/api';
                window.location.href = `${apiBase}/users/auth/google`;
              }}
              disabled={googleLoading}
              className="w-full py-3.5 rounded-xl text-sm font-medium text-white/70 hover:text-white transition-all flex items-center justify-center gap-2"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", opacity: googleLoading ? 0.7 : 1 }}
            >
              {googleLoading ? (
                <span className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              )}
              {googleLoading ? "Redirecting to Google…" : "Continue with Google"}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#d4a017] hover:underline font-medium">Create Account <ArrowRight size={13} className="inline" /></Link>
          </p>
          <p className="text-center text-white/20 text-xs mt-3">
            Are you an admin?{" "}
            <Link to="/admin/login" className="text-white/40 hover:text-[#d4a017] hover:underline transition-colors">Admin Portal →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
