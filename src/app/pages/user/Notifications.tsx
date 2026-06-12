import { useState, useEffect } from "react";
import { Bell, CheckCheck, MessageSquare, FileText, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { userNotificationService } from "../../services/api";

const typeIcon: Record<string, React.ElementType> = {
  info:      Info,
  success:   CheckCircle,
  warning:   AlertTriangle,
  inquiry:   MessageSquare,
  quotation: FileText,
};
const typeColor: Record<string, string> = {
  info:      "#60a5fa",
  success:   "#34d399",
  warning:   "#fb923c",
  inquiry:   "#d4a017",
  quotation: "#c084fc",
};

interface Notification {
  id: string; title: string; message: string; type: string;
  is_read: boolean; link?: string; created_at: string;
}

export function Notifications() {
  const [items,   setItems]   = useState<Notification[]>([]);
  const [unread,  setUnread]  = useState(0);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await userNotificationService.getAll({ limit: 50 });
      setItems(res.data.data?.notifications || []);
      setUnread(res.data.data?.unread || 0);
    } catch { setItems([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    if (items.find(n => n.id === id)?.is_read) return;
    try {
      await userNotificationService.markRead(id);
      setItems(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnread(u => Math.max(0, u - 1));
    } catch {}
  };

  const markAllRead = async () => {
    if (unread === 0) return;
    setMarking(true);
    try {
      await userNotificationService.markAllRead();
      setItems(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnread(0);
    } catch {}
    setMarking(false);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)   return "Just now";
    if (mins < 60)  return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)   return `${hrs}h ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-bold">Notifications</h2>
          <p className="text-white/40 text-xs mt-0.5">
            {unread > 0 ? <span><span className="text-[#d4a017] font-semibold">{unread}</span> unread</span> : "All caught up"}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            disabled={marking}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: "rgba(212,160,23,0.1)", color: "#d4a017", border: "1px solid rgba(212,160,23,0.2)" }}
          >
            {marking ? <span className="w-3.5 h-3.5 border border-[#d4a017]/30 border-t-[#d4a017] rounded-full animate-spin" /> : <CheckCheck size={14} />}
            Mark all read
          </button>
        )}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <Bell size={38} className="text-white/15 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No notifications yet</p>
            <p className="text-white/20 text-xs mt-1">We'll notify you about inquiries, quotations, and updates here.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {items.map(notif => {
              const Icon = typeIcon[notif.type] || Info;
              const color = typeColor[notif.type] || "#9ca3af";
              return (
                <div
                  key={notif.id}
                  onClick={() => markRead(notif.id)}
                  className="flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  style={{ background: notif.is_read ? "transparent" : "rgba(212,160,23,0.02)" }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${color}18` }}>
                    <Icon size={16} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-white text-sm font-medium leading-snug">{notif.title}</p>
                      <span className="text-white/25 text-xs whitespace-nowrap shrink-0">{timeAgo(notif.created_at)}</span>
                    </div>
                    <p className="text-white/45 text-xs mt-1 leading-relaxed">{notif.message}</p>
                  </div>
                  {!notif.is_read && (
                    <div className="w-2 h-2 rounded-full shrink-0 mt-2" style={{ background: "#d4a017" }} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
