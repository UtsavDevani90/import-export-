import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  MessageSquare, Package, Users, FileText, TrendingUp,
  Newspaper, ArrowRight, Clock, AlertCircle,
  X, Mail, Phone, UserCheck, ChevronDown, Loader2
} from "lucide-react";
import { dashboardService, inquiryService, buyerService } from "../../services/api";

// ── Types ──────────────────────────────────────────────────
interface RecentInquiry {
  id?: string;
  _id?: string;
  name: string;
  email?: string;
  company?: string;
  country?: string;
  phone?: string;
  product?: string;
  quantity?: string;
  subject?: string;
  message?: string;
  status: string;
  created_at?: string;
  createdAt?: string;
}

// ── Helpers ────────────────────────────────────────────────
function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    new:        { bg: "rgba(34,197,94,0.15)",  color: "#22c55e" },
    contacted:  { bg: "rgba(59,130,246,0.15)", color: "#3b82f6" },
    quoted:     { bg: "rgba(212,160,23,0.15)", color: "#d4a017" },
    closed:     { bg: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" },
    replied:    { bg: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" },
    draft:      { bg: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" },
    sent:       { bg: "rgba(59,130,246,0.15)", color: "#3b82f6" },
    accepted:   { bg: "rgba(34,197,94,0.15)",  color: "#22c55e" },
    rejected:   { bg: "rgba(239,68,68,0.15)",  color: "#ef4444" },
  };
  const s = map[status?.toLowerCase()] || { bg: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" };
  return (
    <span
      className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
      style={{ background: s.bg, color: s.color }}
    >
      {status || "—"}
    </span>
  );
}

// ── Inquiry Detail Modal ────────────────────────────────────
function InquiryModal({
  inquiry,
  onClose,
  onStatusChange,
}: {
  inquiry: RecentInquiry;
  onClose: () => void;
  onStatusChange?: (id: string, status: string) => void;
}) {
  const id = inquiry._id || inquiry.id || "";
  const dateStr = inquiry.createdAt || inquiry.created_at || "";
  const [status, setStatus] = useState(inquiry.status);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [converting, setConverting] = useState(false);
  const [convertDone, setConvertDone] = useState(false);
  const [convertError, setConvertError] = useState("");

  const whatsappUrl = inquiry.phone
    ? `https://wa.me/${inquiry.phone.replace(/\D/g, "")}?text=Hello%20${encodeURIComponent(inquiry.name)}%2C%20thank%20you%20for%20reaching%20out%20to%20Tanzora%20Export%20Co.`
    : null;
  const emailUrl = `mailto:${inquiry.email || ""}?subject=Re: Your Inquiry about ${encodeURIComponent(inquiry.product || "our products")}`;

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    setUpdatingStatus(true);
    try {
      await inquiryService.updateStatus(id, newStatus, undefined);
      setStatus(newStatus);
      onStatusChange?.(id, newStatus);
    } catch {}
    setUpdatingStatus(false);
  };

  const handleConvert = async () => {
    if (!id || convertDone) return;
    setConverting(true);
    setConvertError("");
    try {
      await buyerService.create({
        name: inquiry.name,
        email: inquiry.email || "",
        company: inquiry.company || "",
        country: inquiry.country || "",
        phone: inquiry.phone || "",
        source: "inquiry",
        inquiryId: id,
      });
      setConvertDone(true);
    } catch {
      setConvertError("Already exists or failed. Check Buyers.");
    }
    setConverting(false);
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Field with "Not Provided" fallback
  const Field = ({ label, value, full = false }: { label: string; value?: string | null; full?: boolean }) => (
    <div className={full ? "col-span-2" : ""}>
      <p
        className="text-[10px] font-semibold uppercase tracking-widest mb-1"
        style={{ color: "rgba(255,255,255,0.3)" }}
      >
        {label}
      </p>
      <p
        className="text-sm font-medium"
        style={{ color: value ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.25)" }}
      >
        {value || "Not Provided"}
      </p>
    </div>
  );

  // Section header
  const SectionHeader = ({ title }: { title: string }) => (
    <div
      className="col-span-2 flex items-center gap-2 pt-2 pb-1"
      style={{ borderBottom: "1px solid rgba(212,160,23,0.15)" }}
    >
      <span
        className="text-[10px] font-bold uppercase tracking-widest"
        style={{ color: "#d4a017" }}
      >
        {title}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75"
        style={{ backdropFilter: "blur(8px)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #111111 0%, #0d0d0d 100%)",
          border: "1px solid rgba(212,160,23,0.2)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,160,23,0.06)",
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(212,160,23,0.05)" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)", color: "#0a0a0a" }}
            >
              {inquiry.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <h2 className="text-white font-bold text-sm sm:text-base truncate">{inquiry.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusBadge status={status} />
                <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {formatDate(dateStr)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5 shrink-0 ml-2"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-4 grid grid-cols-2 gap-x-6 gap-y-4">

            {/* BUYER INFORMATION */}
            <SectionHeader title="Buyer Information" />
            <Field label="Full Name"               value={inquiry.name} />
            <Field label="Company / Business Name" value={inquiry.company} />
            <Field label="Email Address"            value={inquiry.email} />
            <Field label="Phone / WhatsApp"         value={inquiry.phone} />
            <Field label="Country"                  value={inquiry.country} />

            {/* INQUIRY INFORMATION */}
            <SectionHeader title="Inquiry Information" />
            <Field label="Product of Interest"     value={inquiry.product} />
            <Field label="Required Quantity"        value={inquiry.quantity} />
            <Field label="Subject"                  value={inquiry.subject} />
            <Field label="Created Date"             value={formatDate(dateStr)} />

            {/* Message — always full-width */}
            <div className="col-span-2">
              <p
                className="text-[10px] font-semibold uppercase tracking-widest mb-2"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                Message / Additional Requirements
              </p>
              {inquiry.message ? (
                <p
                  className="text-sm leading-relaxed rounded-xl p-3 whitespace-pre-wrap"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.78)",
                  }}
                >
                  {inquiry.message}
                </p>
              ) : (
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>Not Provided</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Action Footer ── */}
        <div
          className="px-5 py-4 shrink-0 space-y-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.35)" }}
        >
          {/* Update Status row */}
          <div className="flex items-center gap-3">
            <p className="text-xs font-medium shrink-0" style={{ color: "rgba(255,255,255,0.35)" }}>
              Update Status
            </p>
            <div className="relative flex-1">
              <select
                value={status}
                onChange={e => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
                className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all"
                style={{
                  background: "rgba(212,160,23,0.1)",
                  color: "#d4a017",
                  border: "1px solid rgba(212,160,23,0.28)",
                  outline: "none",
                }}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="quoted">Quoted</option>
                <option value="closed">Closed</option>
              </select>
              {updatingStatus
                ? <Loader2 size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin text-[#d4a017]" />
                : <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#d4a017] pointer-events-none" />}
            </div>
          </div>

          {/* 3 action buttons */}
          <div className="grid grid-cols-3 gap-2">
            {/* Email Buyer */}
            <a
              href={emailUrl}
              className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition-all hover:scale-[1.03] active:scale-95"
              style={{ background: "rgba(59,130,246,0.12)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)" }}
            >
              <Mail size={15} />
              <span>Email Buyer</span>
            </a>

            {/* WhatsApp Buyer */}
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition-all hover:scale-[1.03] active:scale-95"
                style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}
              >
                <Phone size={15} />
                <span>WhatsApp</span>
              </a>
            ) : (
              <div
                className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-semibold cursor-not-allowed"
                style={{ background: "rgba(34,197,94,0.05)", color: "rgba(34,197,94,0.3)", border: "1px solid rgba(34,197,94,0.1)" }}
                title="No phone number provided"
              >
                <Phone size={15} />
                <span>WhatsApp</span>
              </div>
            )}

            {/* Convert to Buyer */}
            <button
              onClick={handleConvert}
              disabled={converting || convertDone}
              className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              style={{
                background: convertDone ? "rgba(168,85,247,0.2)" : "rgba(168,85,247,0.12)",
                color: "#a855f7",
                border: "1px solid rgba(168,85,247,0.22)",
              }}
            >
              {converting ? <Loader2 size={15} className="animate-spin" /> : <UserCheck size={15} />}
              <span>{convertDone ? "Converted!" : "Convert to Buyer"}</span>
            </button>
          </div>

          {convertError && (
            <p className="text-xs text-center pt-0.5" style={{ color: "#ef4444" }}>{convertError}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-xl animate-pulse ${className}`}
      style={{ background: "linear-gradient(90deg,rgba(212,160,23,0.06) 25%,rgba(212,160,23,0.12) 50%,rgba(212,160,23,0.06) 75%)", backgroundSize: "200% 100%" }}
    />
  );
}

// ── KPI Card ───────────────────────────────────────────────
function KpiCard({
  icon: Icon, label, value, color, loading,
}: {
  icon: React.ElementType; label: string; value: number | string; color: string; loading: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex items-center gap-4"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}18` }}
      >
        <Icon size={22} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
        {loading ? (
          <Skeleton className="h-7 w-16 mt-1" />
        ) : (
          <p className="text-2xl font-bold text-white mt-0.5">{value ?? 0}</p>
        )}
      </div>
    </div>
  );
}

// ── Recent Table ───────────────────────────────────────────
function RecentTable({
  title, link, linkLabel, loading, children, headers,
}: {
  title: string; link: string; linkLabel: string; loading: boolean;
  children: React.ReactNode; headers: string[];
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        <Link
          to={link}
          className="text-xs font-medium flex items-center gap-1 transition-colors hover:opacity-80"
          style={{ color: "#d4a017" }}
        >
          {linkLabel} <ArrowRight size={12} />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {headers.map(h => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  {headers.map(h => (
                    <td key={h} className="px-5 py-3.5">
                      <Skeleton className="h-4" style={{ width: `${60 + Math.random() * 40}%` } as React.CSSProperties} />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────
export function Overview() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<RecentInquiry | null>(null);
  const [recentInquiries, setRecentInquiries] = useState<RecentInquiry[]>([]);

  useEffect(() => {
    dashboardService.getStats()
      .then(r => {
        const d = r.data?.data || r.data || {};
        setStats(d);
        setRecentInquiries((d as any)?.inquiries?.recent || []);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const handleInquiryStatusChange = (id: string, newStatus: string) => {
    setRecentInquiries(prev =>
      prev.map(i => (i._id === id || i.id === id) ? { ...i, status: newStatus } : i)
    );
    if (selectedInquiry && (selectedInquiry._id === id || selectedInquiry.id === id)) {
      setSelectedInquiry(prev => prev ? { ...prev, status: newStatus } : prev);
    }
  };

  const s = stats as {
    totalInquiries?: number; totalProducts?: number; totalBuyers?: number;
    totalQuotations?: number; newInquiries?: number; publishedBlogs?: number;
    recentBuyers?: { _id: string; name: string; company?: string; country?: string; createdAt: string }[];
    recentQuotations?: { _id: string; quoteNumber?: string; buyerName?: string; status: string; total?: number; createdAt: string }[];
  } | null;

  const kpis = [
  { icon: MessageSquare, label: "Total Inquiries", value: (s as any)?.inquiries?.total ?? 0, color: "#3b82f6" },
  { icon: Package, label: "Total Products", value: (s as any)?.products?.total ?? 0, color: "#d4a017" },
  { icon: Users, label: "Total Buyers", value: (s as any)?.buyers?.total ?? 0, color: "#a855f7" },
  { icon: FileText, label: "Total Quotations", value: (s as any)?.quotations?.total ?? 0, color: "#22c55e" },
  { icon: TrendingUp, label: "New Inquiries", value: (s as any)?.inquiries?.new ?? 0, color: "#f59e0b" },
  { icon: Newspaper, label: "Published Blogs", value: (s as any)?.blogs?.published ?? 0, color: "#ec4899" },
];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle size={40} style={{ color: "#ef4444" }} />
        <p className="text-white/50 text-sm">Failed to load dashboard stats. Please refresh.</p>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h2 className="text-white text-2xl font-bold">Overview</h2>
        <p className="text-white/35 text-sm mt-1 flex items-center gap-1.5">
          <Clock size={13} /> Updated just now
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {kpis.map(k => (
          <KpiCard key={k.label} {...k} loading={loading} />
        ))}
      </div>

      {/* Recent Inquiries */}
      <RecentTable
        title="Recent Inquiries"
        link="/dashboard/inquiries"
        linkLabel="View All"
        loading={loading}
        headers={["Name", "Company", "Product", "Country", "Status", "Date", "Action"]}
      >
        {recentInquiries.length === 0 ? (
          <tr>
            <td colSpan={7} className="px-5 py-8 text-center text-white/30 text-sm">No inquiries yet</td>
          </tr>
        ) : (
          recentInquiries.map(inq => (
            <tr
              key={inq._id || inq.id}
              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              className="hover:bg-white/[0.02] transition-colors"
            >
              <td className="px-5 py-3.5 text-white font-medium whitespace-nowrap">{inq.name}</td>
              <td className="px-5 py-3.5 text-white/50 whitespace-nowrap">{inq.company || "—"}</td>
              <td className="px-5 py-3.5 text-white/50 whitespace-nowrap">{inq.product || "—"}</td>
              <td className="px-5 py-3.5 text-white/50 whitespace-nowrap">{inq.country || "—"}</td>
              <td className="px-5 py-3.5"><StatusBadge status={inq.status} /></td>
              <td className="px-5 py-3.5 text-white/40 text-xs whitespace-nowrap">
                {formatDate(inq.createdAt || inq.created_at || "")}
              </td>
              <td className="px-5 py-3.5">
                <button
                  onClick={() => setSelectedInquiry(inq)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90"
                  style={{
                    background: "rgba(212,160,23,0.12)",
                    color: "#d4a017",
                    border: "1px solid rgba(212,160,23,0.25)",
                  }}
                >
                  View
                </button>
              </td>
            </tr>
          ))
        )}
      </RecentTable>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <InquiryModal
          inquiry={selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          onStatusChange={handleInquiryStatusChange}
        />
      )}

      {/* Recent Buyers */}
      <RecentTable
        title="Recent Buyers"
        link="/dashboard/buyers"
        linkLabel="View All"
        loading={loading}
        headers={["Name", "Company", "Country", "Joined"]}
      >
        {(s?.recentBuyers || []).length === 0 ? (
          <tr>
            <td colSpan={4} className="px-5 py-8 text-center text-white/30 text-sm">No buyers yet</td>
          </tr>
        ) : (
          (s?.recentBuyers || []).map(b => (
            <tr
              key={b._id}
              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              className="hover:bg-white/[0.02] transition-colors"
            >
              <td className="px-5 py-3.5 text-white font-medium">{b.name}</td>
              <td className="px-5 py-3.5 text-white/50">{b.company || "—"}</td>
              <td className="px-5 py-3.5 text-white/50">{b.country || "—"}</td>
              <td className="px-5 py-3.5 text-white/40 text-xs">{formatDate(b.createdAt)}</td>
            </tr>
          ))
        )}
      </RecentTable>

      {/* Recent Quotations */}
      <RecentTable
        title="Recent Quotations"
        link="/dashboard/quotations"
        linkLabel="View All"
        loading={loading}
        headers={["Quote #", "Buyer", "Status", "Total", "Date"]}
      >
        {(s?.recentQuotations || []).length === 0 ? (
          <tr>
            <td colSpan={5} className="px-5 py-8 text-center text-white/30 text-sm">No quotations yet</td>
          </tr>
        ) : (
          (s?.recentQuotations || []).map(q => (
            <tr
              key={q._id}
              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              className="hover:bg-white/[0.02] transition-colors"
            >
              <td className="px-5 py-3.5 text-white font-medium font-mono text-xs">
                {q.quoteNumber || q._id.slice(-6).toUpperCase()}
              </td>
              <td className="px-5 py-3.5 text-white/70">{q.buyerName || "—"}</td>
              <td className="px-5 py-3.5"><StatusBadge status={q.status} /></td>
              <td className="px-5 py-3.5 text-white/70">
                {q.total !== undefined ? `$${Number(q.total).toLocaleString()}` : "—"}
              </td>
              <td className="px-5 py-3.5 text-white/40 text-xs">{formatDate(q.createdAt)}</td>
            </tr>
          ))
        )}
      </RecentTable>
    </div>
  );
}
