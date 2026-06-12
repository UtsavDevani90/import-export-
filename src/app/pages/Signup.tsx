import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, UserPlus, ArrowRight, Mail, Lock, User, Building2, Globe } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const SPICE_BG = "https://images.unsplash.com/photo-1775433205046-86e060feff06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80";

function PasswordStrength({ password }: { password: string }) {
  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(password)).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ef4444", "#f59e0b", "#22c55e", "#16a34a"];
  if (!password) return null;
  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-500" style={{ background: i <= score ? colors[score] : "rgba(255,255,255,0.1)" }}/>
        ))}
      </div>
      <span className="text-xs" style={{ color: colors[score] }}>{labels[score]}</span>
    </div>
  );
}

export function Signup() {
  const [form, setForm] = useState({ name:"", company:"", email:"", country:"", password:"", confirm:"" });
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { userRegister } = useAuth();
  const navigate = useNavigate();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (!agreed) { setError("Please accept the terms and conditions."); return; }
    setLoading(true); setError("");
    const { ok, error: msg } = await userRegister({
      full_name:    form.name,
      email:        form.email,
      password:     form.password,
      company_name: form.company || undefined,
      country:      form.country || undefined,
    });
    if (ok) navigate("/user/dashboard");
    else { setError(msg || "Registration failed. Please try again."); setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ background:"#080808" }}>
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden">
        <img src={SPICE_BG} alt="Spices" className="w-full h-full object-cover"/>
        <div className="absolute inset-0" style={{ background:"linear-gradient(135deg,rgba(8,8,8,0.75) 0%,rgba(8,8,8,0.35) 100%)" }}/>
        <div className="absolute inset-0 flex flex-col justify-center p-12">
          <div className="inline-flex items-center gap-2 bg-[#d4a017]/20 border border-[#d4a017]/30 text-[#d4a017] text-xs px-3 py-1.5 rounded-full mb-6 w-fit">
            <span className="w-2 h-2 rounded-full bg-[#d4a017] animate-pulse"/> Join 500+ Global Buyers
          </div>
          <h2 className="text-white text-3xl font-bold mb-4" style={{ fontFamily:"'Playfair Display',serif" }}>Start Your<br/><span className="text-[#d4a017]">B2B Partnership</span></h2>
          {["Free account setup", "Access exclusive export pricing", "Direct inquiry system", "Certificate downloads", "Priority email support"].map(item => (
            <div key={item} className="flex items-center gap-2 text-white/60 text-sm mb-2">
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-[#0a0a0a]" style={{ background:"linear-gradient(135deg,#d4a017,#b8860b)" }}>✓</span>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Right – Form */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <Link to="/" className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[#0a0a0a] font-bold" style={{ background:"linear-gradient(135deg,#d4a017,#b8860b)" }}>T</div>
            <div>
              <div className="text-white font-bold text-sm" style={{ letterSpacing:"0.12em" }}>TANZORA</div>
              <div className="text-[#d4a017] text-[8px]" style={{ letterSpacing:"0.3em" }}>EXPORT CO.</div>
            </div>
          </Link>

          <h1 className="text-white text-2xl font-bold mb-1" style={{ fontFamily:"'Playfair Display',serif" }}>Create Account</h1>
          <p className="text-white/40 text-sm mb-6">Join the Tanzora Export B2B platform</p>

          {error && <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-400 border border-red-500/30 bg-red-500/10">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Name + Company */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/55 text-xs font-semibold block mb-1">Full Name *</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"/>
                  <input type="text" required value={form.name} onChange={set("name")} placeholder="Your name"
                    className="w-full pl-9 pr-3 py-3 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#d4a017]/60 transition-all"
                    style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)" }}/>
                </div>
              </div>
              <div>
                <label className="text-white/55 text-xs font-semibold block mb-1">Company *</label>
                <div className="relative">
                  <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"/>
                  <input type="text" required value={form.company} onChange={set("company")} placeholder="Company name"
                    className="w-full pl-9 pr-3 py-3 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#d4a017]/60 transition-all"
                    style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)" }}/>
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-white/55 text-xs font-semibold block mb-1">Email Address *</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"/>
                <input type="email" required value={form.email} onChange={set("email")} placeholder="you@company.com"
                  className="w-full pl-9 pr-3 py-3 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#d4a017]/60 transition-all"
                  style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)" }}/>
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="text-white/55 text-xs font-semibold block mb-1">Country *</label>
              <div className="relative">
                <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"/>
                <input type="text" required value={form.country} onChange={set("country")} placeholder="Your country"
                  className="w-full pl-9 pr-3 py-3 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#d4a017]/60 transition-all"
                  style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)" }}/>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-white/55 text-xs font-semibold block mb-1">Password *</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"/>
                <input type={showPw ? "text" : "password"} required value={form.password} onChange={set("password")} placeholder="Min 8 characters"
                  className="w-full pl-9 pr-10 py-3 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#d4a017]/60 transition-all"
                  style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)" }}/>
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                  {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
              <PasswordStrength password={form.password}/>
            </div>

            {/* Confirm */}
            <div>
              <label className="text-white/55 text-xs font-semibold block mb-1">Confirm Password *</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"/>
                <input type={showPw ? "text" : "password"} required value={form.confirm} onChange={set("confirm")} placeholder="Repeat password"
                  className="w-full pl-9 pr-3 py-3 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#d4a017]/60 transition-all"
                  style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)" }}/>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2 pt-1">
              <input type="checkbox" id="terms" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="w-4 h-4 mt-0.5 accent-[#d4a017]"/>
              <label htmlFor="terms" className="text-white/45 text-xs leading-relaxed">
                I agree to the <a href="#" className="text-[#d4a017] hover:underline">Terms of Service</a> and <a href="#" className="text-[#d4a017] hover:underline">Privacy Policy</a>
              </label>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
              style={{ background:"linear-gradient(135deg,#d4a017,#b8860b)", color:"#0a0a0a", boxShadow:"0 4px 20px rgba(212,160,23,0.3)", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? <span className="w-5 h-5 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin"/> : <><UserPlus size={16}/> Create Account</>}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-[#d4a017] hover:underline font-medium">Sign In <ArrowRight size={13} className="inline"/></Link>
          </p>
        </div>
      </div>
    </div>
  );
}
