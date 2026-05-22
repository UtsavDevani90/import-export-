import { useState, useEffect } from "react";
import { MessageCircle, X, Phone, ChevronRight, Send } from "lucide-react";

const WA_NUMBER = "918200197967";

const templates = [
  "Hello, I want to inquire about Turmeric Powder export pricing and availability.",
  "Hi, I need bulk Cumin Seeds. Please share FOB price, MOQ, and specifications.",
  "Hello, please share your complete product catalog and export capabilities.",
  "Hi, I want a sample of Black Pepper (Malabar). Please advise on courier charges.",
  "Hello, I need a CIF quote for Chilli Powder to [my country]. Please contact me.",
];

export function FloatingWhatsApp() {
  const [open, setOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState("");
  const [showBadge, setShowBadge] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowBadge(false), 5000);
    return () => clearTimeout(t);
  }, []);

  const sendWA = (msg: string) => {
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  return (
    <>
      {/* Enquire Now Strip */}
      <div className="fixed bottom-[88px] right-4 z-[99] hidden md:block">
        <button
          onClick={() => setOpen(true)}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold text-[#0a0a0a] shadow-xl transition-all duration-300"
          style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)", boxShadow: "0 4px 20px rgba(212,160,23,0.4)" }}
        >
          <Phone size={13} />
          Enquire Now
          <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-4 z-[100]">
        {/* Notification Badge */}
        {showBadge && !open && (
          <div className="absolute -top-10 right-0 bg-[#111] border border-white/10 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap shadow-xl animate-bounce">
            💬 Chat with us on WhatsApp
          </div>
        )}

        {/* Main FAB */}
        <button
          onClick={() => { setOpen(!open); setShowBadge(false); }}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-500"
          style={{
            background: open ? "#1a1a1a" : "linear-gradient(135deg,#25d366,#128c7e)",
            boxShadow: open ? "none" : "0 4px 24px rgba(37,211,102,0.45)",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
          }}
          title="WhatsApp Inquiry"
        >
          {open ? <X size={22} /> : <MessageCircle size={24} fill="white" />}
        </button>
      </div>

      {/* WhatsApp Panel */}
      {open && (
        <div
          className="fixed bottom-24 right-4 z-[99] w-80 rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: "rgba(10,10,10,0.97)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Header */}
          <div className="p-4 flex items-center gap-3" style={{ background: "linear-gradient(135deg,#128c7e,#075e54)" }}>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">🌿</div>
            <div>
              <div className="text-white font-bold text-sm">Tanzora Export</div>
              <div className="text-green-200 text-xs flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse" /> Online – typically replies fast
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-white/60 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
            <p className="text-white/50 text-xs text-center">Choose a quick inquiry template:</p>
            {templates.map((t, i) => (
              <button
                key={i}
                onClick={() => sendWA(t)}
                className="w-full text-left text-xs text-white/80 bg-white/5 hover:bg-[#25d366]/10 hover:text-white border border-white/8 hover:border-[#25d366]/40 rounded-xl px-3 py-2.5 transition-all duration-200"
              >
                {t}
              </button>
            ))}
          </div>

          {/* Custom Message */}
          <div className="p-4 border-t border-white/8">
            <p className="text-white/40 text-xs mb-2">Or type your own message:</p>
            <div className="flex gap-2">
              <input
                value={customMsg}
                onChange={e => setCustomMsg(e.target.value)}
                onKeyDown={e => e.key === "Enter" && customMsg.trim() && sendWA(customMsg)}
                placeholder="Type message..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none focus:border-[#25d366]/50"
              />
              <button
                onClick={() => customMsg.trim() && sendWA(customMsg)}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                style={{ background: customMsg.trim() ? "#25d366" : "rgba(255,255,255,0.05)" }}
              >
                <Send size={14} className={customMsg.trim() ? "text-white" : "text-white/30"} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
