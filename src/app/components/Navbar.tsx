import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Menu, X, Search, Phone, Mail, Shield, Award, ChevronDown, LogIn, LayoutDashboard, LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function TanzoraLogoMark({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ng1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f0c040"/><stop offset="50%" stopColor="#d4a017"/><stop offset="100%" stopColor="#8b6914"/></linearGradient>
        <linearGradient id="ng2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#0f2a1e"/><stop offset="100%" stopColor="#071510"/></linearGradient>
        <filter id="ng3"><feGaussianBlur stdDeviation="1.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <path d="M22 3 L39 12.5 L39 31.5 L22 41 L5 31.5 L5 12.5 Z" fill="url(#ng2)" stroke="url(#ng1)" strokeWidth="1.2"/>
      <path d="M22 7.5 L35 14.75 L35 29.25 L22 36.5 L9 29.25 L9 14.75 Z" fill="none" stroke="url(#ng1)" strokeWidth="0.5" opacity="0.4"/>
      <rect x="13" y="14" width="18" height="3.5" rx="1" fill="url(#ng1)" filter="url(#ng3)"/>
      <rect x="19.5" y="14" width="5" height="16" rx="1" fill="url(#ng1)" filter="url(#ng3)"/>
      <circle cx="22" cy="6" r="1" fill="url(#ng1)" opacity="0.6"/>
      <circle cx="22" cy="38" r="1" fill="url(#ng1)" opacity="0.6"/>
    </svg>
  );
}

const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Products", path: "/products" },
  { label: "Certificates", path: "/certificates" },
  {
    label: "More", path: "#",
    children: [
      { label: "Trade Info", path: "/trade-info" },
      { label: "Quality Control", path: "/quality-control" },
      { label: "Manufacturing", path: "/manufacturing" },
      { label: "Export Process", path: "/export-process" },
      { label: "Industries", path: "/industries" },
      { label: "Sustainability", path: "/sustainability" },
      { label: "FAQ", path: "/faq" },
      { label: "Blog", path: "/blog" },
      { label: "Contact", path: "/contact" },
    ],
  },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setMoreOpen(false); setProfileOpen(false); }, [location.pathname]);

  const isActive = (path: string) =>
    location.pathname === path ||
    (path === "/products" && location.pathname.startsWith("/products")) ||
    (path === "/certificates" && location.pathname === "/certificates") ||
    (path === "/blog" && location.pathname.startsWith("/blog"));

  const isMoreActive = () =>
    NAV_LINKS.find(l => l.children)?.children?.some(c => location.pathname === c.path) ?? false;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false); setSearchQuery("");
    }
  };

  return (
    <>
      {/* Top Info Bar */}
      <div className="bg-[#060606] border-b border-white/5 text-xs py-2 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6 text-white/40">
            <a href="tel:+918200197967" className="flex items-center gap-1.5 hover:text-[#d4a017] transition-colors">
              <Phone size={11} className="text-[#d4a017]/60"/> +91 8200197967
            </a>
            <a href="mailto:exports@tanzoraexport.com" className="flex items-center gap-1.5 hover:text-[#d4a017] transition-colors">
              <Mail size={11} className="text-[#d4a017]/60"/> exports@tanzoraexport.com
            </a>
          </div>
          <div className="flex items-center gap-4 text-white/35">
            <span className="flex items-center gap-1.5"><Shield size={10} className="text-[#d4a017]"/> ISO 22000:2018</span>
            <span className="text-white/15">|</span>
            <span className="flex items-center gap-1.5"><Award size={10} className="text-[#d4a017]"/> APEDA Registered</span>
            <span className="text-white/15">|</span>
            <span>FSSAI Approved</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled ? "bg-[#080808]/96 backdrop-blur-xl shadow-2xl shadow-black/60 border-b border-white/5" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between" style={{ height: 72 }}>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_0_12px_rgba(212,160,23,0.5)]">
                <img 
                src="/logo.png"
                alt="Tanzora Export"
                className="w-12 h-12 object-contain"
                />
              </div>
              <div>
                <div className="font-bold text-base lg:text-lg leading-none text-white group-hover:text-[#f0c040] transition-colors" style={{ letterSpacing:"0.12em" }}>TANZORA</div>
                <div className="text-[#d4a017] text-[9px] font-semibold mt-0.5" style={{ letterSpacing:"0.3em" }}>EXPORT CO.</div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map(link =>
                link.children ? (
                  <div key={link.label} className="relative" onMouseEnter={() => setMoreOpen(true)} onMouseLeave={() => setMoreOpen(false)}>
                    <button
                      onClick={() => setMoreOpen(!moreOpen)}
                      className={`flex items-center gap-1 px-5 py-2.5 text-sm font-medium transition-colors ${isMoreActive() ? "text-[#d4a017]" : "text-white/60 hover:text-white"}`}
                    >
                      {link.label} <ChevronDown size={14} className={`transition-transform duration-300 ${moreOpen ? "rotate-180" : ""}`}/>
                    </button>
                    <div
                      className="absolute top-full left-0 pt-2"
                      style={{
                        pointerEvents: moreOpen ? "auto" : "none",
                        opacity: moreOpen ? 1 : 0,
                        transform: moreOpen ? "translateY(0px)" : "translateY(-8px)",
                        transition: "opacity 0.2s ease, transform 0.2s ease",
                      }}
                    >
                      <div className="w-48 rounded-2xl overflow-hidden shadow-2xl" style={{ background: "rgba(12,12,12,0.97)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        {link.children.map(c => (
                          <Link key={c.path} to={c.path}
                            className={`block px-4 py-2.5 text-sm transition-colors ${
                              location.pathname === c.path ? "text-[#d4a017] bg-white/5" : "text-white/60 hover:text-[#d4a017] hover:bg-white/5"
                            }`}
                          >
                            {c.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link key={link.path} to={link.path}
                    className={`relative px-5 py-2.5 text-sm font-medium transition-all duration-300 group ${isActive(link.path) ? "text-[#d4a017]" : "text-white/60 hover:text-white"}`}
                  >
                    {link.label}
                    <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-gradient-to-r from-transparent via-[#d4a017] to-transparent transition-all duration-500 ${isActive(link.path) ? "w-full" : "w-0 group-hover:w-full"}`}/>
                  </Link>
                )
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2.5 rounded-xl text-white/50 hover:text-[#d4a017] hover:bg-white/5 transition-all">
                <Search size={18}/>
              </button>

              {user ? (
                <div className="relative hidden sm:block">
                  <button onClick={() => setProfileOpen(!profileOpen)} onBlur={() => setTimeout(() => setProfileOpen(false), 200)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 hover:border-[#d4a017]/40 text-white/70 hover:text-white transition-all text-sm"
                  >
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-[#0a0a0a]" style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)" }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    {user.name.split(" ")[0]}
                    <ChevronDown size={13}/>
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl overflow-hidden shadow-2xl" style={{ background: "rgba(12,12,12,0.97)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div className="px-4 py-3 border-b border-white/5">
                        <div className="text-white text-sm font-semibold">{user.name}</div>
                        <div className="text-white/35 text-xs">{user.email}</div>
                      </div>
                      <Link to="/dashboard" className="flex items-center gap-2 px-4 py-3 text-sm text-white/60 hover:text-[#d4a017] hover:bg-white/5 transition-colors">
                        <LayoutDashboard size={14}/> Dashboard
                      </Link>
                      <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-white/60 hover:text-red-400 hover:bg-white/5 transition-colors">
                        <LogOut size={14}/> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 border border-white/10 hover:border-[#d4a017]/40 hover:text-[#d4a017] transition-all">
                  <LogIn size={15}/> Login
                </Link>
              )}

              <Link to="/contact" className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300"
                style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)", color: "#0a0a0a", boxShadow: "0 4px 15px rgba(212,160,23,0.25)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 25px rgba(212,160,23,0.45)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 15px rgba(212,160,23,0.25)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
              >
                Get Quote
              </Link>

              <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2.5 rounded-xl text-white/60 hover:text-[#d4a017] hover:bg-white/5 transition-colors">
                {mobileOpen ? <X size={22}/> : <Menu size={22}/>}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {searchOpen && (
            <div className="pb-4 pt-2">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input autoFocus type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products..." className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#d4a017]/50"/>
                <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#0a0a0a]" style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)" }}>Search</button>
                <button type="button" onClick={() => setSearchOpen(false)} className="px-3 py-2 text-white/40 hover:text-white"><X size={18}/></button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-[#080808]/98 backdrop-blur-xl border-t border-white/5">
            <div className="px-4 py-5 space-y-1">
              <Link to="/" className="block px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">Home</Link>
              <Link to="/about" className="block px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">About</Link>
              <Link to="/products" className="block px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">Products</Link>
              <Link to="/certificates" className="block px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">Certificates</Link>
              <Link to="/trade-info" className="block px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">Trade Info</Link>
              <Link to="/quality-control" className="block px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">Quality Control</Link>
              <Link to="/manufacturing" className="block px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">Manufacturing</Link>
              <Link to="/export-process" className="block px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">Export Process</Link>
              <Link to="/industries" className="block px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">Industries</Link>
              <Link to="/sustainability" className="block px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">Sustainability</Link>
              <Link to="/faq" className="block px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">FAQ</Link>
              <Link to="/blog" className="block px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">Blog</Link>
              <Link to="/contact" className="block px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">Contact</Link>
              {user ? (
                <>
                  <Link to="/dashboard" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-[#d4a017] hover:bg-white/5 transition-colors"><LayoutDashboard size={14}/> Dashboard</Link>
                  <button onClick={logout} className="w-full text-left flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-white/5 transition-colors"><LogOut size={14}/> Sign Out</button>
                </>
              ) : (
                <Link to="/login" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-white/70 hover:text-[#d4a017] hover:bg-white/5 transition-colors"><LogIn size={14}/> Login / Register</Link>
              )}
              <div className="pt-2">
                <Link to="/contact" className="block w-full text-center py-3.5 rounded-xl font-bold text-sm text-[#0a0a0a]" style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)" }}>Get Export Quote</Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
