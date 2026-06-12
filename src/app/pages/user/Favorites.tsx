import { useState, useEffect } from "react";
import { Heart, Trash2, Package, ExternalLink } from "lucide-react";
import { Link } from "react-router";
import { userFavoriteService } from "../../services/api";

interface FavoriteProduct {
  id: string; title?: string; slug?: string; short_description?: string;
  category?: string; featured_image?: string; status?: string; saved_at: string;
}

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api','') || 'https://import-export-jhik.onrender.com';

export function Favorites() {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [removing,  setRemoving]  = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await userFavoriteService.getAll();
      setFavorites(res.data.data || []);
    } catch { setFavorites([]); }
    setLoading(false);
  };

  const remove = async (productId: string) => {
    setRemoving(productId);
    try {
      await userFavoriteService.remove(productId);
      setFavorites(prev => prev.filter(f => f.id !== productId));
    } catch {}
    setRemoving(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white text-xl font-bold">Saved Products</h2>
        <p className="text-white/40 text-xs mt-0.5">{favorites.length} saved product{favorites.length !== 1 ? "s" : ""}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />)}
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <Heart size={40} className="text-white/15 mb-4" />
          <p className="text-white/30 font-medium mb-1">No saved products yet</p>
          <p className="text-white/20 text-sm mb-4">Browse our catalog and save products you're interested in.</p>
          <Link to="/products" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)", color: "#0a0a0a" }}>
            <Package size={14} /> Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map(fav => (
            <div
              key={fav.id}
              className="rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:scale-[1.01] group"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {/* Image */}
              <div className="relative h-40 overflow-hidden flex-shrink-0" style={{ background: "rgba(255,255,255,0.04)" }}>
                {fav.featured_image ? (
                  <img
                    src={`${API_BASE}/uploads/${fav.featured_image}`}
                    alt={fav.title || "Product"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={32} className="text-white/15" />
                  </div>
                )}
                <button
                  onClick={() => remove(fav.id)}
                  disabled={removing === fav.id}
                  className="absolute top-2 right-2 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  {removing === fav.id
                    ? <span className="w-3.5 h-3.5 border border-red-400/40 border-t-red-400 rounded-full animate-spin block" />
                    : <Trash2 size={13} />}
                </button>
              </div>

              {/* Info */}
              <div className="p-4 flex-1 flex flex-col">
                {fav.category && (
                  <span className="text-[#d4a017] text-[10px] font-semibold uppercase tracking-widest mb-1">{fav.category}</span>
                )}
                <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">{fav.title || "Product"}</h3>
                {fav.short_description && (
                  <p className="text-white/35 text-xs line-clamp-2 flex-1">{fav.short_description}</p>
                )}
                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-white/25 text-[10px]">Saved {new Date(fav.saved_at).toLocaleDateString()}</span>
                  {fav.slug && (
                    <Link to={`/products/${fav.id}`} className="flex items-center gap-1 text-[#d4a017] text-xs hover:underline">
                      View <ExternalLink size={11} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
