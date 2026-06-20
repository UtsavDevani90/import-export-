import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  Award,
  Globe,
  Package,
  ShieldCheck,
  Truck,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  CheckCircle2,
  Leaf,
  Factory,
  BarChart3,
} from "lucide-react";
import { products } from "../data/products";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { CounterAnimation, FloatingSpices, WorldMapAnimation, AnimatedBackground } from "../components/HeroAnimations";

import { WhyChooseUsSection } from "../components/WhyChooseUsSection";


const heroImage =
  "https://images.unsplash.com/photo-1768729341078-9da4e0ea959e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBzcGljZXMlMjBjb2xvcmZ1bCUyMHR1cm1lcmljJTIwZXhwb3J0fGVufDF8fHx8MTc3ODU3NDg5OHww&ixlib=rb-4.1.0&q=80&w=1080";
const shippingImage =
  "https://images.unsplash.com/photo-1759272548470-d0686d071036?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJnbyUyMHNoaXBwaW5nJTIwY29udGFpbmVyJTIwcG9ydCUyMGludGVybmF0aW9uYWwlMjB0cmFkZXxlbnwxfHx8fDE3Nzg1NzQ4OTh8MA&ixlib=rb-4.1.0&q=80&w=1080";
const marketImage =
  "https://images.unsplash.com/photo-1775433205046-86e060feff06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBzcGljZSUyMG1hcmtldCUyMHZpYnJhbnQlMjBjb2xvcmZ1bCUyMGJhemFhcnxlbnwxfHx8fDE3Nzg1NzQ5MDh8MA&ixlib=rb-4.1.0&q=80&w=1080";
const qualityImage =
  "https://images.unsplash.com/photo-1580982331877-489fb58aeade?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwaW5kdXN0cnklMjBxdWFsaXR5JTIwY2VydGlmaWNhdGlvbiUyMGxhYnxlbnwxfHx8fDE3Nzg1NzQ5MDh8MA&ixlib=rb-4.1.0&q=80&w=1080";
const warehouseImage =
  "https://images.unsplash.com/photo-1734977112531-cb74329ce3d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGljZSUyMHdhcmVob3VzZSUyMGZhY3RvcnklMjBxdWFsaXR5fGVufDF8fHx8MTc3ODU3NDkwNXww&ixlib=rb-4.1.0&q=80&w=1080";

const exportCountries = [
  { name: "USA", flag: "🇺🇸", region: "North America" },
  { name: "Germany", flag: "🇩🇪", region: "Europe" },
  { name: "UK", flag: "🇬🇧", region: "Europe" },
  { name: "Canada", flag: "🇨🇦", region: "North America" },
  { name: "Australia", flag: "🇦🇺", region: "Oceania" },
  { name: "UAE", flag: "🇦🇪", region: "Middle East" },
  { name: "Saudi Arabia", flag: "🇸🇦", region: "Middle East" },
  { name: "Singapore", flag: "🇸🇬", region: "Asia" },
  { name: "Malaysia", flag: "🇲🇾", region: "Asia" },
  { name: "Japan", flag: "🇯🇵", region: "Asia" },
  { name: "Netherlands", flag: "🇳🇱", region: "Europe" },
  { name: "France", flag: "🇫🇷", region: "Europe" },
  { name: "South Africa", flag: "🇿🇦", region: "Africa" },
  { name: "Brazil", flag: "🇧🇷", region: "South America" },
  { name: "Mexico", flag: "🇲🇽", region: "North America" },
  { name: "New Zealand", flag: "🇳🇿", region: "Oceania" },
];



const whyChooseUs = [
  {
    icon: <Leaf size={28} className="text-amber-600" />,
    title: "Farm-to-Export Quality",
    description:
      "We source directly from certified farms across India, ensuring freshness, traceability, and quality at every step.",
  },
  {
    icon: <Factory size={28} className="text-amber-600" />,
    title: "State-of-the-Art Processing",
    description:
      "Our 50,000 sq. ft. processing facility uses advanced cleaning, grading, and packaging equipment.",
  },
  {
    icon: <ShieldCheck size={28} className="text-amber-600" />,
    title: "Strict Quality Control",
    description:
      "Every batch undergoes physical, chemical, and microbiological testing in our in-house lab before export.",
  },
  {
    icon: <Globe size={28} className="text-amber-600" />,
    title: "50+ Countries Served",
    description:
      "Trusted by importers, wholesalers, and food manufacturers across Americas, Europe, Middle East, and Asia.",
  },
  {
    icon: <Truck size={28} className="text-amber-600" />,
    title: "Reliable Export Logistics",
    description:
      "We handle complete export documentation, customs clearance, and timely shipping to your port.",
  },
  {
    icon: <BarChart3 size={28} className="text-amber-600" />,
    title: "Competitive Pricing",
    description:
      "Trusted supplier network and in-house processing allow us to offer the most competitive FOB/CIF prices.",
  },
];



