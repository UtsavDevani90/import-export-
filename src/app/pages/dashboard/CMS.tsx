import { useState, useEffect } from "react";
import {
  Newspaper, Plus, Edit2, Trash2, X, Loader2, AlertCircle,
  ArrowUp, ArrowDown, Star, MessageSquare, HelpCircle, BarChart3,
  CheckCircle
} from "lucide-react";
import { cmsService } from "../../services/api";

// ── Types ──────────────────────────────────────────────────
interface Testimonial {
  _id: string;
  authorName: string;
  authorTitle?: string;
  company?: string;
  country?: string;
  quote: string;
  rating: number;
  avatarUrl?: string;
  sortOrder: number;
  isActive: boolean;
}

interface Faq {
  _id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

interface StatRow {
  key: string;
  label: string;
  value: string;
}

// ── FAQs Categories ─────────────────────────────────────────
const FAQ_CATEGORIES = ["General", "Products", "Shipping & Logistics", "Quality & Compliance", "Other"];

export function CMS() {
  const [activeTab, setActiveTab] = useState<"testimonials" | "faqs" | "stats">("testimonials");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Data states
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [stats, setStats] = useState<StatRow[]>([]);

  // Modals state
  const [tModalOpen, setTModalOpen] = useState(false);
  const [selectedT, setSelectedT] = useState<Testimonial | null>(null);
  const [tForm, setTForm] = useState({
    authorName: "",
    authorTitle: "",
    company: "",
    country: "",
    quote: "",
    rating: 5,
    isActive: true,
  });

  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<Faq | null>(null);
  const [faqForm, setFaqForm] = useState({
    question: "",
    answer: "",
    category: FAQ_CATEGORIES[0],
    isActive: true,
  });

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      if (activeTab === "testimonials") {
        const res = await cmsService.getTestimonials({ all: true });
        setTestimonials(res.data?.data || []);
      } else if (activeTab === "faqs") {
        const res = await cmsService.getFaqs({ all: true });
        setFaqs(res.data?.data || []);
      } else if (activeTab === "stats") {
        const res = await cmsService.getStats();
        setStats(res.data?.data?.rows || []);
      }
    } catch (err: any) {
      setError("Failed to fetch CMS content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Show Toast
  const triggerToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // ════════════════════════════════════════════════════════════
  //  TESTIMONIALS HANDLERS
  // ════════════════════════════════════════════════════════════
  const openTestimonialModal = (t: Testimonial | null = null) => {
    setSelectedT(t);
    if (t) {
      setTForm({
        authorName: t.authorName,
        authorTitle: t.authorTitle || "",
        company: t.company || "",
        country: t.country || "",
        quote: t.quote,
        rating: t.rating,
        isActive: t.isActive,
      });
    } else {
      setTForm({
        authorName: "",
        authorTitle: "",
        company: "",
        country: "",
        quote: "",
        rating: 5,
        isActive: true,
      });
    }
    setTModalOpen(true);
  };

  const handleTSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tForm.authorName.trim() || !tForm.quote.trim()) return;
    setSaving(true);
    try {
      if (selectedT) {
        await cmsService.updateTestimonial(selectedT._id, tForm);
        triggerToast("Testimonial updated successfully");
      } else {
        await cmsService.createTestimonial(tForm);
        triggerToast("Testimonial created successfully");
      }
      setTModalOpen(false);
      fetchData();
    } catch {
      setError("Failed to save testimonial.");
    } finally {
      setSaving(false);
    }
  };

