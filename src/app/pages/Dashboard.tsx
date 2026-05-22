import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { LayoutDashboard, Package, FileText, MessageSquare, Award, BarChart3, LogOut, Globe, TrendingUp, Bell, ChevronRight, Plus, Eye, Edit, Trash2, Download, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { products } from "../data/products";
import { blogPosts } from "../data/blogPosts";

const mockInquiries = [
  { id: 1, name: "James O'Brien", company: "GlobalFoods Ltd.", country: "UK", product: "Turmeric Powder", qty: "5 MT", status: "New", date: "2025-05-12" },
  { id: 2, name: "Ahmed Al-Rashid", company: "AlFarouk Trading", country: "UAE", product: "Cumin Seeds", qty: "2 MT", status: "Replied", date: "2025-05-11" },
  { id: 3, name: "Sarah Chen", company: "Pacific Spice Co.", country: "Singapore", product: "Black Pepper", qty: "1 MT", status: "Quoted", date: "2025-05-10" },
  { id: 4, name: "Lars Andersen", company: "Nordic Foods AB", country: "Sweden", product: "Chilli Powder", qty: "3 MT", status: "New", date: "2025-05-09" },
  { id: 5, name: "Maria Santos", company: "Sabor Brasil", country: "Brazil", product: "Garam Masala", qty: "500 kg", status: "Closed", date: "2025-05-08" },
];

const STATUS_COLORS: Record<string, string> = {
  New: "#22c55e", Replied: "#3b82f6", Quoted: "#d4a017", Closed: "rgba(255,255,255,0.25)",
};

const NAV = [
  { icon: LayoutDashboard, label: "Overview", key: "overview" },
  { icon: MessageSquare, label: "Inquiries", key: "inquiries" },
  { icon: Package, label: "Products", key: "products" },
  { icon: FileText, label: "Blog Posts", key: "blog" },
  { icon: Award, label: "Certificates", key: "certs" },
  { icon: BarChart3, label: "Analytics", key: "analytics" },
];

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) { navigate("/login"); return null; }

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <div className="min-h-screen flex" style={{ background: "#070707" }}>
      {/* Sidebar */}
      <>
        {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)}/>}
        <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
          style={{ background: "#0a0a0a", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          {/* Logo */}
          <div className="p-5 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-[#0a0a0a]" style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)" }}>T</div>
              <div>
                <div className="text-white font-bold text-sm" style={{ letterSpacing: "0.1em" }}>TANZORA</div>
                <div className="text-[#d4a017] text-[8px]" style={{ letterSpacing: "0.25em" }}>EXPORT CO.</div>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/40 hover:text-white"><X size={18}/></button>
          </div>

          {/* User */}
          <div className="p-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[#0a0a0a] text-sm" style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)" }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-sm truncate">{user.name}</div>
                <div className="text-white/35 text-xs truncate">{user.email}</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-1">
            {NAV.map(item => {
              const Icon = item.icon;
              return (
                <button key={item.key} onClick={() => { setActive(item.key); setSidebarOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                  style={active === item.key
                    ? { background: "rgba(212,160,23,0.12)", color: "#d4a017", border: "1px solid rgba(212,160,23,0.2)" }
                    : { color: "rgba(255,255,255,0.45)", border: "1px solid transparent" }}
                >
                  <Icon size={16}/> {item.label}
                  {item.key === "inquiries" && <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold text-[#0a0a0a]" style={{ background: "#22c55e" }}>2</span>}
                </button>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/35 hover:text-white hover:bg-white/5 transition-all mb-1">
              <Globe size={16}/> View Website
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/35 hover:text-red-400 hover:bg-red-500/5 transition-all">
              <LogOut size={16}/> Sign Out
            </button>
          </div>
        </aside>
      </>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-20" style={{ background: "rgba(7,7,7,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-white/50 hover:text-white p-1"><Menu size={20}/></button>
            <h1 className="text-white font-bold text-lg capitalize">{NAV.find(n => n.key === active)?.label || "Dashboard"}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-white/40 hover:text-white transition-colors">
              <Bell size={18}/>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#d4a017]"/>
            </button>
            <Link to="/contact" className="hidden sm:flex px-4 py-2 rounded-xl text-xs font-bold text-[#0a0a0a]" style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)" }}>
              <Plus size={13} className="mr-1"/> New Inquiry
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {active === "overview" && (
            <div>
              <p className="text-white/40 text-sm mb-6">Welcome back, <span className="text-white">{user.name}</span>. Here's your export dashboard overview.</p>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Global Export Company", value: "Established 2026", change: "", icon: Globe, color: "#d4a017" },
                  { label: "Certified Products", value: "Premium Quality", change: "", icon: Award, color: "#22c55e" },
                  { label: "Reliable Logistics", value: "Worldwide Shipping", change: "", icon: Package, color: "#3b82f6" },
                  { label: "Long-Term Partnerships", value: "Customer Focused", change: "", icon: TrendingUp, color: "#a855f7" },
                ].map(stat => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                          <Icon size={18} style={{ color: stat.color }}/>
                        </div>
                      </div>
                      <div className="text-white font-bold text-lg">{stat.value}</div>
                      <div className="text-white/40 text-xs mt-1">{stat.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* Recent Inquiries */}
              <div className="rounded-2xl overflow-hidden mb-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <h2 className="text-white font-semibold text-sm">Recent Inquiries</h2>
                  <button onClick={() => setActive("inquiries")} className="text-[#d4a017] text-xs flex items-center gap-1 hover:gap-2 transition-all">View All <ChevronRight size={12}/></button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      {["Buyer", "Company", "Product", "Qty", "Status", "Date"].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs text-white/30 font-semibold uppercase tracking-wider">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {mockInquiries.slice(0, 4).map(inq => (
                        <tr key={inq.id} className="transition-colors hover:bg-white/2" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td className="px-5 py-3.5 text-white/70 text-xs">{inq.name}</td>
                          <td className="px-5 py-3.5 text-white/45 text-xs">{inq.company}</td>
                          <td className="px-5 py-3.5 text-white/65 text-xs">{inq.product}</td>
                          <td className="px-5 py-3.5 text-white/45 text-xs">{inq.qty}</td>
                          <td className="px-5 py-3.5"><span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: `${STATUS_COLORS[inq.status]}18`, color: STATUS_COLORS[inq.status] }}>{inq.status}</span></td>
                          <td className="px-5 py-3.5 text-white/30 text-xs">{inq.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {active === "inquiries" && (
            <div>
              <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <h2 className="text-white font-semibold text-sm">All Inquiries ({mockInquiries.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      {["Buyer", "Company", "Country", "Product", "Qty", "Status", "Date", "Actions"].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs text-white/30 font-semibold uppercase tracking-wider">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {mockInquiries.map(inq => (
                        <tr key={inq.id} className="transition-colors hover:bg-white/2" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td className="px-5 py-3.5 text-white/70 text-xs">{inq.name}</td>
                          <td className="px-5 py-3.5 text-white/45 text-xs">{inq.company}</td>
                          <td className="px-5 py-3.5 text-white/45 text-xs">{inq.country}</td>
                          <td className="px-5 py-3.5 text-white/65 text-xs">{inq.product}</td>
                          <td className="px-5 py-3.5 text-white/45 text-xs">{inq.qty}</td>
                          <td className="px-5 py-3.5"><span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: `${STATUS_COLORS[inq.status]}18`, color: STATUS_COLORS[inq.status] }}>{inq.status}</span></td>
                          <td className="px-5 py-3.5 text-white/30 text-xs">{inq.date}</td>
                          <td className="px-5 py-3.5"><div className="flex gap-2">
                            <button className="text-white/30 hover:text-[#d4a017] transition-colors"><Eye size={13}/></button>
                            <button className="text-white/30 hover:text-[#22c55e] transition-colors"><Edit size={13}/></button>
                          </div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {active === "products" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="text-white/40 text-sm">{products.length} products in catalog</span>
                <Link to="/products" target="_blank" className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#0a0a0a]" style={{ background:"linear-gradient(135deg,#d4a017,#b8860b)" }}>
                  <Plus size={13}/> View Catalog
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(p => (
                  <div key={p.id} className="rounded-2xl p-5 flex items-center gap-4 transition-all hover:border-[#d4a017]/30"
                    style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)" }}>
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-sm truncate">{p.name}</div>
                      <div className="text-white/35 text-xs">MOQ: {p.moq}</div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link to={`/products/${p.id}`} target="_blank" className="text-white/30 hover:text-[#d4a017] transition-colors"><Eye size={14}/></Link>
                      <button className="text-white/30 hover:text-red-400 transition-colors"><Trash2 size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === "blog" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="text-white/40 text-sm">{blogPosts.length} blog posts</span>
                <Link to="/blog" target="_blank" className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#0a0a0a]" style={{ background:"linear-gradient(135deg,#d4a017,#b8860b)" }}>
                  <Plus size={13}/> New Post
                </Link>
              </div>
              <div className="space-y-3">
                {blogPosts.map(post => (
                  <div key={post.id} className="flex items-center gap-4 rounded-2xl p-4 transition-all" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)" }}>
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-sm truncate">{post.title}</div>
                      <div className="text-white/35 text-xs">{post.category} · {post.readTime} min · {post.date}</div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link to={`/blog/${post.slug}`} target="_blank" className="text-white/30 hover:text-[#d4a017] transition-colors"><Eye size={14}/></Link>
                      <button className="text-white/30 hover:text-[#22c55e] transition-colors"><Edit size={14}/></button>
                      <button className="text-white/30 hover:text-red-400 transition-colors"><Trash2 size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === "certs" && (
            <div>
              <p className="text-white/40 text-sm mb-5">Manage and download your export certificates.</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {["ISO 22000:2018","FSSAI","APEDA","HACCP","Spices Board","GMP Certified"].map(cert => (
                  <div key={cert} className="flex items-center justify-between rounded-2xl p-5 transition-all hover:border-[#d4a017]/30"
                    style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)" }}>
                    <div>
                      <div className="text-white font-semibold text-sm">{cert}</div>
                      <div className="text-white/30 text-xs mt-0.5">Valid & Verified</div>
                    </div>
                    <button className="text-[#d4a017] hover:opacity-80 transition-opacity"><Download size={16}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === "analytics" && (
            <div className="text-center py-24">
              <BarChart3 size={48} className="mx-auto mb-4 text-white/15"/>
              <p className="text-white/30 text-sm">Advanced analytics coming soon.</p>
              <p className="text-white/20 text-xs mt-1">Export volumes, inquiry conversion, country breakdown.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