const faqs = [
  {
    q: "What is your minimum order quantity (MOQ)?",
    a: "Our MOQ varies by product. For most spice powders and seeds, the MOQ is 500 kg per product. For whole spices like Black Pepper, Cloves, and Cinnamon, the MOQ starts from 100–250 kg. Sample orders (1–5 kg) are available for quality evaluation.",
  },
  {
    q: "What types of packaging do you offer?",
    a: "We offer 25 kg and 50 kg PP woven bags, multi-layer kraft paper bags, jute bags, and custom private label packaging with HACCP-compliant materials. We also offer vacuum-sealed and gas-flushed packaging for extended shelf life.",
  },
  {
    q: "Which certifications do you hold?",
    a: "We are ISO 22000:2018 certified, FSSAI licensed, APEDA registered, HACCP compliant, and members of the Spices Board of India. Kosher and Organic certifications are also available for select products.",
  },
  {
    q: "What payment terms do you offer?",
    a: "We accept T/T (Bank Transfer), L/C at sight, DP, and DA payment terms. For new buyers, we typically work on 30% advance and 70% against documents. We can discuss favorable terms with established buyers.",
  },
  {
    q: "What are your shipping terms and lead times?",
    a: "We offer FOB, CIF, C&F, and EXW terms. Standard lead time is 7–14 business days from order confirmation. Pre-shipment inspection, phytosanitary certificate, and all export documentation are provided.",
  },
  {
    q: "Can you provide samples before placing a bulk order?",
    a: "Yes, we provide free samples (up to 500g per product) for qualified buyers. Courier charges are to be borne by the buyer. Custom formulation or private label samples are also available.",
  },
];

