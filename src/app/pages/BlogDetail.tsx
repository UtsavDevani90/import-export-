import { Link, useParams, Navigate } from "react-router";
import { ArrowLeft, Clock, Calendar, Tag, Share2, ArrowRight } from "lucide-react";
import { blogPosts } from "../data/blogPosts";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find(p => p.slug === slug);
  if (!post) return <Navigate to="/blog" replace />;

  const related = blogPosts.filter(p => p.id !== post.id && p.category === post.category).slice(0, 3);
  const paragraphs = post.content.split("\n\n");

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Hero */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <ImageWithFallback src={post.image} alt={post.title} className="w-full h-full object-cover"/>
        <div className="absolute inset-0" style={{ background:"linear-gradient(to bottom, rgba(8,8,8,0.3) 0%, rgba(8,8,8,0.85) 100%)" }}/>
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-4xl mx-auto px-4 pb-10 w-full">
            <div className="flex items-center gap-3 mb-4">
              <Link to="/blog" className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors">
                <ArrowLeft size={15}/> Blog
              </Link>
              <span className="text-white/20">/</span>
              <span className="text-[#d4a017] text-xs font-semibold">{post.category}</span>
            </div>
            <h1 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold max-w-3xl" style={{ fontFamily:"'Playfair Display',serif" }}>{post.title}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Article */}
          <div className="lg:col-span-2">
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-white/40 text-xs mb-8 pb-6" style={{ borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-[#0a0a0a]" style={{ background:"linear-gradient(135deg,#d4a017,#b8860b)" }}>{post.author.avatar}</div>
                <div>
                  <div className="text-white/70 font-medium">{post.author.name}</div>
                  <div className="text-white/30">{post.author.role}</div>
                </div>
              </div>
              <span className="flex items-center gap-1"><Calendar size={12}/>{new Date(post.date).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</span>
              <span className="flex items-center gap-1"><Clock size={12}/>{post.readTime} min read</span>
              <button className="flex items-center gap-1 hover:text-[#d4a017] transition-colors ml-auto">
                <Share2 size={13}/> Share
              </button>
            </div>

            {/* Article Body */}
            <div className="prose prose-invert max-w-none">
              {paragraphs.map((para, i) => {
                if (para.startsWith("**") && para.includes("**")) {
                  const parts = para.split(/\*\*(.*?)\*\*/g);
                  return (
                    <p key={i} className="text-white/70 text-base leading-relaxed mb-5">
                      {parts.map((part, j) => j % 2 === 1
                        ? <strong key={j} className="text-white font-semibold">{part}</strong>
                        : part
                      )}
                    </p>
                  );
                }
                if (para.match(/^\d+\./)) {
                  return <p key={i} className="text-white/70 text-base leading-relaxed mb-3 pl-4" style={{ borderLeft:"2px solid rgba(212,160,23,0.3)" }}>{para}</p>;
                }
                return <p key={i} className="text-white/65 text-base leading-relaxed mb-5">{para}</p>;
              })}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-8 pt-8" style={{ borderTop:"1px solid rgba(255,255,255,0.08)" }}>
              {post.tags.map(tag => (
                <Link key={tag} to={`/blog?q=${tag}`} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full text-white/40 hover:text-[#d4a017] transition-colors" style={{ border:"1px solid rgba(255,255,255,0.1)" }}>
                  <Tag size={10}/> {tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="rounded-2xl p-5 sticky top-24" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)" }}>
              <h3 className="text-white font-bold text-sm mb-4">Get Export Pricing</h3>
              <p className="text-white/40 text-xs mb-4">Request a free sample and FOB/CIF price quote from our export team.</p>
              <Link to="/contact" className="block py-3 rounded-xl text-xs font-bold text-center text-[#0a0a0a] mb-2" style={{ background:"linear-gradient(135deg,#d4a017,#b8860b)" }}>
                Request Free Sample
              </Link>
              <a href="https://wa.me/918200197967" target="_blank" rel="noreferrer"
                className="block py-3 rounded-xl text-xs font-semibold text-center text-white transition-colors"
                style={{ background:"#25d366" }}>
                💬 WhatsApp Us
              </a>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-white text-2xl font-bold mb-6" style={{ fontFamily:"'Playfair Display',serif" }}>
              Related <span className="text-[#d4a017]">Articles</span>
            </h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {related.map(rp => (
                <Link key={rp.id} to={`/blog/${rp.slug}`} className="group rounded-2xl overflow-hidden block transition-all hover:-translate-y-1"
                  style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)" }}>
                  <div className="h-36 overflow-hidden">
                    <ImageWithFallback src={rp.image} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                  </div>
                  <div className="p-4">
                    <p className="text-white/65 text-xs font-medium leading-snug line-clamp-2 group-hover:text-[#d4a017] transition-colors mb-2">{rp.title}</p>
                    <span className="text-[#d4a017] text-xs flex items-center gap-1">Read <ArrowRight size={11}/></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
