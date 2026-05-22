import { 
  Award, 
  Truck, 
  FileCheck, 
  DollarSign, 
  Shield, 
  Leaf, 
  Factory, 
  Users, 
  Clock, 
  Globe2,
  CheckCircle2,
  TrendingUp,
  Package,
  Zap,
  Heart,
  Target
} from 'lucide-react';

const mainReasons = [
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'ISO 22000 certified facility with in-house NABL accredited laboratory testing every batch for purity, moisture, and safety.',
    features: [
      'In-house lab testing',
      'ISO 22000:2018 certified',
      'HACCP compliant',
      'Third-party audits'
    ],
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
  },
  {
    icon: Truck,
    title: 'Fast Shipping',
    description: 'Efficient logistics with 7-14 days lead time. We handle complete export documentation and customs clearance.',
    features: [
      'FOB, CIF, C&F terms',
      'Sea & air freight',
      '7-14 days lead time',
      'Real-time tracking'
    ],
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    borderColor: 'border-green-200',
  },
  {
    icon: FileCheck,
    title: 'Export Documentation',
    description: 'Complete documentation support including COA, COO, Phytosanitary Certificate, and all customs paperwork.',
    features: [
      'Certificate of Origin',
      'Phytosanitary cert',
      'Health certificates',
      'Customs clearance'
    ],
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200',
  },
  {
    icon: DollarSign,
    title: 'Competitive Pricing',
    description: 'Trusted supplier network and in-house processing enable us to offer the most competitive FOB/CIF prices in the market.',
    features: [
      'Trusted supplier network',
      'Premium quality, competitive pricing',
      'Bulk discounts',
      'Flexible payment terms'
    ],
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
  },
  {
    icon: Shield,
    title: 'International Standards',
    description: 'Fully compliant with international food safety standards. APEDA, FSSAI, and Spice Board registered exporter.',
    features: [
      'APEDA registered',
      'FSSAI licensed',
      'Spice Board member',
      'IEC authorized'
    ],
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    borderColor: 'border-red-200',
  },
];

const additionalBenefits = [
  {
    icon: Leaf,
    title: 'Farm-to-Export Traceability',
    description: 'Complete supply chain visibility from farm to your port',
  },
  {
    icon: Factory,
    title: 'Global Export Operations',
    description: 'Efficient sourcing and supply solutions for international markets'
  },
  {
    icon: Users,
    title: 'Dedicated Account Manager',
    description: '24/7 support for all your export requirements',
  },
  {
    icon: Clock,
    title: 'On-Time Delivery',
    description: '98% on-time shipment record with reliable logistics',
  },
  {
    icon: Globe2,
    title: '50+ Countries Served',
    description: 'Trusted by importers across Americas, Europe, and Asia',
  },
  {
    icon: Package,
    title: 'Custom Packaging',
    description: 'Private label and custom packaging solutions available',
  },
  {
    icon: Zap,
    title: 'Quick Response Time',
    description: 'Sample quotes and inquiries answered within 24 hours',
  },
  {
    icon: Heart,
    title: 'Customer Satisfaction',
    description: '95% customer retention rate with repeat orders',
  },
];

const comparisonData = [
  { feature: 'ISO Certification', us: true, others: 'Sometimes' },
  { feature: 'In-House Lab', us: true, others: false },
  { feature: 'Trusted supplier network', us: true, others: false },
  { feature: 'Export Documentation', us: 'Complete', others: 'Partial' },
  { feature: 'Lead Time', us: '7-14 days', others: '15-30 days' },
  { feature: 'Custom Packaging', us: true, others: 'Limited' },
  { feature: 'Sample Orders', us: 'Free', others: 'Paid' },
  { feature: 'Account Manager', us: 'Dedicated', others: 'Shared' },
];

