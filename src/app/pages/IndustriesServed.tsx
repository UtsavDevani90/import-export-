import React from 'react';
import { Store, Utensils, Building2, ShoppingBag, Factory, Plane } from 'lucide-react';
import { useStats } from '../hooks/useStats';

const industries = [
  {
    icon: Store,
    title: 'Retail & Supermarkets',
    description: 'Supply premium packaged spices to retail chains and supermarkets worldwide',
    clients: ['Walmart', 'Carrefour', 'Tesco', 'Metro Cash & Carry'],
    products: ['Consumer packs', 'Private labels', 'Branded spices', 'Gift sets']
  },
  {
    icon: Utensils,
    title: 'Food Processing',
    description: 'Bulk spices for food manufacturers, ready-to-eat meals, and seasoning companies',
    clients: ['Nestle', 'Unilever', 'McCain', 'Heinz'],
    products: ['Bulk powder spices', 'Custom blends', 'Oleoresins', 'Spice extracts']
  },
  {
    icon: Building2,
    title: 'Hotels & Restaurants',
    description: 'Premium quality spices for hospitality industry and restaurant chains',
    clients: ['Marriott', 'Hilton', 'McDonald\'s', 'KFC'],
    products: ['Whole spices', 'Ground spices', 'Spice mixes', 'Bulk packaging']
  },
  {
    icon: ShoppingBag,
    title: 'Wholesale Distributors',
    description: 'Partner with distributors and importers for regional market supply',
    clients: ['Regional importers', 'Cash & carry', 'Wholesale markets', 'Trading companies'],
    products: ['Bulk quantities', 'Multiple varieties', 'Flexible packaging', 'Competitive pricing']
  },
  {
    icon: Factory,
    title: 'Pharmaceutical & Nutraceuticals',
    description: 'High-purity spices for medicinal and health supplement industries',
    clients: ['Pharma companies', 'Ayurvedic manufacturers', 'Supplement brands', 'Herbal products'],
    products: ['Turmeric extract', 'Ginger powder', 'Black pepper', 'Curcumin']
  },
  {
    icon: Plane,
    title: 'Export Trading Houses',
    description: 'Reliable supply partner for export trading companies and re-exporters',
    clients: ['Trading houses', 'Export companies', 'Re-exporters', 'Commodity traders'],
    products: ['Containerized loads', 'Mixed containers', 'Documentation support', 'Quality assurance']
  }
];

const stats = [
  { value: '500+', label: 'Active Clients' },
  { value: '24+', label: 'Countries Served' },
  { value: '6', label: 'Industry Verticals' },
  { value: '15+', label: 'Years Experience' }
];

export default function IndustriesServed() {
  const { stats: statsData, loading } = useStats();

  const stats = [
    { value: statsData.clients || '500+', label: 'Active Clients' },
    { value: statsData.countries || '24+', label: 'Countries Served' },
    { value: '6', label: 'Industry Verticals' },
    { value: statsData.years || '15+', label: 'Years Experience' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Industries We Serve
          </h1>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            Trusted spice export partner across diverse industries worldwide
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-emerald-800 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {loading && (stat.label === 'Active Clients' || stat.label === 'Countries Served' || stat.label === 'Years Experience') ? '...' : stat.value}
                </div>
                <div className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Industries Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {industries.map((industry, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border-2 border-gray-100 p-8 hover:border-emerald-600 hover:shadow-xl transition-all group"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-800 to-emerald-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <industry.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {industry.title}
              </h3>
              <p className="text-gray-700 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                {industry.description}
              </p>
              
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Typical Clients:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {industry.clients.map((client, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {client}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Products Supplied:
                </h4>
                <ul className="space-y-1">
                  {industry.products.map((product, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                      {product}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Partner With Us for Your Industry
          </h2>
          <p className="text-xl text-gray-600 mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
            Custom solutions tailored to your specific industry requirements
          </p>
          <a
            href="/contact"
            className="inline-block bg-emerald-800 text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-emerald-900 transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Discuss Your Requirements
          </a>
        </div>
      </div>
    </div>
  );
}
