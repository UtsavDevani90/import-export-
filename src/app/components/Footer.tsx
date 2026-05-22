import { Link } from "react-router";
import {
  Phone, Mail, MapPin, Globe,
  Facebook, Twitter, Linkedin, Instagram, Youtube,
  ArrowRight, Shield, Award,
} from "lucide-react";

function TanzoraLogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gold-grad-f" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0c040" />
          <stop offset="50%" stopColor="#d4a017" />
          <stop offset="100%" stopColor="#8b6914" />
        </linearGradient>
        <linearGradient id="bg-grad-f" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0f2a1e" />
          <stop offset="100%" stopColor="#071510" />
        </linearGradient>
      </defs>
      <path d="M22 3 L39 12.5 L39 31.5 L22 41 L5 31.5 L5 12.5 Z" fill="url(#bg-grad-f)" stroke="url(#gold-grad-f)" strokeWidth="1.2" />
      <path d="M22 7.5 L35 14.75 L35 29.25 L22 36.5 L9 29.25 L9 14.75 Z" fill="none" stroke="url(#gold-grad-f)" strokeWidth="0.5" opacity="0.4" />
      <rect x="13" y="14" width="18" height="3.5" rx="1" fill="url(#gold-grad-f)" />
      <rect x="19.5" y="14" width="5" height="16" rx="1" fill="url(#gold-grad-f)" />
      <circle cx="22" cy="6" r="1" fill="url(#gold-grad-f)" opacity="0.6" />
      <circle cx="22" cy="38" r="1" fill="url(#gold-grad-f)" opacity="0.6" />
    </svg>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  const products = [
    { name: "Turmeric Powder", id: "turmeric-powder" },
    { name: "Chilli Powder", id: "chilli-powder" },
    { name: "Black Pepper", id: "black-pepper" },
    { name: "Cumin Seeds", id: "cumin-seeds" },
    { name: "Coriander Powder", id: "coriander-powder" },
    { name: "Cloves", id: "cloves" },
    { name: "Cinnamon", id: "cinnamon" },
    { name: "Garam Masala", id: "garam-masala" },
  ];

  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Products", path: "/products" },
    { name: "Contact Us", path: "/contact" },
  ];

  return (
    <footer className="bg-[#050505] text-white/55 relative overflow-hidden">
      {/* Top gold line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4a017]/40 to-transparent" />

      {/* Newsletter Strip */}
      <div className="relative bg-gradient-to-r from-[#0d0d0d] via-[#0f1a12] to-[#0d0d0d] py-12 px-4 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-white font-bold text-xl mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              Get Export Price Lists & Product Catalog
            </h3>
            <p className="text-white/35 text-sm">
              Subscribe to receive monthly offers, new product updates, and export news.
            </p>
          </div>
          <form className="flex gap-2 w-full max-w-sm">
            <input
              type="email"
              placeholder="Your business email"
              className="flex-1 px-4 py-3 rounded-xl text-sm text-white bg-white/5 border border-white/10 outline-none focus:ring-2 focus:ring-[#d4a017]/40 focus:border-[#d4a017]/30 placeholder-white/25 transition-all"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-1.5 shrink-0 transition-all duration-300"
              style={{ background: "linear-gradient(135deg, #d4a017, #b8860b)", color: "#0a0a0a" }}
            >
              Subscribe <ArrowRight size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand Column */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <TanzoraLogoMark size={40} />
            <div>
              <div
                className="text-white font-bold text-base leading-none tracking-widest"
                style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.12em" }}
              >
                TANZORA
              </div>
              <div
                className="text-[#d4a017] text-[9px] font-semibold tracking-[0.3em] uppercase mt-0.5"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                EXPORT CO.
              </div>
            </div>
          </div>
          <p className="text-white/35 text-sm leading-relaxed mb-6">
            Premium Indian spice exporter delivering quality, authenticity, and trust to buyers across 50+ countries worldwide since 2026.
          </p>
          <div className="flex gap-2">
            {[
              { icon: <Facebook size={14} />, href: "#" },
              { icon: <Twitter size={14} />, href: "#" },
              { icon: <Linkedin size={14} />, href: "#" },
              { icon: <Instagram size={14} />, href: "#" },
              { icon: <Youtube size={14} />, href: "#" },
            ].map((s, i) => (
              <a
                key={i}
                href={s.href}
                className="w-9 h-9 bg-white/4 hover:bg-[#d4a017]/15 text-white/35 hover:text-[#d4a017] rounded-xl flex items-center justify-center transition-all duration-300 border border-white/5 hover:border-[#d4a017]/25"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold text-xs mb-5 pb-3 border-b border-white/8 uppercase tracking-[0.2em]">
            Quick Links
          </h4>
          <ul className="space-y-3">
            {quickLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className="text-white/35 hover:text-[#d4a017] text-sm flex items-center gap-2 transition-all duration-300 group"
                >
                  <ArrowRight size={11} className="text-[#d4a017]/40 group-hover:text-[#d4a017] group-hover:translate-x-1 transition-all duration-300" />
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Products */}
        <div>
          <h4 className="text-white font-semibold text-xs mb-5 pb-3 border-b border-white/8 uppercase tracking-[0.2em]">
            Our Products
          </h4>
          <ul className="space-y-3">
            {products.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/products/${p.id}`}
                  className="text-white/35 hover:text-[#d4a017] text-sm flex items-center gap-2 transition-all duration-300 group"
                >
                  <ArrowRight size={11} className="text-[#d4a017]/40 group-hover:text-[#d4a017] group-hover:translate-x-1 transition-all duration-300" />
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold text-xs mb-5 pb-3 border-b border-white/8 uppercase tracking-[0.2em]">
            Contact Info
          </h4>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <MapPin size={15} className="text-[#d4a017] mt-0.5 shrink-0" />
              <span className="text-white/35 text-sm leading-relaxed">
                Town Hall shopping center, 54,<br />Amreli, Gujarat – 365601, India
              </span>
            </li>
            <li className="flex gap-3">
              <Phone size={15} className="text-[#d4a017] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <a href="tel:+918200197967" className="text-white/35 hover:text-[#d4a017] text-sm block transition-colors">+91 8200197967</a>
                <a href="tel:+919876543211" className="text-white/35 hover:text-[#d4a017] text-sm block transition-colors">+91 90235 25746</a>
              </div>
            </li>
            <li className="flex gap-3">
              <Mail size={15} className="text-[#d4a017] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <a href="mailto:exports@tanzoraexport.com" className="text-white/35 hover:text-[#d4a017] text-sm block transition-colors">exports@tanzoraexport.com</a>
                <a href="mailto:info@tanzoraexport.com" className="text-white/35 hover:text-[#d4a017] text-sm block transition-colors">info@tanzoraexport.com</a>
              </div>
            </li>
            <li className="flex gap-3">
              <Globe size={15} className="text-[#d4a017] shrink-0" />
              <a href="#" className="text-white/35 hover:text-[#d4a017] text-sm transition-colors">www.tanzoraexport.com</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Certifications Strip */}
      <div className="border-t border-white/5 py-5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-3">
          {["ISO 22000:2018", "FSSAI", "APEDA", "HACCP", "Spices Board India", "Kosher Certified", "Organic India"].map((cert) => (
            <span key={cert} className="bg-white/3 text-white/25 text-xs px-3.5 py-1.5 rounded-full border border-white/6 flex items-center gap-1.5">
              <Shield size={9} className="text-[#d4a017]/50" /> {cert}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 py-5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/25">
          <p>© {currentYear} Tanzora Export Co. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-[#d4a017] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#d4a017] transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-[#d4a017] transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
