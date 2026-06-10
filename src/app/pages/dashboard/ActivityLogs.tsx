import { useState, useEffect } from "react";
import { Activity, Search, Calendar, ChevronLeft, ChevronRight, AlertCircle, Info } from "lucide-react";
import { activityLogService } from "../../services/api";

interface ActivityLog {
  _id: string;
  admin_name?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  entity_label?: string;
  details?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

// ── Helpers ────────────────────────────────────────────────
function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ACTION_MAP: Record<string, string> = {
  "product.create": "Created Product",
  "product.created": "Created Product",
  "product.update": "Updated Product",
  "product.updated": "Updated Product",
  "product.delete": "Deleted Product",
  "product.deleted": "Deleted Product",
  "buyer.create": "Registered Buyer",
  "buyer.created": "Registered Buyer",
  "buyer.update": "Updated Buyer",
  "buyer.updated": "Updated Buyer",
  "buyer.delete": "Deleted Buyer",
  "buyer.deleted": "Deleted Buyer",
  "inquiry.note_added": "Added Note to Inquiry",
  "inquiry.status_update": "Updated Inquiry Status",
  "inquiry.status_updated": "Updated Inquiry Status",
  "quotation.create": "Created Quotation",
  "quotation.created": "Created Quotation",
  "quotation.update": "Updated Quotation",
  "quotation.updated": "Updated Quotation",
  "quotation.deleted": "Deleted Quotation",
  "settings.updated": "Updated System Settings",
};

const ACTION_FILTER_OPTIONS = [
  { value: "", label: "All Actions" },
  { value: "product.created", label: "Product Created" },
  { value: "product.updated", label: "Product Updated" },
  { value: "product.deleted", label: "Product Deleted" },
  { value: "buyer.created", label: "Buyer Created" },
  { value: "buyer.updated", label: "Buyer Updated" },
  { value: "buyer.deleted", label: "Buyer Deleted" },
  { value: "inquiry.note_added", label: "Inquiry Note Added" },
  { value: "inquiry.status_updated", label: "Inquiry Status Updated" },
  { value: "quotation.created", label: "Quotation Created" },
  { value: "quotation.updated", label: "Quotation Updated" },
  { value: "settings.updated", label: "Settings Updated" },
];

export function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filter states
  const [actionFilter, setActionFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchLogs = async (pageNum = 1) => {
    setLoading(true);
    setError("");
    try {
      const params: Record<string, any> = {
        page: pageNum,
        limit: 20,
      };
      if (actionFilter) params.action = actionFilter;
      if (fromDate) params.from = new Date(fromDate).toISOString();
      if (toDate) params.to = new Date(toDate).toISOString();

      const res = await activityLogService.getAll(params);
      const data = res.data?.data || {};
      
      setLogs(data.logs || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotalItems(data.pagination?.total || 0);
      setPage(pageNum);
    } catch {
      setError("Failed to fetch activity logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [actionFilter, fromDate, toDate]);

  const handlePageChange = (p: number) => {
    if (p < 1 || p > totalPages) return;
    fetchLogs(p);
  };

  const formatActionName = (action: string) => {
    return ACTION_MAP[action] || action.replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  };

  const formatDetails = (details?: Record<string, any>) => {
    if (!details) return "—";
    try {
      return Object.entries(details)
        .map(([k, v]) => `${k.replace(/_/g, " ")}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
        .join(", ");
    } catch {
      return "—";
    }
  };

  // Skeleton table rows
  const SkeletonRows = () => (
    <>
      {Array.from({ length: 6 }).map((_, idx) => (
        <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          {Array.from({ length: 5 }).map((_, cIdx) => (
            <td key={cIdx} className="px-5 py-4">
              <div className="h-4 rounded bg-white/5 animate-pulse" style={{ width: `${40 + Math.random() * 50}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white text-2xl font-bold flex items-center gap-2">
          <Activity size={22} className="text-[#d4a017]" />
          Activity Logs
        </h2>
        <p className="text-white/40 text-sm mt-0.5">Audit trail of all administrative actions performed on this platform</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-xl p-4 flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle size={18} />
          <p>{error}</p>
        </div>
      )}

      {/* Filters Pane */}
      <div className="rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {/* Action filter */}
        <div>
          <label className="block text-white/50 text-xs font-medium mb-1.5 flex items-center gap-1">
            <Search size={12} /> Action Type
          </label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none border focus:border-[#d4a017] bg-white/[0.02]"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            {ACTION_FILTER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-[#0a0a0a] text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* From Date */}
        <div>
          <label className="block text-white/50 text-xs font-medium mb-1.5 flex items-center gap-1">
            <Calendar size={12} /> Start Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full px-4 py-2 rounded-xl text-white text-sm outline-none border focus:border-[#d4a017] bg-white/[0.02]"
            style={{ borderColor: "rgba(255,255,255,0.08)", minHeight: "42px" }}
          />
        </div>

        {/* To Date */}
        <div>
          <label className="block text-white/50 text-xs font-medium mb-1.5 flex items-center gap-1">
            <Calendar size={12} /> End Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full px-4 py-2 rounded-xl text-white text-sm outline-none border focus:border-[#d4a017] bg-white/[0.02]"
            style={{ borderColor: "rgba(255,255,255,0.08)", minHeight: "42px" }}
          />
        </div>
      </div>

      {/* Logs Table Container */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Admin", "Action", "Target / Entity", "Details", "IP Address", "Timestamp"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-white/40">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows />
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-white/20 text-sm">
                    No logs found matching your filters
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-white/[0.01] transition-colors"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <td className="px-5 py-4 text-white font-medium">{log.admin_name || "System"}</td>
                    <td className="px-5 py-4">
                      <span className="text-[#d4a017] font-semibold text-xs py-1 px-2.5 rounded-lg bg-[#d4a017]/10 border border-[#d4a017]/10">
                        {formatActionName(log.action)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-white/70">
                      {log.entity_type ? (
                        <div>
                          <span className="text-white/40 text-xs uppercase font-mono">{log.entity_type}: </span>
                          <span className="font-semibold text-sm">{log.entity_label || log.entity_id || "—"}</span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-4 text-white/40 text-xs max-w-xs truncate" title={formatDetails(log.details)}>
                      {formatDetails(log.details)}
                    </td>
                    <td className="px-5 py-4 text-white/40 font-mono text-xs">{log.ip_address || "—"}</td>
                    <td className="px-5 py-4 text-white/40 text-xs shrink-0">{formatDate(log.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        {!loading && logs.length > 0 && (
          <div className="px-5 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/40 border-t border-white/05 bg-black/10">
            <span>Showing {logs.length} of {totalItems} total actions logged</span>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-white disabled:opacity-20 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-medium text-white/80">Page {page} of {totalPages}</span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-white disabled:opacity-20 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
