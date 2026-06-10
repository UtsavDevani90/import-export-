import { useState, useEffect } from "react";
import {
  Search, Plus, Edit2, Trash2, X, Loader2,
  AlertCircle, Package, CheckCircle
} from "lucide-react";
import { productService } from "../../services/api";

// ── Types ──────────────────────────────────────────────────
interface Product {
  _id: string;
  title: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  origin?: string;
  moq?: string;
  status?: string;
  image?: string;
  imageUrl?: string;
  published?: boolean;
}

// ── Form Modal ─────────────────────────────────────────────
const CATEGORIES = [
  "Spices", "Pulses", "Cereals", "Oilseeds", "Dry Fruits",
  "Vegetables", "Fruits", "Sugar & Jaggery", "Cotton", "Other"
];

function ProductModal({
  product, onClose, onSaved,
}: {
  product: Product | null; onClose: () => void; onSaved: () => void;
}) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    title: product?.title || "",
    shortDescription: product?.shortDescription || "",
    description: product?.description || "",
    category: product?.category || "",
    origin: product?.origin || "",
    moq: product?.moq || "",
    status: product?.status || "In Stock",
  });
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(product?.imageUrl || product?.image || null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.category) e.category = "Category is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFile = (f: File | null) => {
    setFile(f);
    if (f) setFilePreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    setApiError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append("image", file);
      if (isEdit) await productService.update(product!._id, fd);
      else await productService.create(fd);
      onSaved();
      onClose();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setApiError(err.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all";
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" };
  const inputErrStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(239,68,68,0.4)" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-2xl overflow-hidden"
        style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)" }}>
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <h2 className="text-white font-bold text-base">{isEdit ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {apiError && (
            <div className="flex items-center gap-2 text-red-400 text-sm p-3 rounded-xl"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle size={14} /> {apiError}
            </div>
          )}

          {/* Image */}
          <div>
            <label className="block text-white/50 text-xs font-medium mb-2">Product Image</label>
            <div
              className="relative rounded-xl overflow-hidden"
              style={{ border: "2px dashed rgba(212,160,23,0.25)" }}
            >
              {filePreview ? (
                <div className="relative h-40">
                  <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => { setFile(null); setFilePreview(null); }}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 cursor-pointer group">
                  <Package size={24} className="text-white/20 group-hover:text-[#d4a017] transition-colors mb-2" />
                  <p className="text-white/25 text-xs">Click to upload image</p>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => handleFile(e.target.files?.[0] || null)} />
                </label>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-white/50 text-xs font-medium mb-1.5">Product Title *</label>
            <input value={form.title} onChange={e => set("title", e.target.value)}
              placeholder="e.g. Organic Turmeric Powder"
              className={inputCls} style={errors.title ? inputErrStyle : inputStyle} />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-white/50 text-xs font-medium mb-1.5">Short Description</label>
            <input value={form.shortDescription} onChange={e => set("shortDescription", e.target.value)}
              placeholder="Brief one-line description"
              className={inputCls} style={inputStyle} />
          </div>

          {/* Description */}
          <div>
            <label className="block text-white/50 text-xs font-medium mb-1.5">Full Description</label>
            <textarea rows={4} value={form.description} onChange={e => set("description", e.target.value)}
              placeholder="Detailed product description…"
              className={`${inputCls} resize-none`} style={inputStyle} />
          </div>

          {/* Category + Origin */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/50 text-xs font-medium mb-1.5">Category *</label>
              <select value={form.category} onChange={e => set("category", e.target.value)}
                className={inputCls} style={errors.category ? inputErrStyle : inputStyle}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
            </div>
            <div>
              <label className="block text-white/50 text-xs font-medium mb-1.5">Origin</label>
              <input value={form.origin} onChange={e => set("origin", e.target.value)}
                placeholder="e.g. Gujarat, India"
                className={inputCls} style={inputStyle} />
            </div>
          </div>

          {/* MOQ + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/50 text-xs font-medium mb-1.5">MOQ</label>
              <input value={form.moq} onChange={e => set("moq", e.target.value)}
                placeholder="e.g. 25 MT"
                className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="block text-white/50 text-xs font-medium mb-1.5">Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)}
                className={inputCls} style={inputStyle}>
                <option value="In Stock">In Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end gap-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)", color: "#0a0a0a" }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            {isEdit ? "Update" : "Create"} Product
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm ─────────────────────────────────────────
function DeleteConfirm({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative rounded-2xl p-6 w-full max-w-sm text-center"
        style={{ background: "#0a0a0a", border: "1px solid rgba(239,68,68,0.25)" }}>
        <Trash2 size={32} className="mx-auto mb-3" style={{ color: "#ef4444" }} />
        <h3 className="text-white font-bold text-base mb-1">Delete Product?</h3>
        <p className="text-white/45 text-sm mb-5">
          Are you sure you want to delete <strong className="text-white/70">{name}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all">
            Cancel
          </button>
          <button
            onClick={async () => { setLoading(true); await onConfirm(); setLoading(false); }}
            disabled={loading}
            className="px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
            style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────
export function DashboardProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [modalProduct, setModalProduct] = useState<Product | null | "new">(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const fetchProducts = () => {
    setLoading(true);
    productService.getAllAdmin({ search: search || undefined })
      .then(r => { setProducts(r.data?.data?.products || r.data?.data || r.data || []); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  };

  useEffect(() => { fetchProducts(); }, [search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await productService.delete(deleteTarget._id);
    setDeleteTarget(null);
    fetchProducts();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-white text-2xl font-bold">Products</h2>
          <p className="text-white/35 text-sm mt-0.5">{products.length} products</p>
        </div>
        <button
          onClick={() => setModalProduct("new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: "linear-gradient(135deg,#d4a017,#b8860b)", color: "#0a0a0a" }}
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25 outline-none"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm p-4 rounded-xl"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle size={16} /> Failed to load products.
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Image", "Title", "Category", "Origin", "MOQ", "Status", "Actions"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "rgba(255,255,255,0.3)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded animate-pulse"
                          style={{ background: "rgba(255,255,255,0.06)", width: j === 0 ? "40px" : "70%" }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-white/30">
                  No products found. <button onClick={() => setModalProduct("new")}
                    className="text-[#d4a017] hover:underline">Add the first one</button>
                </td></tr>
              ) : (
                products.map(p => (
                  <tr key={p._id} className="hover:bg-white/[0.02] transition-colors"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td className="px-5 py-3">
                      {(p.imageUrl || p.image) ? (
                        <img src={p.imageUrl || p.image} alt={p.title}
                          className="w-10 h-10 rounded-xl object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: "rgba(212,160,23,0.1)" }}>
                          <Package size={16} style={{ color: "#d4a017" }} />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-white font-medium max-w-[180px] truncate">{p.title}</div>
                      {p.shortDescription && (
                        <div className="text-white/35 text-xs mt-0.5 max-w-[180px] truncate">{p.shortDescription}</div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-white/55">{p.category || "—"}</td>
                    <td className="px-5 py-3 text-white/55">{p.origin || "—"}</td>
                    <td className="px-5 py-3 text-white/55">{p.moq || "—"}</td>
                    <td className="px-5 py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={p.status === "In Stock"
                          ? { background: "rgba(34,197,94,0.12)", color: "#22c55e" }
                          : { background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>
                        {p.status || "In Stock"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setModalProduct(p)}
                          className="p-1.5 rounded-lg text-white/35 hover:text-[#d4a017] hover:bg-[#d4a017]/10 transition-all">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteTarget(p)}
                          className="p-1.5 rounded-lg text-white/35 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {modalProduct !== null && (
        <ProductModal
          product={modalProduct === "new" ? null : modalProduct}
          onClose={() => setModalProduct(null)}
          onSaved={fetchProducts}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          name={deleteTarget.title}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
