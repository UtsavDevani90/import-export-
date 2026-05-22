import { useState } from "react";
import { Link, useParams, Navigate } from "react-router";
import {
  ArrowLeft,
  Package,
  Globe,
  Clock,
  Hash,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  ShieldCheck,
  Truck,
  ChevronRight,
} from "lucide-react";
import { products, categoryLabels } from "../data/products";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const product = products.find((p) => p.id === id);

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    country: "",
    quantity: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  if (!product) return <Navigate to="/products" replace />;

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-stone-500">
          <Link to="/" className="hover:text-amber-600 transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link to="/products" className="hover:text-amber-600 transition-colors">Products</Link>
          <ChevronRight size={14} />
          <span className="text-amber-600">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Back Button */}
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-stone-600 hover:text-amber-700 text-sm mb-7 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Products
        </Link>

        {/* ── Product Top Section ── */}
        <div className="grid lg:grid-cols-2 gap-10 mb-12">
          {/* Images */}
          <div className="space-y-3">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-amber-100 h-80">
              <ImageWithFallback
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[product.image, product.image, product.image].map((img, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden border-2 border-amber-200 h-20 cursor-pointer hover:border-amber-500 transition-colors"
                >
                  <ImageWithFallback
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-amber-500 text-white text-xs px-2.5 py-1 rounded-full">
                {categoryLabels[product.category]}
              </span>
              <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 size={11} /> In Stock
              </span>
            </div>
            <h1 className="text-stone-900 font-bold text-3xl lg:text-4xl mb-3">{product.name}</h1>
            <p className="text-stone-600 text-sm leading-relaxed mb-6">{product.description}</p>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                <div className="flex items-center gap-1.5 text-amber-600 text-xs font-semibold mb-0.5">
                  <Package size={13} /> Min. Order Qty
                </div>
                <div className="text-stone-900 font-bold text-sm">{product.moq}</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                <div className="flex items-center gap-1.5 text-amber-600 text-xs font-semibold mb-0.5">
                  <Globe size={13} /> Origin
                </div>
                <div className="text-stone-900 font-bold text-sm">{product.origin.split(",")[0]}</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                <div className="flex items-center gap-1.5 text-amber-600 text-xs font-semibold mb-0.5">
                  <Clock size={13} /> Shelf Life
                </div>
                <div className="text-stone-900 font-bold text-sm">{product.shelfLife}</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                <div className="flex items-center gap-1.5 text-amber-600 text-xs font-semibold mb-0.5">
                  <Hash size={13} /> HSN Code
                </div>
                <div className="text-stone-900 font-bold text-sm">{product.hsnCode}</div>
              </div>
            </div>

            {/* Packaging */}
            <div className="mb-6">
              <div className="text-stone-700 font-semibold text-sm mb-2">Packaging Options:</div>
              <div className="flex flex-wrap gap-2">
                {product.packaging.map((p) => (
                  <span
                    key={p}
                    className="bg-stone-100 text-stone-600 border border-stone-200 text-xs px-3 py-1.5 rounded-lg"
                  >
                    📦 {p}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <a
                href="#inquiry-form"
                className="flex-1 text-center bg-amber-600 hover:bg-amber-700 text-white px-5 py-3.5 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Send size={16} /> Send Inquiry
              </a>
              <a
                href="https://wa.me/918200197967"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center bg-green-600 hover:bg-green-700 text-white px-5 py-3.5 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Phone size={16} /> WhatsApp
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2">
              {["ISO 22000", "FSSAI", "APEDA", "HACCP"].map((b) => (
                <span
                  key={b}
                  className="bg-stone-900 text-stone-300 text-xs px-2.5 py-1 rounded-full flex items-center gap-1"
                >
                  <ShieldCheck size={11} className="text-amber-400" /> {b}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Specifications & Inquiry ── */}
        <div className="grid lg:grid-cols-2 gap-10 mb-12">
          {/* Specifications Table */}
          <div>
            <h2 className="text-stone-900 font-bold text-xl mb-5">Product Specifications</h2>
            <div className="bg-white rounded-2xl shadow-md border border-amber-100 overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="bg-amber-600">
                    <th className="text-left px-5 py-3 text-white font-semibold text-xs uppercase tracking-wide">Parameter</th>
                    <th className="text-left px-5 py-3 text-white font-semibold text-xs uppercase tracking-wide">Specification</th>
                  </tr>
                  {product.specifications.map((spec, i) => (
                    <tr
                      key={spec.label}
                      className={`${i % 2 === 0 ? "bg-white" : "bg-amber-50"} border-b border-amber-100 last:border-0`}
                    >
                      <td className="px-5 py-3.5 text-stone-600 font-medium text-xs">{spec.label}</td>
                      <td className="px-5 py-3.5 text-stone-900 font-semibold text-xs">{spec.value}</td>
                    </tr>
                  ))}
                  <tr className={`${product.specifications.length % 2 === 0 ? "bg-white" : "bg-amber-50"} border-b border-amber-100`}>
                    <td className="px-5 py-3.5 text-stone-600 font-medium text-xs">Origin</td>
                    <td className="px-5 py-3.5 text-stone-900 font-semibold text-xs">{product.origin}</td>
                  </tr>
                  <tr className={`${(product.specifications.length + 1) % 2 === 0 ? "bg-white" : "bg-amber-50"}`}>
                    <td className="px-5 py-3.5 text-stone-600 font-medium text-xs">Shelf Life</td>
                    <td className="px-5 py-3.5 text-stone-900 font-semibold text-xs">{product.shelfLife}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Shipping Info */}
            <div className="mt-6 bg-stone-900 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Truck size={20} className="text-amber-400" />
                <h3 className="font-bold text-base">Export Shipping</h3>
              </div>
              <div className="space-y-2.5 text-sm text-stone-300">
                {[
                  "Available on FOB, CIF, C&F, EXW terms",
                  "Sea freight (FCL / LCL) and air freight",
                  "7–14 business days lead time",
                  "Phytosanitary + health certificate",
                  "Certificate of Origin (COO)",
                  "Pre-shipment inspection available",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-amber-400 mt-0.5 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          <div id="inquiry-form">
            <h2 className="text-stone-900 font-bold text-xl mb-5">Send Product Inquiry</h2>
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
                <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
                <h3 className="text-stone-900 font-bold text-xl mb-2">Inquiry Sent!</h3>
                <p className="text-stone-600 text-sm mb-4">
                  Thank you for your inquiry about <strong>{product.name}</strong>. Our export team
                  will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl shadow-md border border-amber-100 p-6 space-y-4"
              >
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
                  <Package size={15} />
                  Inquiring about: <strong>{product.name}</strong>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-stone-700 text-xs font-semibold block mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-stone-50"
                    />
                  </div>
                  <div>
                    <label className="text-stone-700 text-xs font-semibold block mb-1">Company *</label>
                    <input
                      type="text"
                      name="company"
                      required
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Company name"
                      className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-stone-50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-stone-700 text-xs font-semibold block mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@company.com"
                      className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-stone-50"
                    />
                  </div>
                  <div>
                    <label className="text-stone-700 text-xs font-semibold block mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 234 567 890"
                      className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-stone-50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-stone-700 text-xs font-semibold block mb-1">Country *</label>
                    <input
                      type="text"
                      name="country"
                      required
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="Your country"
                      className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-stone-50"
                    />
                  </div>
                  <div>
                    <label className="text-stone-700 text-xs font-semibold block mb-1">Quantity Needed</label>
                    <input
                      type="text"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      placeholder="e.g. 1 MT / 500 kg"
                      className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-stone-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-stone-700 text-xs font-semibold block mb-1">Message / Requirements</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Packaging preference, certification requirements, incoterms, etc."
                    className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-stone-50 resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Send size={15} /> Send Inquiry
                  </button>
                  <a
                    href="https://wa.me/918200197967"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone size={15} /> WhatsApp
                  </a>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <Mail size={12} className="text-amber-500" />
                  exports@tanzoraexport.com &nbsp;|&nbsp;
                  <Phone size={12} className="text-amber-500" />
                  +91 8200197967
                </div>
              </form>
            )}
          </div>
        </div>

        {/* ── Related Products ── */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-stone-900 font-bold text-xl mb-6">
              Related <span className="text-amber-600">Products</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedProducts.map((rp) => (
                <div
                  key={rp.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-amber-100 group"
                >
                  <div className="overflow-hidden h-40">
                    <ImageWithFallback
                      src={rp.image}
                      alt={rp.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-stone-900 font-bold text-sm mb-1">{rp.name}</h3>
                    <p className="text-stone-500 text-xs mb-3 line-clamp-2">{rp.shortDescription}</p>
                    <Link
                      to={`/products/${rp.id}`}
                      className="block text-center bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-medium transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
