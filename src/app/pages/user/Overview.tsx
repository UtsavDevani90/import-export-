import { useState, useEffect } from "react";
import { Link } from "react-router";
import { MessageSquare, FileText, Heart, Bell, ArrowRight, Clock, CheckCircle, AlertCircle, Package } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { userInquiryService, userQuotationService, userFavoriteService, userNotificationService } from "../../services/api";

interface Stat { label: string; value: number | string; icon: React.ElementType; color: string; link: string; }

const statusColor: Record<string, string> = {
  new:     "#d4a017",
  read:    "#60a5fa",
  replied: "#34d399",
  closed:  "#9ca3af",
  spam:    "#ef4444",
};

export function Overview() {
  const { user } = useAuth();
  const [stats, setStats]         = useState({ inquiries: 0, quotations: 0, favorites: 0, unread: 0 });
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [inqRes, quotRes, favRes, notifRes] = await Promise.allSettled([
          userInquiryService.getAll({ limit: 5 }),
          userQuotationService.getAll({ limit: 1 }),
          userFavoriteService.getAll(),
          userNotificationService.getAll({ unread: 'true', limit: 1 }),
        ]);

        if (inqRes.status === 'fulfilled') {
          setInquiries(inqRes.value.data.data?.inquiries || []);
          setStats(prev => ({ ...prev, inquiries: inqRes.value.data.data?.total || 0 }));
        }
        if (quotRes.status === 'fulfilled') {
          setStats(prev => ({ ...prev, quotations: quotRes.value.data.data?.total || 0 }));
        }
        if (favRes.status === 'fulfilled') {
          setStats(prev => ({ ...prev, favorites: (favRes.value.data.data || []).length }));
        }
        if (notifRes.status === 'fulfilled') {
          setStats(prev => ({ ...prev, unread: notifRes.value.data.data?.unread || 0 }));
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const STATS: Stat[] = [
    { label: "My Inquiries",  value: stats.inquiries,  icon: MessageSquare, color: "#d4a017", link: "/user/inquiries" },
    { label: "Quotations",    value: stats.quotations, icon: FileText,      color: "#60a5fa", link: "/user/quotations" },
    { label: "Saved Products",value: stats.favorites,  icon: Heart,         color: "#f472b6", link: "/user/favorites" },
    { label: "Notifications", value: stats.unread,     icon: Bell,          color: "#34d399", link: "/user/notifications" },
  ];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-white text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
          {greeting()}, {user?.name?.split(" ")[0]} 👋
        </h2>
        <p className="text-white/40 text-sm mt-1">Here's what's happening with your account today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(s => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              to={s.link}
              className="rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 hover:scale-[1.02] group"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18` }}>
                  <Icon size={18} style={{ color: s.color }} />
                </div>
                <ArrowRight size={14} className="text-white/20 group-hover:text-white/60 transition-colors" />
              </div>
              {loading
                ? <div className="h-7 w-12 rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,0.06)" }} />
                : <div className="text-white text-2xl font-bold">{s.value}</div>}
              <div className="text-white/40 text-xs font-medium">{s.label}</div>
            </Link>
          );
        })}
      </div>

      {/* Recent Inquiries */}
      <div className="rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <h3 className="text-white font-semibold text-sm">Recent Inquiries</h3>
          <Link to="/user/inquiries" className="text-[#d4a017] text-xs hover:underline flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />)}
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare size={32} className="text-white/15 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No inquiries yet.</p>
            <Link to="/contact" className="text-[#d4a017] text-sm hover:underline mt-2 inline-block">Submit your first inquiry →</Link>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {inquiries.map((inq: any) => (
              <div key={inq.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${statusColor[inq.status] || '#9ca3af'}18` }}>
                  {inq.status === 'replied' || inq.status === 'closed'
                    ? <CheckCircle size={14} style={{ color: statusColor[inq.status] }} />
                    : <Clock size={14} style={{ color: statusColor[inq.status] || '#9ca3af' }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{inq.subject || inq.product || "General Inquiry"}</div>
                  <div className="text-white/30 text-xs">{new Date(inq.created_at).toLocaleDateString()}</div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full capitalize font-medium" style={{ background: `${statusColor[inq.status] || '#9ca3af'}18`, color: statusColor[inq.status] || '#9ca3af' }}>
                  {inq.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Submit Inquiry",   desc: "Get a quote on products",     link: "/user/inquiries",   icon: MessageSquare, color: "#d4a017" },
          { label: "Browse Products",  desc: "Explore our catalog",          link: "/products",          icon: Package,       color: "#60a5fa" },
          { label: "My Certificates",  desc: "Download quality certs",       link: "/user/certificates", icon: AlertCircle,   color: "#34d399" },
        ].map(a => {
          const Icon = a.icon;
          return (
            <Link
              key={a.label}
              to={a.link}
              className="rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 hover:scale-[1.02] group"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${a.color}18` }}>
                <Icon size={18} style={{ color: a.color }} />
              </div>
              <div>
                <div className="text-white text-sm font-semibold">{a.label}</div>
                <div className="text-white/35 text-xs">{a.desc}</div>
              </div>
              <ArrowRight size={14} className="text-white/20 group-hover:text-white/60 transition-colors ml-auto" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
