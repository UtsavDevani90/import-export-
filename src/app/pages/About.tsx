import { Link } from "react-router";
import { ArrowRight, CheckCircle2, Users, Award, Globe, Factory, Target, Eye, Heart, Zap } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { CertificatesShowcase } from "../components/CertificatesShowcase";
import { CertificateSection } from "../components/CertificateSection";

const marketImage =
  "https://images.unsplash.com/photo-1775433205046-86e060feff06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBzcGljZSUyMG1hcmtldCUyMHZpYnJhbnQlMjBjb2xvcmZ1bCUyMGJhemFhcnxlbnwxfHx8fDE3Nzg1NzQ5MDh8MA&ixlib=rb-4.1.0&q=80&w=1080";
const qualityImage =
  "https://images.unsplash.com/photo-1580982331877-489fb58aeade?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwaW5kdXN0cnklMjBxdWFsaXR5JTIwY2VydGlmaWNhdGlvbiUyMGxhYnxlbnwxfHx8fDE3Nzg1NzQ5MDh8MA&ixlib=rb-4.1.0&q=80&w=1080";
const warehouseImage =
  "https://images.unsplash.com/photo-1734977112531-cb74329ce3d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGljZSUyMHdhcmVob3VzZSUyMGZhY3RvcnklMjBxdWFsaXR5fGVufDF8fHx8MTc3ODU3NDkwNXww&ixlib=rb-4.1.0&q=80&w=1080";

const team = [
  {
    name: "Utsav Devani",
    role: "Co-Founder",
    bio: "A passionate entrepreneur with a deep commitment to quality and global trade. Utsav co-founded Tanzora Export with a vision to bring authentic Indian spices to international markets, driving business development, strategic partnerships, and client relations across 50+ countries.",
    initial: "U",
  },
  {
    name: "Arjun Bhavani",
    role: "Co-Founder",
    bio: "With a strong foundation in supply chain management and export operations, Arjun oversees the end-to-end logistics, quality control, and compliance at Tanzora Export. His expertise ensures every shipment meets the highest international food safety standards.",
    initial: "A",
  },
];

const values = [
  {
    emoji: "🌿",
    title: "Authenticity",
    desc: "We source only genuine, origin-certified spices from India's top growing regions.",
  },
  {
    emoji: "🔬",
    title: "Quality",
    desc: "Every batch is tested in our in-house laboratory for purity, moisture, and microbiological safety.",
  },
  {
    emoji: "🤝",
    title: "Integrity",
    desc: "Transparent pricing, honest communication, and no compromise on product standards.",
  },
  {
    emoji: "🌍",
    title: "Global Mindset",
    desc: "We understand international trade requirements and adapt to each market's regulations.",
  },
];

const whyChooseUs = [
  {
    icon: Target,
    title: 'Trusted supplier network',
    desc: 'We partner directly with certified farmers across Gujarat, Rajasthan, Kerala, and Andhra Pradesh, ensuring traceability and fair pricing.',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: Award,
    title: 'Premium Quality Standards',
    desc: 'Every batch undergoes rigorous testing in our ISO-certified lab for purity, moisture content, and microbiological safety.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Factory,
    title: 'Modern Processing Facility',
    desc: '50,000 sq.ft. state-of-the-art facility with advanced cleaning, grading, and packaging equipment meeting international standards.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: Globe,
    title: 'Global Export Expertise',
    desc: 'Experienced team handling complete export documentation, customs clearance, and logistics to 50+ countries worldwide.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: Zap,
    title: 'Fast Turnaround Time',
    desc: 'Efficient processing and shipping with 7-14 days lead time from order confirmation to shipment departure.',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    icon: Heart,
    title: 'Customer-Centric Approach',
    desc: 'Dedicated account managers, custom packaging options, and 24/7 support for all your export requirements.',
    color: 'text-pink-600',
    bg: 'bg-pink-50',
  },
];