export function WhyChooseUsSection() {
  return (
    <div className="space-y-16">
      {/* Main Reasons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mainReasons.map((reason, index) => {
          const Icon = reason.icon;
          return (
            <div
              key={reason.title}
              className={`group relative bg-white rounded-2xl p-8 border-2 ${reason.borderColor} hover:border-amber-300 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${reason.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon size={32} className="text-white" />
              </div>

              {/* Content */}
              <h3 className="text-stone-900 font-bold text-xl mb-3">{reason.title}</h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                {reason.description}
              </p>

              {/* Features List */}
              <ul className="space-y-2">
                {reason.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-stone-700 text-sm">
                    <CheckCircle2 size={14} className={reason.textColor} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Hover Effect Border */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${reason.color} opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none`} />
            </div>
          );
        })}
      </div>

      {/* Additional Benefits */}
      <div>
        <div className="text-center mb-8">
          <h3 className="text-stone-900 font-bold text-2xl mb-2">
            More Reasons to <span className="text-amber-600">Partner With Us</span>
          </h3>
          <p className="text-stone-600 text-sm">
            Comprehensive export solutions tailored for international buyers
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {additionalBenefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-xl p-5 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
                  <Icon size={24} className="text-amber-600" />
                </div>
                <h4 className="text-stone-900 font-bold text-sm mb-1">{benefit.title}</h4>
                <p className="text-stone-600 text-xs leading-relaxed">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-gradient-to-br from-stone-50 to-amber-50 rounded-2xl p-8 border border-amber-100">
        <div className="text-center mb-8">
          <h3 className="text-stone-900 font-bold text-2xl mb-2">
            Why We Stand <span className="text-amber-600">Apart</span>
          </h3>
          <p className="text-stone-600 text-sm">
            See how we compare to other spice exporters
          </p>
        </div>

        <div className="bg-white rounded-xl overflow-hidden shadow-md border border-stone-200">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-amber-600 to-amber-500">
                <th className="text-left px-6 py-4 text-white font-bold text-sm">Feature</th>
                <th className="text-center px-6 py-4 text-white font-bold text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <Award size={16} />
                    Tanzora Export
                  </div>
                </th>
                <th className="text-center px-6 py-4 text-white font-bold text-sm">Other Exporters</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, index) => (
                <tr
                  key={row.feature}
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-amber-50'} border-b border-stone-100 last:border-0`}
                >
                  <td className="px-6 py-4 text-stone-700 font-medium text-sm">{row.feature}</td>
                  <td className="px-6 py-4 text-center">
                    {typeof row.us === 'boolean' ? (
                      row.us ? (
                        <CheckCircle2 size={20} className="text-green-600 mx-auto" />
                      ) : (
                        <span className="text-red-500 text-xl">✕</span>
                      )
                    ) : (
                      <span className="text-green-600 font-bold text-sm">{row.us}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {typeof row.others === 'boolean' ? (
                      row.others ? (
                        <CheckCircle2 size={20} className="text-green-600 mx-auto" />
                      ) : (
                        <span className="text-red-500 text-xl">✕</span>
                      )
                    ) : (
                      <span className="text-stone-500 font-medium text-sm">{row.others}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl p-8 lg:p-12 border border-stone-700/50 shadow-2xl">
        <div className="text-center mb-10">
          <h3 className="text-white font-bold text-2xl lg:text-3xl mb-3">
            Why Choose <span className="text-amber-400">Tanzora Export</span>
          </h3>
          <p className="text-stone-400 text-sm max-w-2xl mx-auto">
            Your trusted partner for premium spice exports worldwide
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-amber-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-amber-400 font-bold text-xl mb-1">Established 2026</div>
              <div className="text-stone-400 text-sm font-medium">Global Export Company</div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-emerald-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-emerald-400 font-bold text-xl mb-1">Premium Quality</div>
              <div className="text-stone-400 text-sm font-medium">Certified Products</div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-blue-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-blue-400 font-bold text-xl mb-1">Worldwide Shipping</div>
              <div className="text-stone-400 text-sm font-medium">Reliable Logistics</div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-purple-400 font-bold text-xl mb-1">Customer Focused</div>
              <div className="text-stone-400 text-sm font-medium">Long-Term Partnerships</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
