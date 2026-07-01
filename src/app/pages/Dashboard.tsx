import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router";
import {
  LayoutDashboard, Package, MessageSquare, Users, FileText,
  Globe, Settings, LogOut, Menu, X,
  Newspaper, Activity
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { icon: LayoutDashboard, label: "Overview",      path: "/dashboard" },
  { icon: MessageSquare,   label: "Inquiries",     path: "/dashboard/inquiries" },
  { icon: Package,         label: "Products",      path: "/dashboard/products" },
  { icon: Users,           label: "Buyers",        path: "/dashboard/buyers" },
  { icon: FileText,        label: "Quotations",    path: "/dashboard/quotations" },
  { icon: Newspaper,       label: "CMS",           path: "/dashboard/cms" },
  { icon: Settings,        label: "Settings",      path: "/dashboard/settings" },
  { icon: Activity,        label: "Activity Logs", path: "/dashboard/logs" },
];

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
  }, [user]);

  if (!user) return null;

  const handleLogout = () => { logout(); navigate("/"); };
  const isActive = (path: string) =>
    path === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen flex" style={{ background: "#070707" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ background: "#0a0a0a", borderRight: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Logo */}
        <div
          className="p-5 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Link to="/" className="flex items-center gap-3">
            <img
            src="/logo.png"
            alt="Tanzora Export"
            className="w-12 h-12 rounded-full object-cover border border-[#d4a017]"
            />
            
            <div>
              <div className="text-white font-bold text-sm" style={{ letterSpacing: "0.1em" }}>
                TANZORA
              </div>
              <div className="text-[#d4a017] text-[8px]" style={{ letterSpacing: "0.25em" }}>
                EXPORT CO.
              </div>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/40 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* User */}
        <div className="p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-[#0a0a0a] text-sm shrink-0"
              style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)" }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-sm truncate">{user.name}</div>
              <div className="text-white/35 text-xs capitalize">{user.role || "admin"}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(item => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative"
                style={
                  active
                    ? {
                        background: "rgba(212,160,23,0.12)",
                        color: "#d4a017",
                        border: "1px solid rgba(212,160,23,0.2)",
                      }
                    : { color: "rgba(255,255,255,0.45)", border: "1px solid transparent" }
                }
              >
                <Icon size={16} />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 space-y-1" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/35 hover:text-white hover:bg-white/5 transition-all"
          >
            <Globe size={16} /> View Website
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/35 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-6 py-3.5 sticky top-0 z-20"
          style={{
            background: "rgba(7,7,7,0.96)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-white/50 hover:text-white p-1"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-white font-bold text-base">
                {NAV.find(n => isActive(n.path))?.label || "Dashboard"}
              </h1>
              <p className="text-white/30 text-xs hidden sm:block">Tanzora Export Co. Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
          </div>
        </header>

        {/* Page content via Outlet */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
