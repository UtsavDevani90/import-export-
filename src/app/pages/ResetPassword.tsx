import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Lock, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { userAuthService } from "../services/api";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing password reset token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await userAuthService.resetPassword(token, password);
      setSuccess(true);
      // Wait 3 seconds then redirect to login
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      // Joi validation errors return in err.response.data.errors array
      if (err.response?.data?.errors?.length > 0) {
        setError(err.response.data.errors[0].message);
      } else {
        setError(err.response?.data?.message || "Failed to reset password. The link might be expired.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(212,160,23,0.04) 0%, #080808 60%)" }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 mb-10">
          <img
            src="/logo.png"
            alt="Tanzora Export"
            className="w-12 h-12 rounded-full object-cover border border-[#d4a017]"
          />
          <div>
            <div className="text-white font-bold text-sm" style={{ letterSpacing: "0.12em" }}>TANZORA</div>
            <div className="text-[#d4a017] text-[8px]" style={{ letterSpacing: "0.3em" }}>EXPORT CO.</div>
          </div>
        </Link>

        <div className="rounded-3xl p-8" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}>
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
                <CheckCircle2 size={32} className="text-green-400"/>
              </div>
              <h1 className="text-white text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display',serif" }}>Password Reset</h1>
              <p className="text-white/50 text-sm mb-6">
                Your password has been successfully reset.<br/>
                Redirecting you to login...
              </p>
              <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-[#0a0a0a]" style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)" }}>
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: "rgba(212,160,23,0.1)", border: "1px solid rgba(212,160,23,0.2)" }}>
                <Lock size={24} className="text-[#d4a017]"/>
              </div>
              <h1 className="text-white text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display',serif" }}>Set New Password</h1>
              <p className="text-white/45 text-sm mb-6">
                Please enter a strong password for your account.
              </p>

              {error && (
                <div className="mb-6 p-4 rounded-xl flex items-start gap-3" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0"/>
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-white/55 text-xs font-semibold block mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"/>
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#d4a017]/60 transition-all"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
                      disabled={!token}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-white/55 text-xs font-semibold block mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"/>
                    <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#d4a017]/60 transition-all"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
                      disabled={!token}
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading || !token}
                  className="w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all mt-6"
                  style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)", color: "#0a0a0a", opacity: (loading || !token) ? 0.7 : 1 }}
                >
                  {loading ? <span className="w-5 h-5 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin"/> : "Reset Password"}
                </button>
              </form>
            </>
          )}
        </div>

        <Link to="/login" className="flex items-center justify-center gap-2 text-white/40 hover:text-white text-sm mt-6 transition-colors">
          <ArrowLeft size={16}/> Back to Login
        </Link>
      </div>
    </div>
  );
}
