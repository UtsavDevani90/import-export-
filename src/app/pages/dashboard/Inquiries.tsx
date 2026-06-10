import { useState, useEffect, useRef } from "react";
import {
  Search, Filter, ChevronLeft, ChevronRight, X,
  MessageSquare, Phone, Mail, Loader2, Send, AlertCircle,
  ChevronDown, ExternalLink, StickyNote
} from "lucide-react";
import { inquiryService, inquiryNoteService } from "../../services/api";

// ── Types ──────────────────────────────────────────────────
interface Note {
  _id: string;
  note: string;
  createdAt: string;
  admin?: { name: string };
}

interface Inquiry {
  _id: string;
  name: string;
  email: string;
  company?: string;
  country?: string;
  phone?: string;
  product?: string;
  message?: string;
  status: string;
  createdAt: string;
  adminNotes?: string;
}

// ── Helpers ────────────────────────────────────────────────
function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    new:       { bg: "rgba(34,197,94,0.15)",  color: "#22c55e" },
    contacted: { bg: "rgba(59,130,246,0.15)", color: "#3b82f6" },
    quoted:    { bg: "rgba(212,160,23,0.15)", color: "#d4a017" },
    closed:    { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" },
  };
  const s = map[status?.toLowerCase()] || { bg: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" };
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
      style={{ background: s.bg, color: s.color }}>
      {status || "—"}
    </span>
  );
}

