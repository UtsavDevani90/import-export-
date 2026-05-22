import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { Search, Filter, Package, Globe, ChevronRight, X } from "lucide-react";
import { products, categoryLabels, type Product } from "../data/products";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const heroImage =
  "https://images.unsplash.com/photo-1768729341078-9da4e0ea959e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBzcGljZXMlMjBjb2xvcmZ1bCUyMHR1cm1lcmljJTIwZXhwb3J0fGVufDF8fHx8MTc3ODU3NDg5OHww&ixlib=rb-4.1.0&q=80&w=1080";

type Category = Product["category"] | "all";

const categories: { value: Category; label: string; emoji: string }[] = [
  { value: "all", label: "All Products", emoji: "🌶" },
  { value: "whole-spices", label: "Whole Spices", emoji: "🫙" },
  { value: "powder-spices", label: "Powder Spices", emoji: "🟡" },
  { value: "seeds", label: "Seeds", emoji: "🌱" },
  { value: "masala", label: "Masala Products", emoji: "🍛" },
];

export function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    setSearchQuery(urlSearch);
  }, [searchParams]);

  useEffect(() => {
    let result = products;
    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.origin.toLowerCase().includes(q) ||
          categoryLabels[p.category].toLowerCase().includes(q)
      );
    }
    setFilteredProducts(result);
  }, [activeCategory, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ search: searchQuery });
    } else {
      setSearchParams({});
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchParams({});
  };

  return (
    <div className="min-h-screen">
      {/* ── Page Header ── */}
      <div className="relative bg-stone-900 py-20 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={heroImage}
            alt="Products Hero"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-block bg-amber-500/20 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide mb-4">
            Our Product Range
          </div>
          <h1 className="text-white font-bold text-4xl lg:text-5xl mb-4">
            Premium Export Spices
          </h1>
          <p className="text-stone-400 text-base max-w-xl mx-auto">
            ISO 22000 certified, farm-to-export quality spices available for international buyers.
          </p>
          <div className="flex justify-center gap-2 mt-5 text-sm text-stone-400">
            <Link to="/" className="hover:text-amber-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-amber-400">Products</span>
          </div>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="bg-white border-b border-stone-200 sticky top-16 lg:top-20 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search spices..."
                className="w-full pl-9 pr-9 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-stone-50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X size={14} />
                </button>
              )}
            </form>

            {/* Result count */}
            <div className="text-stone-500 text-sm shrink-0">
              <span className="text-amber-600 font-bold">{filteredProducts.length}</span> products found
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.value
                    ? "bg-amber-600 text-white shadow-md"
                    : "bg-stone-100 text-stone-600 hover:bg-amber-50 hover:text-amber-700"
                }`}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Products Grid ── */}
      <section className="py-12 px-4 bg-amber-50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-stone-700 font-bold text-xl mb-2">No products found</h3>
              <p className="text-stone-500 text-sm mb-5">
                Try searching with a different keyword or clear the filters.
              </p>
              <button
                onClick={() => { setSearchQuery(""); setActiveCategory("all"); setSearchParams({}); }}
                className="bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Bulk Inquiry CTA ── */}
      <section className="py-12 px-4 bg-stone-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-white font-bold text-2xl mb-3">
            Need a Custom Spice Blend or Private Label?
          </h2>
          <p className="text-stone-400 text-sm mb-6">
            We offer custom formulations, private-label packaging, and contract manufacturing for
            food brands and distributors.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-7 py-3.5 rounded-xl font-medium text-sm transition-colors"
          >
            Send Bulk Inquiry <ChevronRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const categoryColors: Record<Product["category"], string> = {
    "whole-spices": "bg-amber-500",
    "powder-spices": "bg-orange-500",
    seeds: "bg-green-600",
    masala: "bg-red-600",
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-amber-100 group flex flex-col">
      <div className="relative overflow-hidden h-44">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className={`${categoryColors[product.category]} text-white text-xs px-2.5 py-1 rounded-full`}>
            {categoryLabels[product.category]}
          </span>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-stone-900 font-bold text-base mb-1.5 group-hover:text-amber-700 transition-colors">
          {product.name}
        </h3>
        <p className="text-stone-500 text-xs mb-3 flex-1 line-clamp-2">{product.shortDescription}</p>
        <div className="flex flex-col gap-1.5 mb-4 text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <Package size={12} className="text-amber-500" />
            <span>MOQ: {product.moq}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe size={12} className="text-amber-500" />
            <span>{product.origin.split(",")[0]}</span>
          </div>
        </div>
        <div className="flex gap-2 mt-auto">
          <Link
            to={`/products/${product.id}`}
            className="flex-1 text-center bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors"
          >
            View Details
          </Link>
          <Link
            to="/contact"
            className="flex-1 text-center bg-amber-600 hover:bg-amber-700 text-white px-3 py-2.5 rounded-xl text-xs font-medium transition-colors"
          >
            Send Inquiry
          </Link>
        </div>
      </div>
    </div>
  );
}
