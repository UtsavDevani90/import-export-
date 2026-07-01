import { useState } from "react";
import { Link } from "react-router";
import { Mail, ArrowLeft, CheckCircle2, Send } from "lucide-react";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setSent(true);
    setLoading(false);
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
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
                <CheckCircle2 size={32} className="text-green-400"/>
              </div>
              <h1 className="text-white text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display',serif" }}>Check Your Email</h1>
              <p className="text-white/50 text-sm mb-6">
                We've sent a password reset link to <span className="text-[#d4a017]">{email}</span>.<br/>
                Please check your inbox and spam folder.
              </p>
              <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-[#0a0a0a]" style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)" }}>
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: "rgba(212,160,23,0.1)", border: "1px solid rgba(212,160,23,0.2)" }}>
                <Mail size={24} className="text-[#d4a017]"/>
              </div>
              <h1 className="text-white text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display',serif" }}>Forgot Password?</h1>
              <p className="text-white/45 text-sm mb-6">
                No worries! Enter your email address and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-white/55 text-xs font-semibold block mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"/>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#d4a017]/60 transition-all"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}/>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                  style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)", color: "#0a0a0a", opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? <span className="w-5 h-5 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin"/> : <><Send size={15}/> Send Reset Link</>}
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
