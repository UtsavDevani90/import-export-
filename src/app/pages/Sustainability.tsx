import React from 'react';
import { Leaf, Droplet, Recycle, Sun, Users, Award } from 'lucide-react';

const initiatives = [
  {
    icon: Leaf,
    title: 'Organic Farming Support',
    description: 'Partner with organic farmers. Promote chemical-free cultivation and sustainable agriculture practices.',
    impact: '30% of sourcing from organic farms'
  },
  {
    icon: Droplet,
    title: 'Water Conservation',
    description: 'Rainwater harvesting and drip irrigation systems. Reduced water consumption by 40% in processing.',
    impact: '5 million liters saved annually'
  },
  {
    icon: Recycle,
    title: 'Waste Management',
    description: 'Zero-waste facility with 95% waste recycling. Organic waste converted to compost for farming.',
    impact: 'waste recycled yearly'
  },
  {
    icon: Sun,
    title: 'Solar Energy',
    description: '500 KW solar plant powers 60% of facility operations. Reduced carbon footprint significantly.',
    impact: 'CO₂ reduction per year'
  },
  {
    icon: Users,
    title: 'Fair Trade Practices',
    description: 'Direct farmer partnerships ensuring fair prices. Support rural communities and women empowerment.',
    impact: 'farming families supported'
  },
  {
    icon: Award,
    title: 'Sustainable Packaging',
    description: 'Biodegradable and recyclable packaging materials. Reduced plastic usage by 70% since 2020.',
    impact: 'plastic eliminated'
  }
];

const certifications = [
  'ISO 14001 Environmental Management',
  'Organic Certification (NPOP)',
  'Fair Trade Certified',
  'Carbon Neutral Initiative',
  'Green Business Certification'
];

const goals = [
  { year: '2024', goal: '100% renewable energy', status: 'In Progress' },
  { year: '2025', goal: 'Zero plastic packaging', status: 'Planned' },
  { year: '2026', goal: 'Carbon neutral operations', status: 'Planned' },
  { year: '2027', goal: '50% organic product range', status: 'Planned' }
];

export default function Sustainability() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block bg-emerald-700 rounded-full p-4 mb-6">
            <Leaf className="w-12 h-12" />
          </div>
          <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Sustainability Commitment
          </h1>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            Building a greener future through responsible sourcing, eco-friendly operations, and community support
          </p>
        </div>
      </div>

      {/* Initiatives Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Our Green Initiatives
          </h2>
          <p className="text-xl text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
            Comprehensive sustainability programs across our operations
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {initiatives.map((initiative, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border-2 border-gray-100 p-8 hover:border-emerald-600 hover:shadow-xl transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center mb-6">
                <initiative.icon className="w-8 h-8 text-emerald-800" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {initiative.title}
              </h3>
              <p className="text-gray-700 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                {initiative.description}
              </p>
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                <p className="text-sm font-semibold text-emerald-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Impact: {initiative.impact}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Environmental Certifications
            </h2>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {certifications.map((cert, index) => (
              <div key={index} className="bg-white rounded-lg p-4 text-center border-2 border-emerald-200 hover:border-emerald-600 transition-colors">
                <Award className="w-8 h-8 text-emerald-700 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>{cert}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Roadmap */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Sustainability Roadmap
          </h2>
          <p className="text-xl text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
            Our commitment to achieving ambitious environmental goals
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {goals.map((goal, index) => (
            <div key={index} className="bg-white rounded-xl border-2 border-gray-200 p-6 text-center hover:border-emerald-600 hover:shadow-lg transition-all">
              <div className="text-3xl font-bold text-emerald-800 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {goal.year}
              </div>
              <p className="text-gray-900 font-semibold mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                {goal.goal}
              </p>
              <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${
                goal.status === 'In Progress' 
                  ? 'bg-amber-100 text-amber-800' 
                  : 'bg-blue-100 text-blue-800'
              }`} style={{ fontFamily: 'Inter, sans-serif' }}>
                {goal.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Join Our Sustainability Journey
          </h2>
          <p className="text-xl text-emerald-100 mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
            Partner with us for eco-friendly spice sourcing
          </p>
          <a
            href="/contact"
            className="inline-block bg-white text-emerald-900 px-10 py-4 rounded-lg font-bold text-lg hover:bg-emerald-50 transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Learn More
          </a>
        </div>
      </div>
    </div>
  );
}
