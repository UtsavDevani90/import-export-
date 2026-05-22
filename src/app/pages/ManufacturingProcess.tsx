import React from 'react';
import { Factory, Truck, Microscope, Package, Box, CheckCircle } from 'lucide-react';

const stages = [
  {
    icon: Truck,
    title: 'Raw Material Procurement',
    description: 'Direct sourcing from 500+ farmers in Gujarat, Rajasthan, and Madhya Pradesh. Quality inspection at farm level.',
    details: ['Farmer partnerships', 'Quality grading', 'Traceability system', 'Fair pricing']
  },
  {
    icon: Factory,
    title: 'Cleaning & Sorting',
    description: 'Advanced cleaning machines remove impurities, stones, and foreign matter. Color sorting for uniformity.',
    details: ['Destoning machines', 'Magnetic separators', 'Color sorters', 'Gravity separators']
  },
  {
    icon: Microscope,
    title: 'Quality Testing',
    description: 'In-house lab testing for moisture, purity, microbial load, and pesticide residue before processing.',
    details: ['Moisture analysis', 'Purity testing', 'Microbial testing', 'Chemical analysis']
  },
  {
    icon: Box,
    title: 'Processing & Grinding',
    description: 'Temperature-controlled grinding preserves aroma and flavor. Separate lines for different spices.',
    details: ['Cryogenic grinding', 'Mesh size control', 'Aroma retention', 'Cross-contamination prevention']
  },
  {
    icon: Package,
    title: 'Packaging & Labeling',
    description: 'Automated packaging in moisture-proof materials. Nitrogen flushing for extended shelf life.',
    details: ['Automated filling', 'Nitrogen flushing', 'Tamper-proof sealing', 'Batch coding']
  },
  {
    icon: CheckCircle,
    title: 'Final Inspection & Dispatch',
    description: 'Final quality check, documentation, and dispatch to container yard or warehouse.',
    details: ['Quality certification', 'Export documentation', 'Container loading', 'Shipment tracking']
  }
];

const facilities = [
  { name: 'Total Area', value: '50,000 sq.ft.' },
  { name: 'Processing Capacity', value: '500 MT/month' },
  { name: 'Storage Capacity', value: '2000 MT' },
  { name: 'Production Lines', value: '6 Dedicated Lines' },
  { name: 'Quality Lab', value: 'NABL Accredited' },
  { name: 'Workforce', value: '150+ Employees' }
];

const equipment = [
  'Destoning & Cleaning Machines',
  'Color Sorting Equipment',
  'Cryogenic Grinding Mills',
  'Pulverizers & Hammer Mills',
  'Sieving & Grading Machines',
  'Metal Detectors',
  'Automatic Packaging Machines',
  'Nitrogen Flushing System',
  'Fumigation Chamber',
  'Cold Storage Units'
];

export default function ManufacturingProcess() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block bg-emerald-700 rounded-full p-4 mb-6">
            <Factory className="w-12 h-12" />
          </div>
          <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Manufacturing Process
          </h1>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            Trusted sourcing network in Gujarat with quality-focused export operations
          </p>
        </div>
      </div>

      {/* Facility Stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {facilities.map((facility, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-emerald-800 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {facility.value}
                </div>
                <div className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {facility.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process Stages */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            6-Stage Production Process
          </h2>
          <p className="text-xl text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
            From farm to export-ready packaging
          </p>
        </div>

        <div className="space-y-8">
          {stages.map((stage, index) => (
            <div key={index} className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-800 to-emerald-900 flex items-center justify-center text-white shadow-lg">
                  <stage.icon className="w-8 h-8" />
                </div>
              </div>
              <div className="flex-1 bg-white rounded-xl border-2 border-gray-100 p-6 hover:border-emerald-200 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Stage {index + 1}
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {stage.title}
                  </h3>
                </div>
                <p className="text-gray-700 mb-4 text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {stage.description}
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {stage.details.map((detail, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Equipment */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Modern Equipment & Machinery
            </h2>
            <p className="text-xl text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              Advanced technology for superior quality and efficiency
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipment.map((item, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 flex items-center gap-3 hover:border-emerald-600 hover:shadow-md transition-all">
                <Factory className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                <span className="font-medium text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 rounded-2xl p-12 text-white">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Certified Manufacturing Facility
              </h2>
              <p className="text-emerald-100 text-lg mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                Our facility meets international standards for food safety, quality management, and environmental compliance.
              </p>
              <ul className="space-y-3">
                {[
                  'ISO 22000:2018 Food Safety Management',
                  'HACCP Certified Processing',
                  'GMP (Good Manufacturing Practices)',
                  'FSSAI Licensed Facility',
                  'APEDA Registered Unit'
                ].map((cert, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                    <span style={{ fontFamily: 'Inter, sans-serif' }}>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur rounded-xl p-8 border border-white/20">
                <Factory className="w-20 h-20 text-white mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Visit Our Facility
                </h3>
                <p className="text-emerald-100 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Schedule a facility tour and see our operations firsthand
                </p>
                <a
                  href="/contact"
                  className="inline-block bg-white text-emerald-900 px-8 py-3 rounded-lg font-bold hover:bg-emerald-50 transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Schedule Visit
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
