import { Quote, Award, TrendingUp, Users } from 'lucide-react';

export function FounderSection() {
  return (
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      {/* Founder Image & Stats */}
      <div className="relative">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-100">
          {/* Placeholder for founder image */}
          <div className="w-full h-96 bg-gradient-to-br from-amber-100 via-stone-100 to-amber-50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center text-white text-5xl font-bold mx-auto mb-4 shadow-2xl">
                RT
              </div>
              <div className="text-stone-600 font-semibold text-lg">Ramesh Tanzora</div>
              <div className="text-stone-500 text-sm">Founder & Managing Director</div>
            </div>
          </div>
        </div>

        {/* Floating Stats */}
        <div className="absolute -bottom-6 left-6 right-6 grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 shadow-xl border border-amber-100 text-center">
            <div className="text-amber-600 font-bold text-xl">30+</div>
            <div className="text-stone-600 text-xs">Years Exp.</div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-xl border border-amber-100 text-center">
            <div className="text-amber-600 font-bold text-xl">50+</div>
            <div className="text-stone-600 text-xs">Countries</div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-xl border border-amber-100 text-center">
            <div className="text-amber-600 font-bold text-xl">500+</div>
            <div className="text-stone-600 text-xs">Clients</div>
          </div>
        </div>
      </div>

      {/* Founder Story */}
      <div>
        <div className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide mb-4">
          Meet Our Founder
        </div>
        <h2 className="text-stone-900 font-bold text-3xl lg:text-4xl mb-5 leading-tight">
          The Vision Behind <span className="text-amber-600">Tanzora Export</span>
        </h2>

        {/* Quote */}
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-xl p-5 mb-6 relative">
          <Quote size={24} className="text-amber-300 absolute top-3 right-3" />
          <p className="text-stone-700 italic text-sm leading-relaxed">
            "My dream was simple: to share the authentic flavors of Indian spices with the world
            while ensuring every farmer, processor, and buyer benefits from fair trade and quality
            excellence."
          </p>
          <div className="text-amber-700 font-semibold text-sm mt-3">— Ramesh Tanzora</div>
        </div>

        <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
          <p>
            Born and raised in Gujarat — the heart of India's spice trade — utsav devani 
            and arjun bhavani grew up witnessing the rich heritage of spice cultivation
            and trading. they founded Tanzora Export in 2026 with a
            vision to bridge the gap between Indian farmers and global markets.
          </p>
          <p>
            Under his leadership, Tanzora Export has grown from a small trading firm to a
            ISO-certified export house serving 50+ countries. His commitment to quality, farmer
            welfare, and customer satisfaction has earned the company recognition as one of India's
            most trusted spice exporters.
          </p>
        </div>

        {/* Achievements */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
              <Award size={20} className="text-amber-600" />
            </div>
            <div>
              <div className="text-stone-900 font-semibold text-sm">Industry Recognition</div>
              <div className="text-stone-500 text-xs">Export Excellence Award 2023</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
              <TrendingUp size={20} className="text-amber-600" />
            </div>
            <div>
              <div className="text-stone-900 font-semibold text-sm">Business Growth</div>
              <div className="text-stone-500 text-xs">40% YoY Export Growth</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
              <Users size={20} className="text-amber-600" />
            </div>
            <div>
              <div className="text-stone-900 font-semibold text-sm">Team Leadership</div>
              <div className="text-stone-500 text-xs">50+ Dedicated Employees</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
              <Award size={20} className="text-amber-600" />
            </div>
            <div>
              <div className="text-stone-900 font-semibold text-sm">Quality Pioneer</div>
              <div className="text-stone-500 text-xs">First ISO 22000 in Region</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
