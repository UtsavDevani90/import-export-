import { useState, useEffect } from "react";
import {
  Plus, X, Loader2, AlertCircle, FileText, Trash2,
  Download, ChevronLeft, ChevronRight, ChevronDown,
  Search as SearchIcon
} from "lucide-react";
import { quotationService, buyerService } from "../../services/api";

// ── Types ──────────────────────────────────────────────────
interface LineItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface Quotation {
  _id: string;
  quoteNumber?: string;
  buyerId?: string;
  buyerName?: string;
  buyerCompany?: string;
  buyerEmail?: string;
  status: string;
  total?: number;
  currency?: string;
  validUntil?: string;
  notes?: string;
  items?: LineItem[];
  createdAt: string;
}

interface Buyer {
  _id: string;
  name: string;
  company?: string;
  email?: string;
}

// ── Helpers ────────────────────────────────────────────────
function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    draft:    { bg: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" },
    sent:     { bg: "rgba(59,130,246,0.15)",  color: "#3b82f6" },
    accepted: { bg: "rgba(34,197,94,0.15)",   color: "#22c55e" },
    rejected: { bg: "rgba(239,68,68,0.15)",   color: "#ef4444" },
  };
  const s = map[status?.toLowerCase()] || { bg: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" };
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
      style={{ background: s.bg, color: s.color }}>{status || "—"}</span>
  );
}

