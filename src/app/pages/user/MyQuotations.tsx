import { useState, useEffect } from "react";
import { FileText, Calendar, ChevronRight, X, Tag } from "lucide-react";
import { userQuotationService } from "../../services/api";

const statusColor: Record<string, { bg: string; text: string }> = {
  draft:     { bg: "rgba(156,163,175,0.12)",  text: "#9ca3af" },
  sent:      { bg: "rgba(96,165,250,0.15)",   text: "#60a5fa" },
  accepted:  { bg: "rgba(52,211,153,0.15)",   text: "#34d399" },
  rejected:  { bg: "rgba(239,68,68,0.15)",    text: "#ef4444" },
  expired:   { bg: "rgba(251,146,60,0.15)",   text: "#fb923c" },
};

interface Quotation {
  id: string; quotation_number?: string; status: string;
  total_amount?: number; currency?: string;
  valid_until?: string; notes?: string; created_at: string;
}

export function MyQuotations() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState<Quotation | null>(null);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await userQuotationService.getAll({ page: p, limit: 10 });
      setQuotations(res.data.data?.quotations || []);
      setTotal(res.data.data?.total || 0);
    } catch { setQuotations([]); }
    setLoading(false);
  };

  useEffect(() => { load(1); }, []);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white text-xl font-bold">My Quotations</h2>
        <p className="text-white/40 text-xs mt-0.5">{total} total quotation{total !== 1 ? "s" : ""}</p>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />)}
          </div>
        ) : quotations.length === 0 ? (
          <div className="p-10 text-center">
            <FileText size={36} className="text-white/15 mx-auto mb-3" />
            <p className="text-white/30 text-sm mb-1">No quotations yet</p>
            <p className="text-white/20 text-xs">Quotations will appear here once our team sends them to you.</p>
          </div>
        ) : (
          <>
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              {quotations.map(q => (
                <div
                  key={q.id}
                  onClick={() => setSelected(q)}
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(96,165,250,0.1)" }}>
                    <FileText size={18} className="text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-sm">{q.quotation_number || `QUO-${q.id.slice(0,8).toUpperCase()}`}</div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {q.total_amount && (
                        <span className="text-white/40 text-xs flex items-center gap-1">
                          <Tag size={11} /> {q.currency || "USD"} {Number(q.total_amount).toLocaleString()}
                        </span>
                      )}
                      {q.valid_until && (
                        <span className="text-white/30 text-xs flex items-center gap-1">
                          <Calendar size={11} /> Valid till {new Date(q.valid_until).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium capitalize"
                      style={{ background: statusColor[q.status]?.bg || "rgba(255,255,255,0.08)", color: statusColor[q.status]?.text || "white" }}>
                      {q.status}
                    </span>
                    <ChevronRight size={14} className="text-white/20" />
                  </div>
                </div>
              ))}
            </div>
            {total > 10 && (
              <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="text-white/30 text-xs">Showing {Math.min(page * 10, total)} of {total}</span>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => { setPage(p => p - 1); load(page - 1); }} className="px-3 py-1.5 rounded-lg text-xs disabled:opacity-30 text-white/60 hover:bg-white/5">Prev</button>
                  <button disabled={page * 10 >= total} onClick={() => { setPage(p => p + 1); load(page + 1); }} className="px-3 py-1.5 rounded-lg text-xs disabled:opacity-30 text-white/60 hover:bg-white/5">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl p-6" style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-base">{selected.quotation_number || "Quotation Details"}</h3>
              <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              {[
                ["Status",       <span className="capitalize px-2.5 py-1 rounded-full text-xs" style={{ background: statusColor[selected.status]?.bg, color: statusColor[selected.status]?.text }}>{selected.status}</span>],
                ["Total Amount", selected.total_amount ? `${selected.currency || "USD"} ${Number(selected.total_amount).toLocaleString()}` : "—"],
                ["Valid Until",  selected.valid_until  ? new Date(selected.valid_until).toLocaleDateString() : "—"],
                ["Created",      new Date(selected.created_at).toLocaleDateString()],
              ].map(([label, val]) => (
                <div key={String(label)} className="flex items-center justify-between py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span className="text-white/40 text-sm">{label}</span>
                  <span className="text-white text-sm font-medium">{val as any}</span>
                </div>
              ))}
              {selected.notes && (
                <div className="p-4 rounded-xl mt-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-white/40 text-xs font-semibold mb-2">Notes</p>
                  <p className="text-white/70 text-sm leading-relaxed">{selected.notes}</p>
                </div>
              )}
              <p className="text-white/25 text-xs text-center pt-2">Contact us to accept or discuss this quotation.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
