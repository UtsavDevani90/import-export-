import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save, Loader2, AlertCircle, CheckCircle, HelpCircle } from "lucide-react";
import { settingsService } from "../../services/api";

interface Setting {
  key: string;
  value: string;
  label: string;
  group_name: string;
}

export function Settings() {
  const [loading, setLoading] = useState(true);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Local form states
  const [generalForm, setGeneralForm] = useState({
    company_name: "",
    company_description: "",
    company_email: "",
    company_phone: "",
    company_address: "",
    company_whatsapp: "",
  });

  const [socialForm, setSocialForm] = useState({
    social_facebook: "",
    social_instagram: "",
    social_linkedin: "",
    social_twitter: "",
    social_youtube: "",
  });

  // Fetch settings
  const fetchSettings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await settingsService.getAll();
      const settingsList: Setting[] = res.data?.data?.settings || [];
      
      const genUpdates = { ...generalForm };
      const socUpdates = { ...socialForm };

      settingsList.forEach(s => {
        if (s.group_name === "general" && s.key in genUpdates) {
          genUpdates[s.key as keyof typeof generalForm] = s.value || "";
        } else if (s.group_name === "social" && s.key in socUpdates) {
          socUpdates[s.key as keyof typeof socialForm] = s.value || "";
        }
      });

      setGeneralForm(genUpdates);
      setSocialForm(socUpdates);
    } catch (err) {
      setError("Failed to load settings. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGeneral(true);
    setError("");
    try {
      const updates = Object.entries(generalForm).map(([key, value]) => ({ key, value }));
      await settingsService.update({ updates });
      triggerSuccess("Company profile updated successfully");
    } catch {
      setError("Failed to save company profile.");
    } finally {
      setSavingGeneral(false);
    }
  };

  const handleSocialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSocial(true);
    setError("");
    try {
      const updates = Object.entries(socialForm).map(([key, value]) => ({ key, value }));
      await settingsService.update({ updates });
      triggerSuccess("Social media links updated successfully");
    } catch {
      setError("Failed to save social links.");
    } finally {
      setSavingSocial(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-white text-2xl font-bold">Settings</h2>
          <p className="text-white/40 text-sm mt-0.5">Manage configuration and links</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-6 h-96 animate-pulse" style={{ background: "rgba(255,255,255,0.03)" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successMsg && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-[#22c55e] text-[#070707] font-semibold px-4 py-3 rounded-xl shadow-lg transition-transform duration-300">
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-white text-2xl font-bold font-sans">Settings</h2>
        <p className="text-white/40 text-sm mt-0.5">Manage business profile and social connections</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-xl p-4 flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle size={18} />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* COMPANY PROFILE */}
        <form onSubmit={handleGeneralSubmit} className="rounded-2xl p-6 space-y-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <h3 className="text-white font-bold text-base flex items-center gap-2">Company Profile</h3>
            <p className="text-white/30 text-xs mt-1">Official contact information displayed on the website</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-white/50 text-xs font-medium mb-1.5">Company Name</label>
              <input
                type="text"
                required
                value={generalForm.company_name}
                onChange={(e) => setGeneralForm({ ...generalForm, company_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none border focus:border-[#d4a017] transition-all bg-white/[0.02]"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              />
            </div>

            <div>
              <label className="block text-white/50 text-xs font-medium mb-1.5">Company Description</label>
              <textarea
                required
                rows={3}
                value={generalForm.company_description}
                onChange={(e) => setGeneralForm({ ...generalForm, company_description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none border focus:border-[#d4a017] transition-all bg-white/[0.02] resize-none"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/50 text-xs font-medium mb-1.5">Official Email</label>
                <input
                  type="email"
                  required
                  value={generalForm.company_email}
                  onChange={(e) => setGeneralForm({ ...generalForm, company_email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none border focus:border-[#d4a017] transition-all bg-white/[0.02]"
                  style={{ borderColor: "rgba(255,255,255,0.08)" }}
                />
              </div>
              <div>
                <label className="block text-white/50 text-xs font-medium mb-1.5">Phone Number</label>
                <input
                  type="text"
                  required
                  value={generalForm.company_phone}
                  onChange={(e) => setGeneralForm({ ...generalForm, company_phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none border focus:border-[#d4a017] transition-all bg-white/[0.02]"
                  style={{ borderColor: "rgba(255,255,255,0.08)" }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/50 text-xs font-medium mb-1.5">WhatsApp Number</label>
                <input
                  type="text"
                  required
                  value={generalForm.company_whatsapp}
                  onChange={(e) => setGeneralForm({ ...generalForm, company_whatsapp: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none border focus:border-[#d4a017] transition-all bg-white/[0.02]"
                  style={{ borderColor: "rgba(255,255,255,0.08)" }}
                />
              </div>
              <div>
                <label className="block text-white/50 text-xs font-medium mb-1.5">Address / Headquarters</label>
                <input
                  type="text"
                  required
                  value={generalForm.company_address}
                  onChange={(e) => setGeneralForm({ ...generalForm, company_address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none border focus:border-[#d4a017] transition-all bg-white/[0.02]"
                  style={{ borderColor: "rgba(255,255,255,0.08)" }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingGeneral}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-95 disabled:opacity-55 transition-all text-[#070707]"
              style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)" }}
            >
              {savingGeneral ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Profile
            </button>
          </div>
        </form>

        {/* SOCIAL LINKS */}
        <form onSubmit={handleSocialSubmit} className="rounded-2xl p-6 space-y-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <h3 className="text-white font-bold text-base flex items-center gap-2">Social Media Links</h3>
            <p className="text-white/30 text-xs mt-1">Connect your brand across platforms</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-white/50 text-xs font-medium mb-1.5">LinkedIn Profile URL</label>
              <input
                type="url"
                placeholder="https://linkedin.com/company/..."
                value={socialForm.social_linkedin}
                onChange={(e) => setSocialForm({ ...socialForm, social_linkedin: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none border focus:border-[#d4a017] transition-all bg-white/[0.02]"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              />
            </div>

            <div>
              <label className="block text-white/50 text-xs font-medium mb-1.5">Instagram Page URL</label>
              <input
                type="url"
                placeholder="https://instagram.com/..."
                value={socialForm.social_instagram}
                onChange={(e) => setSocialForm({ ...socialForm, social_instagram: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none border focus:border-[#d4a017] transition-all bg-white/[0.02]"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              />
            </div>

            <div>
              <label className="block text-white/50 text-xs font-medium mb-1.5">Facebook Page URL</label>
              <input
                type="url"
                placeholder="https://facebook.com/..."
                value={socialForm.social_facebook}
                onChange={(e) => setSocialForm({ ...socialForm, social_facebook: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none border focus:border-[#d4a017] transition-all bg-white/[0.02]"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              />
            </div>

            <div>
              <label className="block text-white/50 text-xs font-medium mb-1.5">Twitter/X Profile URL</label>
              <input
                type="url"
                placeholder="https://x.com/..."
                value={socialForm.social_twitter}
                onChange={(e) => setSocialForm({ ...socialForm, social_twitter: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none border focus:border-[#d4a017] transition-all bg-white/[0.02]"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              />
            </div>

            <div>
              <label className="block text-white/50 text-xs font-medium mb-1.5">YouTube Channel URL</label>
              <input
                type="url"
                placeholder="https://youtube.com/c/..."
                value={socialForm.social_youtube}
                onChange={(e) => setSocialForm({ ...socialForm, social_youtube: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none border focus:border-[#d4a017] transition-all bg-white/[0.02]"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingSocial}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-95 disabled:opacity-55 transition-all text-[#070707]"
              style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)" }}
            >
              {savingSocial ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Social Links
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
