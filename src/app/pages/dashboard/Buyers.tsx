import { useState, useEffect } from "react";
import {
  Search, Plus, Edit2, Trash2, X, Loader2,
  AlertCircle, Users, ChevronDown, ChevronUp,
  MessageSquare, FileText
} from "lucide-react";
import { buyerService } from "../../services/api";

// ── Types ──────────────────────────────────────────────────
interface Buyer {
  _id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  country?: string;
  notes?: string;
  createdAt: string;
  inquiries?: unknown[];
  quotations?: unknown[];
}

// ── Helpers ────────────────────────────────────────────────
function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    new: { bg: "rgba(34,197,94,0.15)", color: "#22c55e" },
    contacted: { bg: "rgba(59,130,246,0.15)", color: "#3b82f6" },
    quoted: { bg: "rgba(212,160,23,0.15)", color: "#d4a017" },
    closed: { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" },
    draft: { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" },
    sent: { bg: "rgba(59,130,246,0.15)", color: "#3b82f6" },
    accepted: { bg: "rgba(34,197,94,0.15)", color: "#22c55e" },
    rejected: { bg: "rgba(239,68,68,0.15)", color: "#ef4444" },
  };
  const s = map[status?.toLowerCase()] || { bg: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" };
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
      style={{ background: s.bg, color: s.color }}>{status}</span>
  );
}

