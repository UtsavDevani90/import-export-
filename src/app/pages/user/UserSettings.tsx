import { useState, useEffect } from "react";
import { Save, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { userProfileService, userAuthService } from "../../services/api";

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Angola","Argentina","Armenia","Australia","Austria",
  "Bangladesh","Belgium","Brazil","Canada","Chile","China","Colombia","Croatia","Czech Republic",
  "Denmark","Ecuador","Egypt","Ethiopia","Finland","France","Germany","Ghana","Greece",
  "India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Japan","Jordan","Kenya",
  "Kuwait","Lebanon","Libya","Malaysia","Mexico","Morocco","Myanmar","Nepal","Netherlands",
  "New Zealand","Nigeria","Norway","Oman","Pakistan","Peru","Philippines","Poland","Portugal",
  "Qatar","Romania","Russia","Saudi Arabia","Senegal","Singapore","South Africa","South Korea",
  "Spain","Sri Lanka","Sudan","Sweden","Switzerland","Syria","Taiwan","Tanzania","Thailand",
  "Tunisia","Turkey","UAE","Uganda","UK","Ukraine","USA","Uzbekistan","Venezuela","Vietnam",
  "Yemen","Zimbabwe",
];

export function UserSettings() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({ full_name: "", phone: "", company_name: "", country: "" });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [showPw, setShowPw] = useState({ cur: false, nw: false, cf: false });
  const [saving, setSaving]   = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [toast, setToast]   = useState<{ msg: string; type: "success"|"error" } | null>(null);

  useEffect(() => {
    if (user) {
      setProfile({
        full_name:    user.name || "",
        phone:        user.phone || "",
        company_name: user.company || "",
        country:      user.country || "",
      });
    }
  }, [user]);

  const showToast = (msg: string, type: "success"|"error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.full_name.trim() || profile.full_name.trim().length < 2) {
      showToast("Full name must be at least 2 characters", "error"); return;
    }
    setSaving(true);
    try {
      const res = await userProfileService.update(profile);
      const updated = res.data.data;
      if (setUser) setUser({ ...user!, name: updated.full_name, phone: updated.phone, company: updated.company_name, country: updated.country });
      showToast("Profile updated successfully", "success");
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to update profile", "error");
    }
    setSaving(false);
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.newPassword.length < 8) { showToast("Password must be at least 8 characters", "error"); return; }
    if (pw.newPassword !== pw.confirm) { showToast("Passwords do not match", "error"); return; }
    setChangingPw(true);
    try {
      await userAuthService.changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
      showToast("Password changed successfully", "success");
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to change password", "error");
    }
    setChangingPw(false);
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border:     "1px solid rgba(255,255,255,0.08)",
  };
  const inputClass = "w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all";

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium transition-all"
          style={{
            background: toast.type === "success" ? "rgba(52,211,153,0.15)" : "rgba(239,68,68,0.15)",
            border: `1px solid ${toast.type === "success" ? "rgba(52,211,153,0.3)" : "rgba(239,68,68,0.3)"}`,
            color: toast.type === "success" ? "#34d399" : "#ef4444",
          }}
        >
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div>
        <h2 className="text-white text-xl font-bold">Account Settings</h2>
        <p className="text-white/40 text-xs mt-0.5">Manage your profile and security settings</p>
      </div>

      {/* Profile */}
      <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h3 className="text-white font-semibold text-sm mb-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          Profile Information
        </h3>
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-white/50 text-xs font-semibold block mb-1.5">Full Name <span className="text-red-400">*</span></label>
              <input value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
                placeholder="Your full name" required className={inputClass} style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(212,160,23,0.5)"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"} />
            </div>
            <div>
              <label className="text-white/50 text-xs font-semibold block mb-1.5">Phone Number</label>
              <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                placeholder="+91 98765 43210" className={inputClass} style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(212,160,23,0.5)"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"} />
            </div>
            <div>
              <label className="text-white/50 text-xs font-semibold block mb-1.5">Company Name</label>
              <input value={profile.company_name} onChange={e => setProfile(p => ({ ...p, company_name: e.target.value }))}
                placeholder="Your company" className={inputClass} style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(212,160,23,0.5)"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"} />
            </div>
            <div>
              <label className="text-white/50 text-xs font-semibold block mb-1.5">Country</label>
              <select value={profile.country} onChange={e => setProfile(p => ({ ...p, country: e.target.value }))}
                className={inputClass} style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}>
                <option value="" style={{ background: "#0f0f0f" }}>Select country</option>
                {COUNTRIES.map(c => <option key={c} value={c} style={{ background: "#0f0f0f" }}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Read-only email */}
          <div>
            <label className="text-white/50 text-xs font-semibold block mb-1.5">Email Address</label>
            <input value={user?.email || ""} readOnly
              className={`${inputClass} cursor-not-allowed`} style={{ ...inputStyle, opacity: 0.6 }} />
            <p className="text-white/25 text-xs mt-1">Email cannot be changed. Contact support if needed.</p>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)", color: "#0a0a0a" }}>
              {saving ? <span className="w-4 h-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" /> : <Save size={14} />}
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* Password */}
      <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h3 className="text-white font-semibold text-sm mb-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          Change Password
        </h3>
        <form onSubmit={changePassword} className="space-y-4">
          {([
            { label: "Current Password",  key: "currentPassword", showKey: "cur" },
            { label: "New Password",       key: "newPassword",     showKey: "nw" },
            { label: "Confirm Password",   key: "confirm",         showKey: "cf" },
          ] as const).map(f => (
            <div key={f.key}>
              <label className="text-white/50 text-xs font-semibold block mb-1.5">{f.label}</label>
              <div className="relative">
                <input
                  type={(showPw as any)[f.showKey] ? "text" : "password"}
                  value={(pw as any)[f.key]}
                  onChange={e => setPw(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className={`${inputClass} pr-11`}
                  style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = "rgba(212,160,23,0.5)"}
                  onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
                />
                <button type="button" onClick={() => setShowPw(p => ({ ...p, [f.showKey]: !(p as any)[f.showKey] }))}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                  {(showPw as any)[f.showKey] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          ))}
          <p className="text-white/25 text-xs">Password must be at least 8 characters.</p>
          <div className="flex justify-end">
            <button type="submit" disabled={changingPw}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
              {changingPw ? <span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" /> : null}
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