export function About() {
  return (
    <div className="min-h-screen">
      {/* ── Page Header ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide mb-3">
              Our Story
            </div>
            <h2 className="text-stone-900 font-bold text-3xl lg:text-4xl mb-4">
              The Journey of <span className="text-amber-600">Tanzora Export</span>
            </h2>
            <p className="text-stone-600 max-w-3xl mx-auto text-sm leading-relaxed">
              From a small trading firm in Amreli, Gujarat to a globally recognized spice exporter
              serving 50+ countries — our story is built on trust, quality, and unwavering
              commitment to excellence.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <ImageWithFallback
                src={warehouseImage}
                alt="Our Facility"
                className="w-full h-80 object-cover rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-4 -right-4 bg-amber-600 text-white rounded-2xl p-5 shadow-xl">
                <Factory size={28} className="mb-1" />
                <div className="font-bold">50,000 sq.ft.</div>
                <div className="text-amber-100 text-xs">Processing Facility</div>
              </div>
            </div>
            <div>
              <h3 className="text-stone-900 font-bold text-2xl mb-4">
                Rooted in Tradition, Driven by Innovation
              </h3>
              <p className="text-stone-600 mb-4 leading-relaxed text-sm">
                Tanzora Export is headquartered in Amreli, Gujarat —
                We combine traditional spice knowledge passed down through
                generations with modern processing technology to deliver premium quality products
                to international buyers.
              </p>
              <p className="text-stone-600 mb-6 leading-relaxed text-sm">
                Our operations span the entire value chain: direct farmer partnerships across
                multiple states, a state-of-the-art processing plant, an in-house quality
                laboratory, and a dedicated export team handling all international trade
                requirements with precision and care.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <div className="text-amber-600 font-bold text-2xl mb-1">500+</div>
                  <div className="text-stone-600 text-xs">Happy Global Clients</div>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <div className="text-amber-600 font-bold text-2xl mb-1">50+</div>
                  <div className="text-stone-600 text-xs">Export Countries</div>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <div className="text-amber-600 font-bold text-2xl mb-1">5000+</div>
                  <div className="text-stone-600 text-xs">MT Annual Export</div>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <div className="text-amber-600 font-bold text-2xl mb-1">6+</div>
                  <div className="text-stone-600 text-xs">Quality Certifications</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Founder Section ── */}
      <section className="py-20 px-4 bg-gradient-to-br from-amber-50 to-stone-50">
        <div className="max-w-7xl mx-auto">
          {/* Leadership Team - 2 Co-founders */}
          <div className="text-center mb-12">
            <div className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide mb-3">
              Leadership
            </div>
            <h2 className="text-stone-900 font-bold text-3xl lg:text-4xl mb-4">
              Meet the <span className="text-amber-600">Founders</span>
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto text-sm leading-relaxed">
              The vision and drive behind Tanzora Export — two co-founders united by a shared passion
              for quality, integrity, and bringing India's finest spices to the world.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-white rounded-2xl p-8 text-center shadow-md hover:shadow-xl transition-all border border-amber-100 group"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-700 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-5 shadow-lg group-hover:shadow-amber-200 transition-shadow">
                  {member.initial}
                </div>
                <h3 className="text-stone-900 font-bold text-xl mb-1">{member.name}</h3>
                <div className="text-amber-600 text-sm font-semibold mb-4">{member.role}</div>
                <p className="text-stone-500 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="relative bg-stone-900 py-20 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={marketImage}
            alt="About Hero"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-block bg-amber-500/20 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide mb-4">
            Our Story
          </div>
          <h1 className="text-white font-bold text-4xl lg:text-5xl mb-4">About Tanzora Export</h1>
          <p className="text-stone-400 text-base max-w-xl mx-auto">
            bringing the finest Indian spices to global markets with authenticity,
            quality, and trust.
          </p>
          <div className="flex justify-center gap-2 mt-5 text-sm text-stone-400">
            <Link to="/" className="hover:text-amber-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-amber-400">About Us</span>
          </div>
        </div>
      </div>

      {/* ── Mission & Vision ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <ImageWithFallback
              src={warehouseImage}
              alt="Our Facility"
              className="w-full h-80 object-cover rounded-2xl shadow-2xl"
            />
            <div className="absolute -bottom-4 -right-4 bg-amber-600 text-white rounded-2xl p-5 shadow-xl">
              <Factory size={28} className="mb-1" />
              <div className="font-bold">50,000 sq.ft.</div>
              <div className="text-amber-100 text-xs">Processing Facility</div>
            </div>
          </div>
          <div>
            <div className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide mb-4">
              Who We Are
            </div>
            <h2 className="text-stone-900 font-bold text-3xl lg:text-4xl mb-5">
              Premium Spice Exporters <span className="text-amber-600">Since 2026</span>
            </h2>
            <p className="text-stone-600 mb-4 leading-relaxed text-sm">
              Tanzora Export is headquartered in Amreli, Gujarat  
              We combine traditional spice knowledge with modern processing
              technology to deliver premium quality products to international buyers.
            </p>
            <p className="text-stone-600 mb-6 leading-relaxed text-sm">
              Our operations span the entire value chain: direct farmer partnerships across Gujarat,
              Rajasthan, Kerala, and Andhra Pradesh; a state-of-the-art processing plant; an
              in-house quality laboratory; and a dedicated export team handling all international
              trade requirements.
            </p>

            <div className="grid grid-cols-2 gap-5 mb-7">
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <div className="text-amber-600 font-bold text-2xl mb-1">500+</div>
                <div className="text-stone-600 text-xs">Happy Global Clients</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <div className="text-amber-600 font-bold text-2xl mb-1">50+</div>
                <div className="text-stone-600 text-xs">Export Countries</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <div className="text-amber-600 font-bold text-2xl mb-1">5000+</div>
                <div className="text-stone-600 text-xs">MT Annual Export</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <div className="text-amber-600 font-bold text-2xl mb-1">6+</div>
                <div className="text-stone-600 text-xs">Quality Certifications</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Vision & Mission ── */}
      <section className="py-20 px-4 bg-stone-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-amber-500/20 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide mb-3">
              Vision & Mission
            </div>
            <h2 className="text-white font-bold text-3xl lg:text-4xl mb-3">
              Our Purpose <span className="text-amber-400">& Direction</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-stone-800 to-stone-800/50 border border-stone-700 rounded-2xl p-8 relative overflow-hidden group hover:border-amber-500/50 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <Eye size={24} className="text-amber-400" />
                  </div>
                  <div className="text-amber-400 font-bold text-sm uppercase tracking-widest">Our Vision</div>
                </div>
                <p className="text-white font-semibold text-xl mb-4 leading-tight">
                  "Bringing India's spice heritage to every kitchen in the world."
                </p>
                <p className="text-stone-400 text-sm leading-relaxed">
                  To expand our export presence to 100+ countries, introduce organic and specialty
                  spice lines, and become a globally recognized brand in the B2B spice trade while
                  maintaining our commitment to quality and sustainability.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-stone-800 to-stone-800/50 border border-stone-700 rounded-2xl p-8 relative overflow-hidden group hover:border-amber-500/50 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <Target size={24} className="text-amber-400" />
                  </div>
                  <div className="text-amber-400 font-bold text-sm uppercase tracking-widest">Our Mission</div>
                </div>
                <p className="text-white font-semibold text-xl mb-4 leading-tight">
                  "To be the most trusted Indian spice exporter globally."
                </p>
                <p className="text-stone-400 text-sm leading-relaxed">
                  To provide international buyers with authentic, certified, and traceable Indian
                  spices while maintaining the highest standards of food safety, consistency, and
                  service excellence. We empower farmers and delight customers worldwide.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-stone-800 border border-stone-700 hover:border-amber-500/50 rounded-2xl p-6 text-center transition-all group"
              >
                <div className="text-4xl mb-3">{v.emoji}</div>
                <div className="text-white font-bold text-base mb-2">{v.title}</div>
                <div className="text-stone-400 text-xs leading-relaxed">{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide mb-3">
              Why Choose Us
            </div>
            <h2 className="text-stone-900 font-bold text-3xl lg:text-4xl mb-4">
              Your Trusted <span className="text-amber-600">Export Partner</span>
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto text-sm">
              Here's why 500+ global buyers choose Tanzora Export for their spice sourcing needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseUs.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white border-2 border-stone-100 hover:border-amber-200 rounded-2xl p-6 transition-all hover:shadow-xl hover:-translate-y-1 group"
                >
                  <div className={`w-14 h-14 ${item.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon size={28} className={item.color} />
                  </div>
                  <h3 className="text-stone-900 font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Export Expertise ── */}
      <section className="py-20 px-4 bg-gradient-to-br from-amber-50 to-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide mb-3">
              Export Expertise
            </div>
            <h2 className="text-stone-900 font-bold text-3xl lg:text-4xl mb-4">
              Complete <span className="text-amber-600">Export Solutions</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-amber-100">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-stone-900 font-bold text-lg mb-3">Documentation</h3>
              <ul className="space-y-2 text-stone-600 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  Commercial Invoice & Packing List
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  Certificate of Origin (COO)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  Phytosanitary Certificate
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  Certificate of Analysis (COA)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  Bill of Lading / Airway Bill
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md border border-amber-100">
              <div className="text-4xl mb-4">🚢</div>
              <h3 className="text-stone-900 font-bold text-lg mb-3">Shipping Terms</h3>
              <ul className="space-y-2 text-stone-600 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  FOB (Free on Board)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  CIF (Cost, Insurance & Freight)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  C&F (Cost & Freight)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  EXW (Ex Works)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  Sea & Air Freight Options
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md border border-amber-100">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-stone-900 font-bold text-lg mb-3">Payment Terms</h3>
              <ul className="space-y-2 text-stone-600 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  T/T (Bank Transfer)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  L/C at Sight (Letter of Credit)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  DP (Documents against Payment)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  DA (Documents against Acceptance)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  Flexible Terms for Repeat Buyers
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Certificates Showcase ── */}
      <section className="py-20 px-4 bg-gradient-to-br from-stone-50 to-amber-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide mb-3">
              Certifications & Registrations
            </div>
            <h2 className="text-stone-900 font-bold text-3xl lg:text-4xl mb-4">
              Our <span className="text-amber-600">Credentials</span>
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto text-sm leading-relaxed mb-6">
              We hold all necessary certifications and registrations required for international
              spice export. Click on any certificate to view details and download official documents.
            </p>
          </div>

          <CertificateSection />

          <div className="text-center mt-10">
            <Link
              to="/certificates"
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-7 py-3.5 rounded-xl font-medium text-sm transition-colors"
            >
              View All Certificates <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Quality Lab ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide mb-4">
              Quality Control
            </div>
            <h2 className="text-stone-900 font-bold text-3xl lg:text-4xl mb-5">
              In-House Quality <span className="text-amber-600">Laboratory</span>
            </h2>
            <p className="text-stone-600 mb-5 leading-relaxed text-sm">
              Our state-of-the-art in-house laboratory performs comprehensive testing on every batch
              before dispatch. We conduct physical, chemical, and microbiological analysis to ensure
              full compliance with importing country regulations.
            </p>
            <div className="space-y-3">
              {[
                "HPLC & UV-Vis spectroscopy for curcumin and piperine analysis",
                "Moisture, ash, and volatile oil content testing",
                "Microbiological testing (TPC, Yeast & Mold, E.coli, Salmonella)",
                "Heavy metals & pesticide residue testing",
                "Color value (ASTA) measurement for chilli and paprika",
                "Aflatoxin testing via ELISA method",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-stone-700 text-sm">
                  <CheckCircle2 size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <ImageWithFallback
              src={qualityImage}
              alt="Quality Control Lab"
              className="w-full h-80 object-cover rounded-2xl shadow-2xl"
            />
            <div className="absolute -top-4 -left-4 bg-amber-500 rounded-2xl p-4 shadow-xl text-white text-center">
              <Award size={28} className="mx-auto mb-1" />
              <div className="font-bold text-sm">ISO 22000</div>
              <div className="text-amber-100 text-xs">Certified Lab</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-20 px-4 bg-amber-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide mb-3">
              Our Team
            </div>
            <h2 className="text-stone-900 font-bold text-3xl lg:text-4xl mb-3">
              Meet the <span className="text-amber-600">Leadership Team</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-white rounded-2xl p-8 text-center shadow-md hover:shadow-xl transition-all border border-amber-100 group"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-700 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-5 shadow-lg group-hover:shadow-amber-200 transition-shadow">
                  {member.initial}
                </div>
                <h3 className="text-stone-900 font-bold text-xl mb-1">{member.name}</h3>
                <div className="text-amber-600 text-sm font-semibold mb-4">{member.role}</div>
                <p className="text-stone-500 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 px-4 bg-amber-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-white font-bold text-3xl mb-4">
            Partner With India's Trusted Spice Exporter
          </h2>
          <p className="text-amber-100 text-sm mb-6">
            Reach out to discuss your requirements. Our export team is ready to assist with samples,
            pricing, and all trade documentation.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-white text-amber-700 hover:bg-amber-50 px-8 py-3.5 rounded-xl font-bold text-sm transition-colors"
          >
            Contact Our Export Team <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
