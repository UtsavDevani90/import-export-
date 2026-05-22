import React from 'react';
import { Microscope, FlaskConical, Shield, CheckCircle, Award, ClipboardCheck } from 'lucide-react';

const stages = [
  {
    icon: ClipboardCheck,
    title: 'Raw Material Inspection',
    description: 'Thorough inspection of incoming raw materials from farmers and suppliers',
    checks: ['Visual inspection', 'Moisture content', 'Foreign matter', 'Color & aroma', 'Supplier certification']
  },
  {
    icon: Microscope,
    title: 'Laboratory Testing',
    description: 'Advanced lab analysis using modern equipment and international standards',
    checks: ['Microbial testing', 'Pesticide residue', 'Heavy metals', 'Aflatoxin levels', 'Nutritional analysis']
  },
  {
    icon: FlaskConical,
    title: 'Processing Monitoring',
    description: 'Continuous quality checks during cleaning, grinding, and processing stages',
    checks: ['Temperature control', 'Hygiene standards', 'Equipment calibration', 'Process parameters', 'Batch tracking']
  },
  {
    icon: Shield,
    title: 'Final Product Testing',
    description: 'Comprehensive testing of finished products before packaging',
    checks: ['Purity analysis', 'Moisture content', 'Particle size', 'Color value', 'Flavor profile']
  },
  {
    icon: Award,
    title: 'Certification & Release',
    description: 'Quality certification and documentation before dispatch',
    checks: ['Certificate of Analysis', 'Batch release approval', 'Traceability records', 'Export documentation', 'Quality seal']
  }
];

const parameters = [
  { test: 'Moisture Content', standard: '≤ 12%', method: 'ISO 939' },
  { test: 'Total Ash', standard: '≤ 7%', method: 'ISO 928' },
  { test: 'Acid Insoluble Ash', standard: '≤ 1.5%', method: 'ISO 930' },
  { test: 'Volatile Oil', standard: '≥ 2%', method: 'ISO 6571' },
  { test: 'Salmonella', standard: 'Absent', method: 'ISO 6579' },
  { test: 'E. Coli', standard: '< 10 cfu/g', method: 'ISO 16649' },
  { test: 'Total Plate Count', standard: '< 10⁵ cfu/g', method: 'ISO 4833' },
  { test: 'Aflatoxin', standard: '< 10 ppb', method: 'AOAC 991.31' }
];

const certifications = [
  'ISO 22000:2018 Food Safety',
  'HACCP Certified',
  'FSSAI Licensed',
  'APEDA Registered',
  'Spice Board India',
  'GMP Certified',
  'Kosher Certified',
  'Halal Certified'
];

export default function QualityControl() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block bg-emerald-700 rounded-full p-4 mb-6">
            <Shield className="w-12 h-12" />
          </div>
          <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Quality Control & Testing
          </h1>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            5-stage quality assurance process ensuring international standards and food safety
          </p>
        </div>
      </div>

      {/* Quality Stages */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-8">
          {stages.map((stage, index) => (
            <div key={index} className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-800 to-emerald-900 flex items-center justify-center text-white shadow-lg">
                  <stage.icon className="w-8 h-8" />
                </div>
              </div>
              <div className="flex-1 bg-white rounded-xl border-2 border-gray-100 p-6 hover:border-emerald-200 hover:shadow-lg transition-all">
                <h3 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Stage {index + 1}: {stage.title}
                </h3>
                <p className="text-gray-700 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {stage.description}
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {stage.checks.map((check, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>{check}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testing Parameters */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Testing Parameters & Standards
            </h2>
            <p className="text-xl text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              Comprehensive testing as per international standards
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-emerald-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>Test Parameter</th>
                  <th className="px-6 py-4 text-left font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>Standard Limit</th>
                  <th className="px-6 py-4 text-left font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>Test Method</th>
                </tr>
              </thead>
              <tbody>
                {parameters.map((param, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-emerald-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>{param.test}</td>
                    <td className="px-6 py-4 text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>{param.standard}</td>
                    <td className="px-6 py-4 text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>{param.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Lab Facilities */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
              State-of-the-Art Laboratory
            </h2>
            <p className="text-lg text-gray-700 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              Our in-house laboratory is equipped with modern testing equipment and operated by qualified food technologists and microbiologists.
            </p>
            <ul className="space-y-3">
              {[
                'HPLC for pesticide residue analysis',
                'Atomic Absorption Spectrophotometer for heavy metals',
                'Microbiology lab with laminar flow',
                'Moisture analyzer and color spectrophotometer',
                'NABL accredited testing facility'
              ].map((facility, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>{facility}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {certifications.map((cert, index) => (
              <div key={index} className="bg-white rounded-lg border-2 border-emerald-200 p-4 text-center hover:border-emerald-600 hover:shadow-lg transition-all">
                <Award className="w-8 h-8 text-emerald-700 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>{cert}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Request Quality Certificates
          </h2>
          <p className="text-xl text-emerald-100 mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
            Get detailed test reports and quality documentation for your orders
          </p>
          <a
            href="/certificates"
            className="inline-block bg-white text-emerald-900 px-10 py-4 rounded-lg font-bold text-lg hover:bg-emerald-50 transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            View Certificates
          </a>
        </div>
      </div>
    </div>
  );
}
