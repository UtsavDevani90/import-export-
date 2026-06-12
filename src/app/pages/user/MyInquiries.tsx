import { useState, useEffect } from "react";
import { MessageSquare, Plus, X, Send, Clock, CheckCircle, Eye, Filter } from "lucide-react";
import { userInquiryService } from "../../services/api";

const STATUS_OPTIONS = ["all","new","read","replied","closed"];
const statusColor: Record<string, { bg: string; text: string }> = {
  new:     { bg: "rgba(212,160,23,0.15)",   text: "#d4a017" },
  read:    { bg: "rgba(96,165,250,0.15)",   text: "#60a5fa" },
  replied: { bg: "rgba(52,211,153,0.15)",   text: "#34d399" },
  closed:  { bg: "rgba(156,163,175,0.12)",  text: "#9ca3af" },
  spam:    { bg: "rgba(239,68,68,0.15)",    text: "#ef4444" },
};

interface Inquiry { id: string; subject?: string; product?: string; message: string; status: string; created_at: string; admin_notes?: string; }

export function MyInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [status,    setStatus]    = useState("all");
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [selected,  setSelected]  = useState<Inquiry | null>(null);
  const [submitting,setSubmitting]= useState(false);
  const [form, setForm]           = useState({ subject: "", product: "", quantity: "", message: "" });
  const [formErr, setFormErr]     = useState("");

  const loadInquiries = async (p = page, s = status) => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page: p, limit: 10 };
      if (s !== "all") params.status = s;
      const res = await userInquiryService.getAll(params);
      setInquiries(res.data.data?.inquiries || []);
      setTotal(res.data.data?.total || 0);
    } catch { setInquiries([]); }
    setLoading(false);
  };

  useEffect(() => { loadInquiries(1, status); setPage(1); }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message.trim()) { setFormErr("Message is required"); return; }
    setSubmitting(true); setFormErr("");
    try {
      await userInquiryService.submit(form);
      setShowForm(false);
      setForm({ subject: "", product: "", quantity: "", message: "" });
      loadInquiries(1, status);
    } catch (err: any) {
      setFormErr(err?.response?.data?.message || "Failed to submit inquiry");
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-bold">My Inquiries</h2>
          <p className="text-white/40 text-xs mt-0.5">{total} total inquiry{total !== 1 ? "ies" : "y"}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)", color: "#0a0a0a" }}
        >
          <Plus size={15} /> New Inquiry
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map(s => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
            style={status === s
              ? { background: "rgba(212,160,23,0.15)", color: "#d4a017", border: "1px solid rgba(212,160,23,0.3)" }
              : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />)}
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-10 text-center">
            <MessageSquare size={36} className="text-white/15 mx-auto mb-3" />
            <p className="text-white/30 text-sm mb-2">No inquiries found</p>
            <button onClick={() => setShowForm(true)} className="text-[#d4a017] text-sm hover:underline">Submit your first inquiry →</button>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["Subject / Product", "Status", "Date", ""].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-white/30 text-xs font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                {inquiries.map(inq => (
                  <tr key={inq.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="text-white font-medium">{inq.subject || inq.product || "General Inquiry"}</div>
                      <div className="text-white/30 text-xs mt-0.5 truncate max-w-xs">{inq.message}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium capitalize"
                        style={{ background: statusColor[inq.status]?.bg || "rgba(255,255,255,0.08)", color: statusColor[inq.status]?.text || "white" }}>
                        {inq.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-white/40 text-xs whitespace-nowrap">
                      {new Date(inq.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => setSelected(inq)} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all">
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination */}
            {total > 10 && (
              <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="text-white/30 text-xs">Showing {Math.min(page * 10, total)} of {total}</span>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => { setPage(p => p - 1); loadInquiries(page - 1, status); }}
                    className="px-3 py-1.5 rounded-lg text-xs disabled:opacity-30 text-white/60 hover:bg-white/5">Prev</button>
                  <button disabled={page * 10 >= total} onClick={() => { setPage(p => p + 1); loadInquiries(page + 1, status); }}
                    className="px-3 py-1.5 rounded-lg text-xs disabled:opacity-30 text-white/60 hover:bg-white/5">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* New Inquiry Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl p-6" style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-base">New Inquiry</h3>
              <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>
            {formErr && <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-400 bg-red-500/10 border border-red-500/20">{formErr}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: "Subject", key: "subject", placeholder: "e.g. Bulk spice order inquiry" },
                { label: "Product of Interest", key: "product", placeholder: "e.g. Turmeric Powder" },
                { label: "Quantity", key: "quantity", placeholder: "e.g. 500 kg" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-white/50 text-xs font-semibold block mb-1.5">{f.label}</label>
                  <input
                    value={(form as any)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  />
                </div>
              ))}
              <div>
                <label className="text-white/50 text-xs font-semibold block mb-1.5">Message <span className="text-red-400">*</span></label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Describe your requirements in detail..."
                  rows={4}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none resize-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl text-sm text-white/50 hover:bg-white/5 transition-all border border-white/10">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)", color: "#0a0a0a" }}>
                  {submitting ? <span className="w-4 h-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" /> : <><Send size={14} /> Submit</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl p-6" style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-base">{selected.subject || selected.product || "Inquiry"}</h3>
              <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="text-white/60 text-xs font-semibold mb-2">Your Message</p>
                <p className="text-white/80 text-sm leading-relaxed">{selected.message}</p>
              </div>
              {selected.admin_notes && (
                <div className="p-4 rounded-xl" style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)" }}>
                  <p className="text-emerald-400 text-xs font-semibold mb-2">Admin Response</p>
                  <p className="text-white/80 text-sm leading-relaxed">{selected.admin_notes}</p>
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-white/30">
                <span>Submitted {new Date(selected.created_at).toLocaleDateString()}</span>
                <span className="capitalize px-2.5 py-1 rounded-full" style={{ background: statusColor[selected.status]?.bg, color: statusColor[selected.status]?.text }}>{selected.status}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