export function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const featuredProducts = products.slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ── */}
      <section className="relative min-h-[85vh] lg:min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={heroImage}
            alt="Indian Spices"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/85 via-stone-900/60 to-stone-900/20" />
        </div>
        
        {/* Animated Background Effects */}
        <AnimatedBackground />
        <WorldMapAnimation />
        <FloatingSpices />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6 animate-fade-up">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              Indian Spice Exporter Since 2026
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight animate-fade-up delay-100">
              Delivering Premium
              <span className="block text-amber-400 mt-1">Indian Spices Worldwide</span>
            </h1>
            <p className="text-stone-300 text-base sm:text-lg mb-4 sm:mb-5 leading-relaxed animate-fade-up delay-200">
              Authentic, farm-fresh spices exported to 50+ countries.
              I
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-stone-300 mb-6 sm:mb-8">
              {["Turmeric", "Chilli", "Black Pepper", "Cumin", "Coriander", "Cinnamon"].map(
                (s) => (
                  <span key={s} className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-amber-400" /> {s}
                  </span>
                )
              )}
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 animate-fade-up delay-400">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl transition-all hover:shadow-xl hover:shadow-amber-500/30 text-sm"
              >
                Get Quote <ArrowRight size={17} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/50 hover:border-amber-400 text-white hover:text-amber-400 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl transition-all font-medium text-sm"
              >
                Contact Us
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/50 hover:border-amber-400 text-white hover:text-amber-400 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl transition-all font-medium text-sm"
              >
                Explore Products
              </Link>
            </div>

            {/* Animated Counter Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mt-10 sm:mt-12 lg:mt-16 max-w-2xl animate-fade-up delay-500">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 sm:p-4 lg:p-5">
                <CounterAnimation end={10} label="Countries Targeted" suffix="+" />
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 sm:p-4 lg:p-5">
                <CounterAnimation end={25} label="Product Inquiries" suffix="+" />
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 sm:p-4 lg:p-5">
                <CounterAnimation end={5} label="Trusted Suppliers" suffix="+" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 text-white/60 animate-bounce">
          <ChevronDown size={24} className="sm:w-7 sm:h-7" />
        </div>
      </section>

      {/* ── About Intro ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src={marketImage}
                alt="Tanzora Export Market"
                className="w-full h-80 object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -right-5 bg-amber-500 rounded-2xl p-5 shadow-xl text-white">
              <div className="font-bold text-3xl">19+</div>
              <div className="text-amber-100 text-sm">Years of Excellence</div>
            </div>
            <div className="absolute -top-5 -left-5 bg-stone-900 rounded-2xl p-4 shadow-xl text-white">
              <Award size={32} className="text-amber-400 mb-1" />
              <div className="text-amber-400 font-bold text-sm">ISO 22000</div>
              <div className="text-stone-400 text-xs">Certified</div>
            </div>
          </div>

          <div>
            <div className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide mb-4">
              About Tanzora Export
            </div>
            <h2 className="text-stone-900 font-bold text-3xl lg:text-4xl mb-5 leading-tight">
              India's Trusted Spice <span className="text-amber-600">Export Partner</span>
            </h2>
            <p className="text-stone-600 mb-4 leading-relaxed">
              Founded in 2026, Tanzora Export is one of India's leading exporters of premium
              spices and agro-based products. Headquartered in Amreli, Gujarat.
              we combine traditional expertise with modern processing technology.
            </p>
            <p className="text-stone-600 mb-6 leading-relaxed">
              Our vertically integrated supply chain, from farm sourcing to final export, ensures
              unmatched quality, traceability, and competitive pricing for international buyers
              across 50+ countries.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-7">
              {[
                "Trusted supplier network",
                "In-House Lab Testing",
                "Custom Private Labeling",
                "On-Time Delivery",
                "Full Export Documentation",
                "Sample Orders Available",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-stone-700 text-sm">
                  <CheckCircle2 size={15} className="text-amber-500 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors"
            >
              Learn More About Us <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="py-20 px-4 bg-amber-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide mb-3">
              Our Products
            </div>
            <h2 className="text-stone-900 font-bold text-3xl lg:text-4xl mb-3">
              Featured Export <span className="text-amber-600">Spices</span>
            </h2>
            <p className="text-stone-600 max-w-xl mx-auto text-sm">
              Sourced from India's finest spice-growing regions, processed in our certified facility
              and shipped worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-amber-100 group"
              >
                <div className="relative overflow-hidden h-48">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-amber-500 text-white text-xs px-2.5 py-1 rounded-full capitalize">
                      {product.category.replace("-", " ")}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-stone-900 font-bold text-base mb-1.5">{product.name}</h3>
                  <p className="text-stone-500 text-sm mb-3 line-clamp-2">{product.shortDescription}</p>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-4">
                    <Package size={13} className="text-amber-500" /> MOQ: {product.moq}
                    <span className="mx-1 text-stone-300">|</span>
                    <Globe size={13} className="text-amber-500" /> {product.origin.split(",")[0]}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/products/${product.id}`}
                      className="flex-1 text-center bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                    >
                      View Details
                    </Link>
                    <Link
                      to="/contact"
                      className="flex-1 text-center bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                    >
                      Send Inquiry
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-stone-900 hover:bg-amber-700 text-white px-7 py-3.5 rounded-xl font-medium text-sm transition-colors"
            >
              View All Products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-20 px-4 bg-stone-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-amber-500/20 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide mb-3">
              Why Choose Tanzora
            </div>
            <h2 className="text-white font-bold text-3xl lg:text-4xl mb-3">
              Your Trusted <span className="text-amber-400">Export Partner</span>
            </h2>
            <p className="text-stone-400 max-w-2xl mx-auto text-sm">
              Here's why 500+ global buyers choose Tanzora Export for their spice sourcing needs.
            </p>
          </div>

          <WhyChooseUsSection />
        </div>
      </section>

      {/* ── Shipping & Logistics ── */}
      <section className="py-0 overflow-hidden">
        <div className="grid lg:grid-cols-2">
          <div className="relative h-72 lg:h-auto">
            <ImageWithFallback
              src={shippingImage}
              alt="Shipping & Logistics"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-stone-900/40" />
          </div>
          <div className="bg-stone-900 p-10 lg:p-16 flex flex-col justify-center">
            <div className="inline-block bg-amber-500/20 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide mb-5 self-start">
              Shipping & Logistics
            </div>
            <h2 className="text-white font-bold text-3xl lg:text-4xl mb-5 leading-tight">
              Seamless Export <span className="text-amber-400">Logistics</span>
            </h2>
            <p className="text-stone-400 mb-6 text-sm leading-relaxed">
              We handle end-to-end export logistics — from factory loading to your destination port.
              Our experienced export team manages all documentation including Certificate of Origin,
              Phytosanitary Certificate, COA, and Bill of Lading.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-7">
              {[
                { icon: "🚢", label: "Sea Freight (FCL/LCL)" },
                { icon: "✈️", label: "Air Freight Available" },
                { icon: "📄", label: "Full Documentation" },
                { icon: "🔍", label: "Pre-Shipment Inspection" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-stone-300 text-sm">
                  <span className="text-lg">{item.icon}</span> {item.label}
                </div>
              ))}
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors self-start"
            >
              Get Shipping Quote <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>



      {/* ── FAQ ── */}
      <section className="py-20 px-4 bg-stone-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide mb-3">
              FAQ
            </div>
            <h2 className="text-stone-900 font-bold text-3xl lg:text-4xl mb-3">
              Frequently Asked <span className="text-amber-600">Questions</span>
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-amber-50 transition-colors"
                >
                  <span className="text-stone-900 font-medium text-sm pr-4">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp size={18} className="text-amber-500 shrink-0" />
                  ) : (
                    <ChevronDown size={18} className="text-stone-400 shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-stone-600 text-sm leading-relaxed border-t border-stone-100">
                    <div className="pt-3">{faq.a}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4 bg-gradient-to-br from-amber-700 via-amber-600 to-amber-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-4">🌿</div>
          <h2 className="text-white font-bold text-3xl lg:text-4xl mb-4">
            Ready to Place Your Spice Export Order?
          </h2>
          <p className="text-amber-100 text-sm mb-8 max-w-xl mx-auto leading-relaxed">
            Contact our export team for product samples, pricing, certifications, and shipping
            details. We respond within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white text-amber-700 hover:bg-amber-50 px-8 py-4 rounded-xl font-bold text-sm transition-colors shadow-xl"
            >
              <Mail size={18} /> Send Inquiry
            </Link>
            <a
              href="https://wa.me/918200197967"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-sm transition-colors shadow-xl"
            >
              <Phone size={18} /> WhatsApp Now
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}