// ── Create/Edit Modal ──────────────────────────────────────
function QuotationModal({
  quotation, onClose, onSaved,
}: {
  quotation: Quotation | null; onClose: () => void; onSaved: () => void;
}) {
  const isEdit = !!quotation;
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [buyerSearch, setBuyerSearch] = useState(quotation?.buyerName || "");
  const [buyerResults, setBuyerResults] = useState<Buyer[]>([]);
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [manualBuyer, setManualBuyer] = useState({
    name: quotation?.buyerName || "",
    company: quotation?.buyerCompany || "",
    email: quotation?.buyerEmail || "",
  });
  const [useManual, setUseManual] = useState(!quotation?.buyerId);
  const [items, setItems] = useState<LineItem[]>(
    quotation?.items?.length ? quotation.items : [{ productName: "", quantity: 1, unitPrice: 0 }]
  );
  const [notes, setNotes] = useState(quotation?.notes || "");
  const [currency, setCurrency] = useState(quotation?.currency || "USD");
  const [validUntil, setValidUntil] = useState(quotation?.validUntil?.slice(0, 10) || "");
  const [status, setStatus] = useState(quotation?.status || "draft");
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    buyerService.getAll({}).then(r => {
      const data = r.data?.data?.buyers || r.data?.data || r.data || [];
      setBuyers(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  const total = items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0);

  const handleBuyerSearch = (v: string) => {
    setBuyerSearch(v);
    if (v.length < 2) { setBuyerResults([]); return; }
    setBuyerResults(
      buyers.filter(b =>
        b.name.toLowerCase().includes(v.toLowerCase()) ||
        b.email?.toLowerCase().includes(v.toLowerCase())
      ).slice(0, 6)
    );
  };

  const handleSelectBuyer = (b: Buyer) => {
    setSelectedBuyer(b);
    setBuyerSearch(`${b.name}${b.company ? ` (${b.company})` : ""}`);
    setBuyerResults([]);
  };

  const setItem = (i: number, k: keyof LineItem, v: string | number) => {
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [k]: v } : it));
  };

  const addItem = () => setItems(prev => [...prev, { productName: "", quantity: 1, unitPrice: 0 }]);
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!useManual && !selectedBuyer) { setApiError("Please select or fill in buyer details"); return; }
    setSaving(true);
    setApiError("");
    try {
      const payload = {
        buyerId: useManual ? undefined : selectedBuyer?._id,
        buyerName: useManual ? manualBuyer.name : selectedBuyer?.name,
        buyerCompany: useManual ? manualBuyer.company : selectedBuyer?.company,
        buyerEmail: useManual ? manualBuyer.email : selectedBuyer?.email,
        items, notes, currency, validUntil: validUntil || undefined, status, total,
      };
      if (isEdit) await quotationService.update(quotation!._id, payload);
      else await quotationService.create(payload);
      onSaved();
      onClose();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setApiError(err.response?.data?.message || "Failed to save quotation");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-3 py-2 rounded-xl text-sm text-white placeholder-white/25 outline-none";
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl h-full flex flex-col overflow-hidden"
        style={{ background: "#0a0a0a", borderLeft: "1px solid rgba(255,255,255,0.1)" }}>
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <h2 className="text-white font-bold text-base">{isEdit ? "Edit Quotation" : "Create Quotation"}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {apiError && (
            <div className="flex items-center gap-2 text-red-400 text-sm p-3 rounded-xl"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle size={14} /> {apiError}
            </div>
          )}

          {/* Buyer Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white/70 text-xs font-semibold uppercase tracking-widest">Buyer</h3>
              <label className="flex items-center gap-2 text-xs text-white/40 cursor-pointer">
                <input type="checkbox" checked={useManual} onChange={e => setUseManual(e.target.checked)}
                  className="rounded" />
                Fill manually
              </label>
            </div>

            {!useManual ? (
              <div className="relative">
                <SearchIcon size={14} className="absolute left-3 top-2.5 text-white/30" />
                <input value={buyerSearch} onChange={e => handleBuyerSearch(e.target.value)}
                  placeholder="Search buyer by name or email…"
                  className={`${inputCls} pl-8`} style={inputStyle} />
                {buyerResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-10"
                    style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)" }}>
                    {buyerResults.map(b => (
                      <button key={b._id} onClick={() => handleSelectBuyer(b)}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors flex items-center gap-3">
                        <span className="text-white font-medium">{b.name}</span>
                        {b.company && <span className="text-white/40 text-xs">{b.company}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-white/40 text-xs mb-1">Name</label>
                  <input value={manualBuyer.name} onChange={e => setManualBuyer(p => ({ ...p, name: e.target.value }))}
                    placeholder="Buyer name" className={inputCls} style={inputStyle} /></div>
                <div><label className="block text-white/40 text-xs mb-1">Company</label>
                  <input value={manualBuyer.company} onChange={e => setManualBuyer(p => ({ ...p, company: e.target.value }))}
                    placeholder="Company" className={inputCls} style={inputStyle} /></div>
                <div className="col-span-2"><label className="block text-white/40 text-xs mb-1">Email</label>
                  <input value={manualBuyer.email} onChange={e => setManualBuyer(p => ({ ...p, email: e.target.value }))}
                    placeholder="Email" className={inputCls} style={inputStyle} /></div>
              </div>
            )}
          </div>

          {/* Line Items */}
          <div>
            <h3 className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-3">Products</h3>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="grid gap-2 items-center" style={{ gridTemplateColumns: "1fr auto auto auto" }}>
                  <input value={item.productName} onChange={e => setItem(i, "productName", e.target.value)}
                    placeholder="Product name" className={inputCls} style={inputStyle} />
                  <input type="number" min={1} value={item.quantity}
                    onChange={e => setItem(i, "quantity", Number(e.target.value))}
                    placeholder="Qty" className="w-20 px-3 py-2 rounded-xl text-sm text-white text-center outline-none"
                    style={inputStyle} />
                  <input type="number" min={0} step="0.01" value={item.unitPrice}
                    onChange={e => setItem(i, "unitPrice", Number(e.target.value))}
                    placeholder="Price" className="w-28 px-3 py-2 rounded-xl text-sm text-white text-right outline-none"
                    style={inputStyle} />
                  <button onClick={() => removeItem(i)} disabled={items.length === 1}
                    className="p-2 rounded-xl text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-20">
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button onClick={addItem}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl transition-all"
                style={{ color: "#d4a017", border: "1px solid rgba(212,160,23,0.2)" }}>
                <Plus size={12} /> Add Row
              </button>
            </div>

            {/* Total */}
            <div className="mt-3 flex justify-end">
              <div className="px-4 py-2 rounded-xl"
                style={{ background: "rgba(212,160,23,0.08)", border: "1px solid rgba(212,160,23,0.2)" }}>
                <span className="text-white/50 text-xs">Total: </span>
                <span className="text-[#d4a017] font-bold text-lg">
                  {currency} {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-white/40 text-xs mb-1">Currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)}
                className={inputCls} style={inputStyle}>
                {["USD", "EUR", "GBP", "INR", "AED"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-white/40 text-xs mb-1">Valid Until</label>
              <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)}
                className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="block text-white/40 text-xs mb-1">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className={inputCls} style={inputStyle}>
                {["draft", "sent", "accepted", "rejected"].map(s => (
                  <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-white/40 text-xs mb-1">Notes</label>
            <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Additional notes, terms, payment details…"
              className={`${inputCls} resize-none`} style={inputStyle} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end gap-3 shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)", color: "#0a0a0a" }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
            {isEdit ? "Update" : "Create"} Quotation
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm ─────────────────────────────────────────
function DeleteConfirm({ id, onConfirm, onCancel }: { id: string; onConfirm: () => Promise<void>; onCancel: () => void }) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative rounded-2xl p-6 w-full max-w-sm text-center"
        style={{ background: "#0a0a0a", border: "1px solid rgba(239,68,68,0.25)" }}>
        <Trash2 size={32} className="mx-auto mb-3" style={{ color: "#ef4444" }} />
        <h3 className="text-white font-bold mb-1">Delete Quotation?</h3>
        <p className="text-white/40 text-sm mb-5">Quote #{id} will be permanently deleted.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all">Cancel</button>
          <button onClick={async () => { setLoading(true); await onConfirm(); setLoading(false); }} disabled={loading}
            className="px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
            style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────
const STATUS_TABS = ["All", "Draft", "Sent", "Accepted", "Rejected"];
const PAGE_SIZE = 20;

export function Quotations() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeStatus, setActiveStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalQuotation, setModalQuotation] = useState<Quotation | null | "new">(null);
  const [deleteTarget, setDeleteTarget] = useState<Quotation | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchQuotations = () => {
    setLoading(true);
    const params: Record<string, unknown> = { page, limit: PAGE_SIZE };
    if (activeStatus !== "All") params.status = activeStatus.toLowerCase();
    quotationService.getAll(params)
      .then(r => {
        const d = r.data?.data || r.data || {};
        setQuotations(d.quotations || d || []);
        setTotal(d.total || 0);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  };

  useEffect(() => { fetchQuotations(); }, [activeStatus, page]);

  const handleDownloadPdf = async (q: Quotation) => {
    setDownloadingId(q._id);
    try {
      const r = await quotationService.getPdf(q._id);
      const url = URL.createObjectURL(new Blob([r.data], { type: "application/pdf" }));
      window.open(url, "_blank");
    } catch {}
    setDownloadingId(null);
  };

  const handleStatusUpdate = async (q: Quotation, newStatus: string) => {
    setUpdatingId(q._id);
    try {
      await quotationService.update(q._id, { status: newStatus });
      setQuotations(prev => prev.map(qt => qt._id === q._id ? { ...qt, status: newStatus } : qt));
    } catch {}
    setUpdatingId(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await quotationService.delete(deleteTarget._id);
    setDeleteTarget(null);
    fetchQuotations();
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-white text-2xl font-bold">Quotations</h2>
          <p className="text-white/35 text-sm mt-0.5">{total} quotations</p>
        </div>
        <button onClick={() => setModalQuotation("new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)", color: "#0a0a0a" }}>
          <Plus size={16} /> Create Quotation
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map(tab => (
          <button key={tab} onClick={() => { setActiveStatus(tab); setPage(1); }}
            className="px-4 py-1.5 rounded-xl text-sm font-medium transition-all"
            style={activeStatus === tab
              ? { background: "rgba(212,160,23,0.15)", color: "#d4a017", border: "1px solid rgba(212,160,23,0.3)" }
              : { color: "rgba(255,255,255,0.40)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm p-4 rounded-xl"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle size={16} /> Failed to load quotations.
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Quote #", "Buyer", "Company", "Status", "Total", "Valid Until", "Date", "Actions"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "rgba(255,255,255,0.3)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded animate-pulse"
                          style={{ background: "rgba(255,255,255,0.06)", width: "70%" }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : quotations.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-white/25">
                    <FileText size={32} />
                    <p className="text-sm">No quotations found</p>
                  </div>
                </td></tr>
              ) : (
                quotations.map(q => (
                  <tr key={q._id} className="hover:bg-white/[0.02] transition-colors"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td className="px-5 py-3.5 text-white font-mono text-xs font-bold">
                      #{q.quoteNumber || q._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-5 py-3.5 text-white font-medium">{q.buyerName || "—"}</td>
                    <td className="px-5 py-3.5 text-white/55">{q.buyerCompany || "—"}</td>
                    <td className="px-5 py-3.5">
                      <div className="relative">
                        <select
                          value={q.status}
                          disabled={updatingId === q._id}
                          onChange={e => handleStatusUpdate(q, e.target.value)}
                          className="appearance-none pr-6 pl-2 py-1 rounded-lg text-xs font-semibold cursor-pointer outline-none capitalize"
                          style={(() => {
                            const m: Record<string, { bg: string; color: string }> = {
                              draft:    { bg: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" },
                              sent:     { bg: "rgba(59,130,246,0.15)",  color: "#3b82f6" },
                              accepted: { bg: "rgba(34,197,94,0.15)",   color: "#22c55e" },
                              rejected: { bg: "rgba(239,68,68,0.15)",   color: "#ef4444" },
                            };
                            return m[q.status] || m.draft;
                          })()}
                        >
                          {["draft", "sent", "accepted", "rejected"].map(s => (
                            <option key={s} value={s} className="capitalize bg-[#111] text-white">
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "currentColor" }} />
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-white/70">
                      {q.total !== undefined ? `${q.currency || "USD"} ${Number(q.total).toLocaleString()}` : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-white/40 text-xs">{q.validUntil ? formatDate(q.validUntil) : "—"}</td>
                    <td className="px-5 py-3.5 text-white/40 text-xs">{formatDate(q.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setModalQuotation(q)}
                          className="p-1.5 rounded-lg text-white/30 hover:text-[#d4a017] hover:bg-[#d4a017]/10 transition-all"
                          title="Edit">
                          <FileText size={13} />
                        </button>
                        <button onClick={() => handleDownloadPdf(q)} disabled={downloadingId === q._id}
                          className="p-1.5 rounded-lg text-white/30 hover:text-blue-400 hover:bg-blue-500/10 transition-all disabled:opacity-40"
                          title="Download PDF">
                          {downloadingId === q._id
                            ? <Loader2 size={13} className="animate-spin" />
                            : <Download size={13} />}
                        </button>
                        <button onClick={() => setDeleteTarget(q)}
                          className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && total > PAGE_SIZE && (
          <div className="px-5 py-3.5 flex items-center justify-between"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-white/30 text-xs">Page {page} of {totalPages} · {total} results</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-lg disabled:opacity-30 text-white/50 hover:text-white hover:bg-white/5 transition-all">
                <ChevronLeft size={16} />
              </button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-lg disabled:opacity-30 text-white/50 hover:text-white hover:bg-white/5 transition-all">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalQuotation !== null && (
        <QuotationModal
          quotation={modalQuotation === "new" ? null : modalQuotation}
          onClose={() => setModalQuotation(null)}
          onSaved={fetchQuotations}
        />
      )}

      {/* Delete */}
      {deleteTarget && (
        <DeleteConfirm
          id={deleteTarget.quoteNumber || deleteTarget._id.slice(-6).toUpperCase()}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