  const handleTDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      await cmsService.deleteTestimonial(id);
      triggerToast("Testimonial deleted");
      fetchData();
    } catch {
      setError("Failed to delete testimonial.");
    }
  };

  const handleTMove = async (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= testimonials.length) return;

    const list = [...testimonials];
    const temp = list[index];
    list[index] = list[nextIndex];
    list[nextIndex] = temp;

    setTestimonials(list);
    try {
      const orderedIds = list.map(item => item._id);
      await cmsService.reorderTestimonials(orderedIds);
      triggerToast("Sort order updated");
    } catch {
      setError("Failed to save new order.");
      fetchData();
    }
  };

  // ════════════════════════════════════════════════════════════
  //  FAQ HANDLERS
  // ════════════════════════════════════════════════════════════
  const openFaqModal = (f: Faq | null = null) => {
    setSelectedFaq(f);
    if (f) {
      setFaqForm({
        question: f.question,
        answer: f.answer,
        category: f.category || FAQ_CATEGORIES[0],
        isActive: f.isActive,
      });
    } else {
      setFaqForm({
        question: "",
        answer: "",
        category: FAQ_CATEGORIES[0],
        isActive: true,
      });
    }
    setFaqModalOpen(true);
  };

  const handleFaqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqForm.question.trim() || !faqForm.answer.trim()) return;
    setSaving(true);
    try {
      if (selectedFaq) {
        await cmsService.updateFaq(selectedFaq._id, faqForm);
        triggerToast("FAQ updated successfully");
      } else {
        await cmsService.createFaq(faqForm);
        triggerToast("FAQ created successfully");
      }
      setFaqModalOpen(false);
      fetchData();
    } catch {
      setError("Failed to save FAQ.");
    } finally {
      setSaving(false);
    }
  };

  const handleFaqDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      await cmsService.deleteFaq(id);
      triggerToast("FAQ deleted");
      fetchData();
    } catch {
      setError("Failed to delete FAQ.");
    }
  };

  // ════════════════════════════════════════════════════════════
  //  STATS HANDLERS
  // ════════════════════════════════════════════════════════════
  const handleStatChange = (key: string, value: string) => {
    setStats(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  };

  const handleStatsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const updates = stats.map(s => ({ key: s.key, value: s.value }));
      await cmsService.updateStats({ updates });
      triggerToast("Homepage stats updated successfully");
    } catch {
      setError("Failed to update statistics.");
    } finally {
      setSaving(false);
    }
  };

  // Loading skeleton
  const Skeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl h-24 animate-pulse" style={{ background: "rgba(255,255,255,0.03)" }} />
      ))}
    </div>
  );

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-white text-2xl font-bold">Content Management</h2>
          <p className="text-white/40 text-sm mt-0.5">Manage testimonials, FAQs, and landing page metrics</p>
        </div>
        {activeTab !== "stats" && (
          <button
            onClick={() => activeTab === "testimonials" ? openTestimonialModal() : openFaqModal()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)", color: "#070707" }}
          >
            <Plus size={16} /> Add {activeTab === "testimonials" ? "Testimonial" : "FAQ"}
          </button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-xl p-4 flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle size={18} />
          <p>{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl shrink-0" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", alignSelf: "flex-start", width: "fit-content" }}>
        <button
          onClick={() => setActiveTab("testimonials")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "testimonials" ? "bg-white/10 text-white font-semibold" : "text-white/40 hover:text-white/60"
          }`}
        >
          <MessageSquare size={16} /> Testimonials
        </button>
        <button
          onClick={() => setActiveTab("faqs")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "faqs" ? "bg-white/10 text-white font-semibold" : "text-white/40 hover:text-white/60"
          }`}
        >
          <HelpCircle size={16} /> FAQs
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "stats" ? "bg-white/10 text-white font-semibold" : "text-white/40 hover:text-white/60"
          }`}
        >
          <BarChart3 size={16} /> Stats
        </button>
      </div>

      {/* Main Content Pane */}
      {loading ? (
        <Skeleton />
      ) : activeTab === "testimonials" ? (
        // TESTIMONIALS LIST
        <div className="space-y-4">
          {testimonials.length === 0 ? (
            <div className="rounded-2xl p-12 text-center text-white/30 text-sm" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.07)" }}>
              No testimonials created yet. Click "Add Testimonial" to begin.
            </div>
          ) : (
            testimonials.map((t, index) => (
              <div
                key={t._id}
                className="rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: t.isActive ? "1px solid rgba(255,255,255,0.07)" : "1px dashed rgba(255,255,255,0.04)",
                  opacity: t.isActive ? 1 : 0.65
                }}
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-white font-semibold text-base">{t.authorName}</span>
                    <span className="text-white/30 text-xs">— {t.authorTitle || "Buyer"}</span>
                    {t.company && <span className="text-[#d4a017] text-xs font-semibold px-2 py-0.5 rounded bg-[#d4a017]/10">{t.company}</span>}
                  </div>
                  <p className="text-white/70 italic text-sm font-serif">"{t.quote}"</p>
                  <div className="flex items-center gap-4 text-xs text-white/30">
                    <span className="flex items-center gap-0.5 text-[#d4a017]">
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <Star key={starIdx} size={12} fill={starIdx < t.rating ? "#d4a017" : "none"} strokeWidth={1.5} />
                      ))}
                    </span>
                    {t.country && <span>Country: {t.country}</span>}
                    <span>Status: {t.isActive ? "Active" : "Draft"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <div className="flex flex-col gap-1 mr-2">
                    <button
                      onClick={() => handleTMove(index, "up")}
                      disabled={index === 0}
                      className="p-1 rounded bg-white/5 text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-white/5 transition-all"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => handleTMove(index, "down")}
                      disabled={index === testimonials.length - 1}
                      className="p-1 rounded bg-white/5 text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-white/5 transition-all"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => openTestimonialModal(t)}
                    className="p-2 rounded-xl text-white/50 hover:text-[#d4a017] hover:bg-[#d4a017]/10 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleTDelete(t._id)}
                    className="p-2 rounded-xl text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : activeTab === "faqs" ? (
        // FAQS LIST
        <div className="space-y-4">
          {faqs.length === 0 ? (
            <div className="rounded-2xl p-12 text-center text-white/30 text-sm" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.07)" }}>
              No FAQs created yet. Click "Add FAQ" to begin.
            </div>
          ) : (
            faqs.map((f) => (
              <div
                key={f._id}
                className="rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: f.isActive ? "1px solid rgba(255,255,255,0.07)" : "1px dashed rgba(255,255,255,0.04)",
                  opacity: f.isActive ? 1 : 0.65
                }}
              >
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#d4a017] text-xs font-semibold px-2 py-0.5 rounded bg-[#d4a017]/10">{f.category}</span>
                    <span className="text-white/30 text-xs">Status: {f.isActive ? "Active" : "Hidden"}</span>
                  </div>
                  <h4 className="text-white font-semibold text-sm">{f.question}</h4>
                  <p className="text-white/60 text-sm leading-relaxed">{f.answer}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => openFaqModal(f)}
                    className="p-2 rounded-xl text-white/50 hover:text-[#d4a017] hover:bg-[#d4a017]/10 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleFaqDelete(f._id)}
                    className="p-2 rounded-xl text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        // STATS EDIT FORM
        <form onSubmit={handleStatsSubmit} className="max-w-xl space-y-6">
          <div className="rounded-2xl p-5 space-y-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {stats.map((row) => (
              <div key={row.key} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <label className="text-white/60 font-medium text-sm">{row.label}</label>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    value={row.value}
                    onChange={(e) => handleStatChange(row.key, e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none border focus:border-[#d4a017] transition-all bg-white/[0.02]"
                    style={{ borderColor: "rgba(255,255,255,0.08)" }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-95 disabled:opacity-55 transition-all text-[#070707]"
            style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)" }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
          </button>
        </form>
      )}

      {/* TESTIMONIAL MODAL */}
      {tModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setTModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl p-6 overflow-y-auto max-h-[90vh] shadow-2xl border" style={{ background: "#0a0a0a", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg">{selectedT ? "Edit Testimonial" : "Add Testimonial"}</h3>
              <button onClick={() => setTModalOpen(false)} className="text-white/40 hover:text-white transition-colors"><X size={18} /></button>
            </div>

            <form onSubmit={handleTSubmit} className="space-y-4">
              <div>
                <label className="block text-white/50 text-xs font-medium mb-1.5">Author Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={tForm.authorName}
                  onChange={(e) => setTForm({ ...tForm, authorName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none border focus:border-[#d4a017] bg-white/[0.02]"
                  style={{ borderColor: "rgba(255,255,255,0.08)" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/50 text-xs font-medium mb-1.5">Author Title / Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Purchasing Manager"
                    value={tForm.authorTitle}
                    onChange={(e) => setTForm({ ...tForm, authorTitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none border focus:border-[#d4a017] bg-white/[0.02]"
                    style={{ borderColor: "rgba(255,255,255,0.08)" }}
                  />
                </div>
                <div>
                  <label className="block text-white/50 text-xs font-medium mb-1.5">Company</label>
                  <input
                    type="text"
                    placeholder="e.g. Spice Imports Inc."
                    value={tForm.company}
                    onChange={(e) => setTForm({ ...tForm, company: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none border focus:border-[#d4a017] bg-white/[0.02]"
                    style={{ borderColor: "rgba(255,255,255,0.08)" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/50 text-xs font-medium mb-1.5">Country</label>
                  <input
                    type="text"
                    placeholder="e.g. Germany"
                    value={tForm.country}
                    onChange={(e) => setTForm({ ...tForm, country: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none border focus:border-[#d4a017] bg-white/[0.02]"
                    style={{ borderColor: "rgba(255,255,255,0.08)" }}
                  />
                </div>
                <div>
                  <label className="block text-white/50 text-xs font-medium mb-1.5">Rating</label>
                  <select
                    value={tForm.rating}
                    onChange={(e) => setTForm({ ...tForm, rating: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none border focus:border-[#d4a017] bg-white/[0.02]"
                    style={{ borderColor: "rgba(255,255,255,0.08)" }}
                  >
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n} className="bg-[#0a0a0a] text-white">{n} Stars</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white/50 text-xs font-medium mb-1.5">Quote / Review</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Review text..."
                  value={tForm.quote}
                  onChange={(e) => setTForm({ ...tForm, quote: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none border focus:border-[#d4a017] bg-white/[0.02] resize-none"
                  style={{ borderColor: "rgba(255,255,255,0.08)" }}
                />
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={tForm.isActive}
                  onChange={(e) => setTForm({ ...tForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-[#d4a017] border-white/10 bg-white/5 focus:ring-[#d4a017]"
                />
                <label htmlFor="isActive" className="text-white text-sm font-medium select-none">Publish Immediately</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setTModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all text-[#070707]"
                  style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)" }}
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {selectedT ? "Save Updates" : "Create Testimonial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ MODAL */}
      {faqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setFaqModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl p-6 overflow-y-auto max-h-[90vh] shadow-2xl border" style={{ background: "#0a0a0a", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg">{selectedFaq ? "Edit FAQ" : "Add FAQ"}</h3>
              <button onClick={() => setFaqModalOpen(false)} className="text-white/40 hover:text-white transition-colors"><X size={18} /></button>
            </div>

            <form onSubmit={handleFaqSubmit} className="space-y-4">
              <div>
                <label className="block text-white/50 text-xs font-medium mb-1.5">Category</label>
                <select
                  value={faqForm.category}
                  onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none border focus:border-[#d4a017] bg-white/[0.02]"
                  style={{ borderColor: "rgba(255,255,255,0.08)" }}
                >
                  {FAQ_CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-[#0a0a0a] text-white">{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-white/50 text-xs font-medium mb-1.5">Question</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Do you provide quality certifications?"
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none border focus:border-[#d4a017] bg-white/[0.02]"
                  style={{ borderColor: "rgba(255,255,255,0.08)" }}
                />
              </div>

              <div>
                <label className="block text-white/50 text-xs font-medium mb-1.5">Answer</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide a detailed answer..."
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none border focus:border-[#d4a017] bg-white/[0.02] resize-none"
                  style={{ borderColor: "rgba(255,255,255,0.08)" }}
                />
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="faqActive"
                  checked={faqForm.isActive}
                  onChange={(e) => setFaqForm({ ...faqForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-[#d4a017] border-white/10 bg-white/5 focus:ring-[#d4a017]"
                />
                <label htmlFor="faqActive" className="text-white text-sm font-medium select-none">Publish Immediately</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setFaqModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all text-[#070707]"
                  style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)" }}
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {selectedFaq ? "Save Updates" : "Create FAQ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
