import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { Search, Clock, Tag, TrendingUp, ArrowRight, Calendar } from "lucide-react";
import { blogPosts, blogCategories } from "../data/blogPosts";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

function AnimatedDiv({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} style={{ transition:`all 0.7s ease ${delay}ms`, opacity: isVisible?1:0, transform: isVisible?"translateY(0)":"translateY(28px)" }}>
      {children}
    </div>
  );
}

export function Blog() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState("All");

  const filtered = blogPosts.filter(p => {
    const matchCat = category === "All" || p.category === category;
    const q = query.toLowerCase();
    const matchQ = !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
    return matchCat && matchQ;
  });

  const featured = blogPosts.find(p => p.featured);
  const trending = blogPosts.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Hero */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0" style={{ background:"radial-gradient(ellipse at 50% 0%,rgba(212,160,23,0.07) 0%,transparent 60%)" }}/>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background:"rgba(212,160,23,0.1)", border:"1px solid rgba(212,160,23,0.25)", color:"#d4a017" }}>
            <TrendingUp size={12}/> Export Industry Blog
          </div>
          <h1 className="text-white text-4xl lg:text-5xl font-bold mb-5" style={{ fontFamily:"'Playfair Display',serif" }}>
            Spice Export <span style={{ background:"linear-gradient(135deg,#d4a017,#f0c040)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Insights</span>
          </h1>
          <p className="text-white/50 text-base max-w-xl mx-auto mb-8">
            Market trends, export guides, packaging standards, and industry news for global spice importers and distributors.
          </p>
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"/>
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search articles..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#d4a017]/50 transition-all"
              style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)" }}/>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featured && !query && category === "All" && (
        <section className="px-4 pb-12">
          <div className="max-w-6xl mx-auto">
            <AnimatedDiv>
              <Link to={`/blog/${featured.slug}`} className="group block rounded-3xl overflow-hidden relative" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)" }}>
                <div className="grid lg:grid-cols-2">
                  <div className="relative h-64 lg:h-80 overflow-hidden">
                    <ImageWithFallback src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                    <div className="absolute inset-0" style={{ background:"linear-gradient(to right,rgba(8,8,8,0.3),transparent)" }}/>
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold text-[#0a0a0a]" style={{ background:"linear-gradient(135deg,#d4a017,#b8860b)" }}>Featured</div>
                  </div>
                  <div className="p-8 lg:p-10 flex flex-col justify-center">
                    <span className="text-[#d4a017] text-xs font-semibold uppercase tracking-wider mb-3">{featured.category}</span>
                    <h2 className="text-white text-2xl font-bold mb-3 group-hover:text-[#d4a017] transition-colors" style={{ fontFamily:"'Playfair Display',serif" }}>{featured.title}</h2>
                    <p className="text-white/50 text-sm leading-relaxed mb-5">{featured.excerpt}</p>
                    <div className="flex items-center gap-4 text-white/35 text-xs mb-5">
                      <span className="flex items-center gap-1"><Calendar size={12}/>{new Date(featured.date).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</span>
                      <span className="flex items-center gap-1"><Clock size={12}/>{featured.readTime} min read</span>
                    </div>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color:"#d4a017" }}>
                      Read Article <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                    </span>
                  </div>
                </div>
              </Link>
            </AnimatedDiv>
          </div>
        </section>
      )}

      {/* Category Filter */}
      <section className="px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-2 flex-wrap">
            {blogCategories.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
                style={category === cat
                  ? { background:"linear-gradient(135deg,#d4a017,#b8860b)", color:"#0a0a0a" }
                  : { background:"rgba(255,255,255,0.04)", color:"rgba(255,255,255,0.55)", border:"1px solid rgba(255,255,255,0.1)" }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Grid + Sidebar */}
      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Articles Grid */}
          <div className="lg:col-span-2">
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-white/40">
                <Search size={40} className="mx-auto mb-3 opacity-30"/>
                <p className="text-lg font-medium mb-1">No articles found</p>
                <p className="text-sm">Try a different keyword or category.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-5">
                {filtered.filter(p => !(p.featured && !query && category === "All")).map((post, i) => (
                  <AnimatedDiv key={post.id} delay={i * 60}>
                    <Link to={`/blog/${post.slug}`} className="group block rounded-2xl overflow-hidden transition-all duration-400 hover:-translate-y-1.5"
                      style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", boxShadow:"0 0 0 rgba(212,160,23,0)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow="0 12px 40px rgba(212,160,23,0.08)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow="0 0 0 rgba(212,160,23,0)"}
                    >
                      <div className="relative h-44 overflow-hidden">
                        <ImageWithFallback src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600"/>
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-[#0a0a0a]" style={{ background:"linear-gradient(135deg,#d4a017,#b8860b)" }}>{post.category}</div>
                      </div>
                      <div className="p-5">
                        <h3 className="text-white font-bold text-sm mb-2 line-clamp-2 group-hover:text-[#d4a017] transition-colors leading-snug" style={{ fontFamily:"'Playfair Display',serif" }}>{post.title}</h3>
                        <p className="text-white/40 text-xs mb-4 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-white/30 text-xs">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-[#0a0a0a]" style={{ background:"linear-gradient(135deg,#d4a017,#b8860b)" }}>{post.author.avatar}</div>
                            <span>{post.author.name}</span>
                          </div>
                          <span className="flex items-center gap-1 text-white/30 text-xs"><Clock size={11}/>{post.readTime}m</span>
                        </div>
                      </div>
                    </Link>
                  </AnimatedDiv>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending */}
            <div className="rounded-2xl p-5" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)" }}>
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <TrendingUp size={14} className="text-[#d4a017]"/> Trending Posts
              </h3>
              <div className="space-y-4">
                {trending.map((post, i) => (
                  <Link key={post.id} to={`/blog/${post.slug}`} className="flex gap-3 group">
                    <span className="text-2xl font-black text-white/10 w-6 shrink-0 leading-none mt-0.5">0{i+1}</span>
                    <div>
                      <p className="text-white/65 text-xs font-medium leading-snug group-hover:text-[#d4a017] transition-colors line-clamp-2">{post.title}</p>
                      <p className="text-white/25 text-xs mt-1">{post.readTime} min read</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="rounded-2xl p-5" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)" }}>
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <Tag size={14} className="text-[#d4a017]"/> Popular Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(blogPosts.flatMap(p => p.tags))).map(tag => (
                  <button key={tag} onClick={() => setQuery(tag)}
                    className="text-xs px-3 py-1.5 rounded-full text-white/45 transition-all hover:text-[#d4a017] hover:border-[#d4a017]/40"
                    style={{ border:"1px solid rgba(255,255,255,0.1)" }}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="rounded-2xl p-6 text-center" style={{ background:"rgba(212,160,23,0.05)", border:"1px solid rgba(212,160,23,0.15)" }}>
              <div className="text-3xl mb-3">📦</div>
              <h3 className="text-white font-bold text-sm mb-2" style={{ fontFamily:"'Playfair Display',serif" }}>Ready to Export?</h3>
              <p className="text-white/40 text-xs mb-4">Get a free sample and export quote today.</p>
              <Link to="/contact" className="block py-3 rounded-xl text-xs font-bold text-[#0a0a0a] text-center" style={{ background:"linear-gradient(135deg,#d4a017,#b8860b)" }}>
                Get Free Quote
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
