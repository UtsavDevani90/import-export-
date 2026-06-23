import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  MessageSquare, Package, Users, FileText, TrendingUp,
  Newspaper, ArrowRight, Clock, AlertCircle
} from "lucide-react";
import { dashboardService } from "../../services/api";

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

  useEffect(() => {
    dashboardService.getStats()
      .then(r => { setStats(r.data?.data || r.data || {}); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const s = stats as {
    totalInquiries?: number; totalProducts?: number; totalBuyers?: number;
    totalQuotations?: number; newInquiries?: number; publishedBlogs?: number;
    recentInquiries?: {
  id: string;
  name: string;
  product?: string;
  status: string;
  created_at: string;
}[];
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
        headers={["Name", "Company", "Status", "Date"]}
      >
        {((s as any)?.inquiries?.recent || []).length === 0 ? (
          <tr>
            <td colSpan={4} className="px-5 py-8 text-center text-white/30 text-sm">No inquiries yet</td>
          </tr>
        ) : (
          ((s as any)?.inquiries?.recent || []).map(inq => (
            <tr
              key={inq.id}
              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              className="hover:bg-white/[0.02] transition-colors"
            >
              <td className="px-5 py-3.5 text-white font-medium">{inq.name}</td>
              <td className="px-5 py-3.5 text-white/50">
              {inq.product || "—"}
              </td>
              <td className="px-5 py-3.5"><StatusBadge status={inq.status} /></td>
              <td className="px-5 py-3.5 text-white/40 text-xs">
              {formatDate(inq.created_at)}
              </td>
            </tr>
          ))
        )}
      </RecentTable>

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