// ── Drawer ─────────────────────────────────────────────────
function InquiryDrawer({
  inquiry, onClose, onStatusChange,
}: {
  inquiry: Inquiry; onClose: () => void; onStatusChange: (id: string, status: string) => void;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteInput, setNoteInput] = useState("");
  const [notesLoading, setNotesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(inquiry.status);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const notesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inquiryNoteService.getAll(inquiry._id)
      .then(r => setNotes(r.data?.data || r.data || []))
      .catch(() => setNotes([]))
      .finally(() => setNotesLoading(false));
  }, [inquiry._id]);

  useEffect(() => {
    notesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [notes]);

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await inquiryService.updateStatus(inquiry._id, newStatus, inquiry.adminNotes);
      setStatus(newStatus);
      onStatusChange(inquiry._id, newStatus);
    } catch {}
    setUpdatingStatus(false);
  };

  const handleAddNote = async () => {
    if (!noteInput.trim()) return;
    setSubmitting(true);
    try {
      const r = await inquiryNoteService.addNote(inquiry._id, noteInput.trim());
      const newNote = r.data?.data || { _id: Date.now().toString(), note: noteInput.trim(), createdAt: new Date().toISOString() };
      setNotes(prev => [...prev, newNote]);
      setNoteInput("");
    } catch {}
    setSubmitting(false);
  };

  const whatsappUrl = inquiry.phone
    ? `https://wa.me/${inquiry.phone.replace(/\D/g, "")}?text=Hello%20${encodeURIComponent(inquiry.name)}%2C%20thank%20you%20for%20reaching%20out%20to%20Tanzora%20Export%20Co.`
    : null;

  const emailUrl = `mailto:${inquiry.email}?subject=Re: Your Inquiry about ${encodeURIComponent(inquiry.product || "our products")}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-lg flex flex-col h-full overflow-hidden"
        style={{ background: "#0a0a0a", borderLeft: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <h2 className="text-white font-bold text-base">{inquiry.name}</h2>
            <p className="text-white/40 text-xs mt-0.5">{inquiry.email}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Status + Actions */}
          <div className="px-6 py-4 space-y-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Status select */}
              <div className="relative">
                <select
                  value={status}
                  onChange={e => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                  className="appearance-none pr-8 pl-3 py-1.5 rounded-xl text-sm font-medium cursor-pointer transition-all"
                  style={{ background: "rgba(212,160,23,0.12)", color: "#d4a017", border: "1px solid rgba(212,160,23,0.25)", outline: "none" }}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="quoted">Quoted</option>
                  <option value="closed">Closed</option>
                </select>
                {updatingStatus
                  ? <Loader2 size={12} className="absolute right-2 top-2.5 animate-spin text-[#d4a017]" />
                  : <ChevronDown size={12} className="absolute right-2 top-2.5 text-[#d4a017] pointer-events-none" />}
              </div>

              {/* Action buttons */}
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                  style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
                  <Phone size={12} /> WhatsApp <ExternalLink size={10} />
                </a>
              )}
              <a href={emailUrl}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={{ background: "rgba(59,130,246,0.12)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)" }}>
                <Mail size={12} /> Email <ExternalLink size={10} />
              </a>
            </div>
          </div>

          {/* Details */}
          <div className="px-6 py-4 space-y-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 className="text-white/50 text-xs font-semibold uppercase tracking-widest">Inquiry Details</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                ["Company",  inquiry.company],
                ["Country",  inquiry.country],
                ["Phone",    inquiry.phone],
                ["Product",  inquiry.product],
                ["Date",     formatDate(inquiry.createdAt)],
              ].map(([label, val]) => val ? (
                <div key={label}>
                  <p className="text-white/30 text-xs mb-0.5">{label}</p>
                  <p className="text-white/80">{val}</p>
                </div>
              ) : null)}
            </div>
            {inquiry.message && (
              <div>
                <p className="text-white/30 text-xs mb-1">Message</p>
                <p className="text-white/70 text-sm leading-relaxed rounded-xl p-3"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {inquiry.message}
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="px-6 py-4">
            <h3 className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2">
              <StickyNote size={12} /> Internal Notes
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
              {notesLoading ? (
                <p className="text-white/30 text-xs">Loading notes…</p>
              ) : notes.length === 0 ? (
                <p className="text-white/25 text-xs italic">No notes yet. Add the first note below.</p>
              ) : (
                notes.map(n => (
                  <div key={n._id} className="rounded-xl p-3 text-sm"
                    style={{ background: "rgba(212,160,23,0.06)", border: "1px solid rgba(212,160,23,0.12)" }}>
                    <p className="text-white/75">{n.note}</p>
                    <p className="text-white/25 text-xs mt-1">
                      {n.admin?.name && <span>{n.admin.name} · </span>}{timeAgo(n.createdAt)}
                    </p>
                  </div>
                ))
              )}
              <div ref={notesEndRef} />
            </div>
            <div className="flex gap-2">
              <textarea
                rows={2}
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                placeholder="Add a note…"
                className="flex-1 resize-none rounded-xl px-3 py-2 text-sm text-white placeholder-white/25 outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleAddNote(); }}
              />
              <button
                onClick={handleAddNote}
                disabled={submitting || !noteInput.trim()}
                className="px-3 rounded-xl flex items-center gap-1 text-sm font-medium transition-all disabled:opacity-40"
                style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)", color: "#0a0a0a" }}
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────
const STATUS_TABS = ["All", "New", "Contacted", "Quoted", "Closed"];
const PAGE_SIZE = 20;

export function Inquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Inquiry | null>(null);

  const fetchInquiries = () => {
    setLoading(true);
    const params: Record<string, unknown> = { page, limit: PAGE_SIZE };
    if (search) params.search = search;
    if (activeStatus !== "All") params.status = activeStatus.toLowerCase();
    inquiryService.getAll(params)
      .then(r => {
        const d = r.data?.data || r.data || {};
        setInquiries(d.inquiries || d || []);
        setTotal(d.total || 0);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  };

  useEffect(() => { fetchInquiries(); }, [search, activeStatus, page]);

  const handleStatusChange = (id: string, newStatus: string) => {
    setInquiries(prev => prev.map(i => i._id === id ? { ...i, status: newStatus } : i));
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-white text-2xl font-bold">Inquiries</h2>
          <p className="text-white/35 text-sm mt-0.5">{total} total inquiries</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, email, company…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          />
        </div>
        <Filter size={15} className="text-white/30" />
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveStatus(tab); setPage(1); }}
            className="px-4 py-1.5 rounded-xl text-sm font-medium transition-all"
            style={activeStatus === tab
              ? { background: "rgba(212,160,23,0.15)", color: "#d4a017", border: "1px solid rgba(212,160,23,0.3)" }
              : { color: "rgba(255,255,255,0.40)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm p-4 rounded-xl"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle size={16} /> Failed to load inquiries. Please try again.
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Name", "Company", "Country", "Product", "Status", "Date", ""].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "rgba(255,255,255,0.3)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.06)", width: `${50 + j * 5}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : inquiries.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-white/30">No inquiries found</td></tr>
              ) : (
                inquiries.map(inq => (
                  <tr
                    key={inq._id}
                    onClick={() => setSelected(inq)}
                    className="cursor-pointer hover:bg-white/[0.025] transition-colors"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <td className="px-5 py-3.5">
                      <div className="text-white font-medium">{inq.name}</div>
                      <div className="text-white/35 text-xs">{inq.email}</div>
                    </td>
                    <td className="px-5 py-3.5 text-white/55">{inq.company || "—"}</td>
                    <td className="px-5 py-3.5 text-white/55">{inq.country || "—"}</td>
                    <td className="px-5 py-3.5 text-white/55">{inq.product || "—"}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={inq.status} /></td>
                    <td className="px-5 py-3.5 text-white/35 text-xs">{formatDate(inq.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <MessageSquare size={14} className="text-white/25 hover:text-[#d4a017] transition-colors" />
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
            <p className="text-white/30 text-xs">
              Page {page} of {totalPages} · {total} results
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-lg transition-all disabled:opacity-30 text-white/50 hover:text-white hover:bg-white/5"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-lg transition-all disabled:opacity-30 text-white/50 hover:text-white hover:bg-white/5"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer */}
      {selected && (
        <InquiryDrawer
          inquiry={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