// ── Buyer Drawer ───────────────────────────────────────────
function BuyerDrawer({
  buyerId, onClose, onEdit, onDelete,
}: {
  buyerId: string; onClose: () => void;
  onEdit: (b: Buyer) => void; onDelete: (b: Buyer) => void;
}) {
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"details" | "inquiries" | "quotations">("details");

  useEffect(() => {
    buyerService.getById(buyerId)
      .then(r => setBuyer(r.data?.data || r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [buyerId]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md flex flex-col h-full"
        style={{ background: "#0a0a0a", borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="px-6 py-4 flex items-center justify-between shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <h2 className="text-white font-bold text-base">{buyer?.name || "Buyer Details"}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-[#d4a017]" />
          </div>
        ) : !buyer ? (
          <div className="flex-1 flex items-center justify-center text-white/30 text-sm">Failed to load buyer</div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Header info */}
            <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-[#0a0a0a]"
                  style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)" }}>
                  {buyer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-base">{buyer.name}</h3>
                  <p className="text-white/40 text-sm">{buyer.company || "Individual Buyer"}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onEdit(buyer)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                  style={{ background: "rgba(212,160,23,0.12)", color: "#d4a017", border: "1px solid rgba(212,160,23,0.2)" }}>
                  <Edit2 size={12} /> Edit
                </button>
                <button onClick={() => onDelete(buyer)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                  style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-4 flex gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {(["details", "inquiries", "quotations"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="px-3 py-1.5 text-xs font-medium capitalize rounded-t-lg transition-all mb-0"
                  style={tab === t
                    ? { color: "#d4a017", borderBottom: "2px solid #d4a017" }
                    : { color: "rgba(255,255,255,0.35)" }}>
                  {t}
                </button>
              ))}
            </div>

            <div className="px-6 py-4">
              {tab === "details" && (
                <div className="space-y-3">
                  {[
                    ["Email", buyer.email],
                    ["Phone", buyer.phone],
                    ["Country", buyer.country],
                    ["Registered", formatDate(buyer.createdAt)],
                  ].map(([label, val]) => val ? (
                    <div key={label}>
                      <p className="text-white/30 text-xs mb-0.5">{label}</p>
                      <p className="text-white/80 text-sm">{val}</p>
                    </div>
                  ) : null)}
                  {buyer.notes && (
                    <div>
                      <p className="text-white/30 text-xs mb-0.5">Notes</p>
                      <p className="text-white/70 text-sm leading-relaxed p-3 rounded-xl"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        {buyer.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {tab === "inquiries" && (
                <div className="space-y-2">
                  {(buyer.inquiries || []).length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-white/25 gap-2">
                      <MessageSquare size={24} />
                      <p className="text-sm">No inquiries from this buyer</p>
                    </div>
                  ) : (
                    (buyer.inquiries as { _id: string; product?: string; status: string; createdAt: string }[] || []).map(inq => (
                      <div key={inq._id} className="rounded-xl p-3 flex items-center justify-between"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div>
                          <p className="text-white/80 text-sm">{inq.product || "General Inquiry"}</p>
                          <p className="text-white/30 text-xs mt-0.5">{formatDate(inq.createdAt)}</p>
                        </div>
                        <StatusBadge status={inq.status} />
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === "quotations" && (
                <div className="space-y-2">
                  {(buyer.quotations || []).length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-white/25 gap-2">
                      <FileText size={24} />
                      <p className="text-sm">No quotations for this buyer</p>
                    </div>
                  ) : (
                    (buyer.quotations as { _id: string; quoteNumber?: string; status: string; total?: number; createdAt: string }[] || []).map(q => (
                      <div key={q._id} className="rounded-xl p-3 flex items-center justify-between"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div>
                          <p className="text-white/80 text-sm font-mono text-xs">
                            #{q.quoteNumber || q._id.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-white/30 text-xs mt-0.5">{formatDate(q.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          {q.total !== undefined && (
                            <p className="text-white/70 text-sm">${Number(q.total).toLocaleString()}</p>
                          )}
                          <StatusBadge status={q.status} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Buyer Form Modal ───────────────────────────────────────
function BuyerModal({
  buyer, onClose, onSaved,
}: {
  buyer: Buyer | null; onClose: () => void; onSaved: () => void;
}) {
  const isEdit = !!buyer;
  const [form, setForm] = useState({
    name: buyer?.name || "",
    company: buyer?.company || "",
    email: buyer?.email || "",
    phone: buyer?.phone || "",
    country: buyer?.country || "",
    notes: buyer?.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    setApiError("");
    try {
      if (isEdit) await buyerService.update(buyer!._id, form);
      else await buyerService.create(form);
      onSaved();
      onClose();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setApiError(err.response?.data?.message || "Failed to save buyer");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/25 outline-none";
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" };
  const errStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(239,68,68,0.4)" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <h2 className="text-white font-bold text-base">{isEdit ? "Edit Buyer" : "Add Buyer"}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
          {apiError && (
            <div className="flex items-center gap-2 text-red-400 text-sm p-3 rounded-xl"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle size={14} /> {apiError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/50 text-xs font-medium mb-1.5">Name *</label>
              <input value={form.name} onChange={e => set("name", e.target.value)}
                placeholder="Full name" className={inputCls} style={errors.name ? errStyle : inputStyle} />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-white/50 text-xs font-medium mb-1.5">Company</label>
              <input value={form.company} onChange={e => set("company", e.target.value)}
                placeholder="Company name" className={inputCls} style={inputStyle} />
            </div>
          </div>
          <div>
            <label className="block text-white/50 text-xs font-medium mb-1.5">Email</label>
            <input value={form.email} onChange={e => set("email", e.target.value)}
              placeholder="email@company.com" className={inputCls} style={errors.email ? errStyle : inputStyle} />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/50 text-xs font-medium mb-1.5">Phone</label>
              <input value={form.phone} onChange={e => set("phone", e.target.value)}
                placeholder="+1 234 567 8900" className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="block text-white/50 text-xs font-medium mb-1.5">Country</label>
              <input value={form.country} onChange={e => set("country", e.target.value)}
                placeholder="Country" className={inputCls} style={inputStyle} />
            </div>
          </div>
          <div>
            <label className="block text-white/50 text-xs font-medium mb-1.5">Notes</label>
            <textarea rows={3} value={form.notes} onChange={e => set("notes", e.target.value)}
              placeholder="Internal notes about this buyer…"
              className={`${inputCls} resize-none`} style={inputStyle} />
          </div>
        </div>
        <div className="px-6 py-4 flex justify-end gap-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)", color: "#0a0a0a" }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Users size={14} />}
            {isEdit ? "Update" : "Add"} Buyer
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm ─────────────────────────────────────────
function DeleteConfirm({ name, onConfirm, onCancel }: { name: string; onConfirm: () => Promise<void>; onCancel: () => void }) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative rounded-2xl p-6 w-full max-w-sm text-center"
        style={{ background: "#0a0a0a", border: "1px solid rgba(239,68,68,0.25)" }}>
        <Trash2 size={32} className="mx-auto mb-3" style={{ color: "#ef4444" }} />
        <h3 className="text-white font-bold text-base mb-1">Delete Buyer?</h3>
        <p className="text-white/45 text-sm mb-5">
          Delete <strong className="text-white/70">{name}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all">
            Cancel
          </button>
          <button
            onClick={async () => { setLoading(true); await onConfirm(); setLoading(false); }}
            disabled={loading}
            className="px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
            style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────
export function Buyers() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [countries, setCountries] = useState<string[]>([]);
  const [drawerBuyerId, setDrawerBuyerId] = useState<string | null>(null);
  const [modalBuyer, setModalBuyer] = useState<Buyer | null | "new">(null);
  const [deleteTarget, setDeleteTarget] = useState<Buyer | null>(null);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const fetchBuyers = () => {
    setLoading(true);
    const params: Record<string, unknown> = {};
    if (search) params.search = search;
    if (countryFilter) params.country = countryFilter;
    buyerService.getAll(params)
      .then(r => {
        const data = r.data?.data?.buyers || r.data?.data || r.data || [];
        setBuyers(Array.isArray(data) ? data : []);
        const allCountries = Array.from(new Set(data.map((b: Buyer) => b.country).filter(Boolean))) as string[];
        setCountries(allCountries);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  };

  useEffect(() => { fetchBuyers(); }, [search, countryFilter]);

  const sortedBuyers = [...buyers].sort((a, b) => {
    const av = (a as Record<string, unknown>)[sortField] as string || "";
    const bv = (b as Record<string, unknown>)[sortField] as string || "";
    return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }: { field: string }) => (
    sortField === field
      ? sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
      : <ChevronDown size={12} className="opacity-25" />
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await buyerService.delete(deleteTarget._id);
    setDeleteTarget(null);
    setDrawerBuyerId(null);
    fetchBuyers();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-white text-2xl font-bold">Buyers</h2>
          <p className="text-white/35 text-sm mt-0.5">{buyers.length} registered buyers</p>
        </div>
        <button onClick={() => setModalBuyer("new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)", color: "#0a0a0a" }}>
          <Plus size={16} /> Add Buyer
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, company…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25 outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
        </div>
        {countries.length > 0 && (
          <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <option value="">All Countries</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm p-4 rounded-xl"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle size={16} /> Failed to load buyers.
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {[
                  { label: "Name", field: "name" },
                  { label: "Company", field: "company" },
                  { label: "Country", field: "country" },
                  { label: "Email", field: "email" },
                  { label: "Phone", field: null },
                  { label: "Registered", field: "createdAt" },
                ].map(col => (
                  <th key={col.label}
                    className={`px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider ${col.field ? "cursor-pointer hover:text-white/60 select-none" : ""}`}
                    style={{ color: "rgba(255,255,255,0.3)" }}
                    onClick={() => col.field && toggleSort(col.field)}>
                    <span className="flex items-center gap-1">
                      {col.label} {col.field && <SortIcon field={col.field} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded animate-pulse"
                          style={{ background: "rgba(255,255,255,0.06)", width: "70%" }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sortedBuyers.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-white/25">
                    <Users size={32} />
                    <p className="text-sm">No buyers found</p>
                  </div>
                </td></tr>
              ) : (
                sortedBuyers.map(b => (
                  <tr key={b._id} onClick={() => setDrawerBuyerId(b._id)}
                    className="cursor-pointer hover:bg-white/[0.025] transition-colors"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-[#0a0a0a] shrink-0"
                          style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)" }}>
                          {b.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{b.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-white/55">{b.company || "—"}</td>
                    <td className="px-5 py-3.5 text-white/55">{b.country || "—"}</td>
                    <td className="px-5 py-3.5 text-white/55">{b.email || "—"}</td>
                    <td className="px-5 py-3.5 text-white/55">{b.phone || "—"}</td>
                    <td className="px-5 py-3.5 text-white/35 text-xs">{formatDate(b.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      {drawerBuyerId && (
        <BuyerDrawer
          buyerId={drawerBuyerId}
          onClose={() => setDrawerBuyerId(null)}
          onEdit={b => { setDrawerBuyerId(null); setModalBuyer(b); }}
          onDelete={b => { setDrawerBuyerId(null); setDeleteTarget(b); }}
        />
      )}

      {/* Modal */}
      {modalBuyer !== null && (
        <BuyerModal
          buyer={modalBuyer === "new" ? null : modalBuyer}
          onClose={() => setModalBuyer(null)}
          onSaved={fetchBuyers}
        />
      )}

      {/* Delete */}
      {deleteTarget && (
        <DeleteConfirm
          name={deleteTarget.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
