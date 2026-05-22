import React from 'react';
import { FileText, CheckCircle, Package, Ship, FileCheck, Globe } from 'lucide-react';

const steps = [
  {
    icon: FileText,
    title: 'Inquiry & Quotation',
    description: 'Share your requirements (product, quantity, destination). We provide detailed quote within 24 hours.',
    timeline: 'Day 1',
    details: ['Product specifications', 'Quantity & packaging', 'Shipping terms', 'Price quotation']
  },
  {
    icon: CheckCircle,
    title: 'Order Confirmation',
    description: 'Review and confirm order details. Sign proforma invoice and arrange advance payment as per terms.',
    timeline: 'Day 2-3',
    details: ['Proforma invoice', 'Payment terms agreement', 'Delivery schedule', 'Quality specifications']
  },
  {
    icon: Package,
    title: 'Production & Quality Check',
    description: 'We process your order with strict quality control. Multi-stage testing ensures premium quality.',
    timeline: 'Day 4-10',
    details: ['Raw material sourcing', 'Processing & packaging', 'Lab testing', 'Quality certification']
  },
  {
    icon: FileCheck,
    title: 'Documentation',
    description: 'Complete export documentation prepared including certificates, invoices, and customs papers.',
    timeline: 'Day 11-12',
    details: ['Commercial invoice', 'Packing list', 'Certificate of origin', 'Phytosanitary certificate']
  },
  {
    icon: Ship,
    title: 'Shipping & Logistics',
    description: 'Cargo dispatched via sea/air freight. Real-time tracking provided for complete transparency.',
    timeline: 'Day 13-15',
    details: ['Freight booking', 'Container loading', 'Customs clearance', 'Bill of lading']
  },
  {
    icon: Globe,
    title: 'Delivery & Support',
    description: 'Goods delivered to your destination port. Post-delivery support for smooth customs clearance.',
    timeline: 'Day 16-45',
    details: ['Shipment tracking', 'Arrival notification', 'Document courier', 'After-sales support']
  }
];

const documents = [
  'Commercial Invoice',
  'Packing List',
  'Bill of Lading / Airway Bill',
  'Certificate of Origin',
  'Phytosanitary Certificate',
  'Certificate of Analysis',
  'APEDA Certificate',
  'Fumigation Certificate',
  'Insurance Certificate',
  'GST Invoice'
];

export default function ExportProcess() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Our Export Process
          </h1>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            Seamless 6-step process from inquiry to delivery. Transparent, efficient, and reliable.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-12">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-8 items-start">
              {/* Timeline Line */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-800 to-emerald-900 flex items-center justify-center text-white shadow-lg">
                  <step.icon className="w-8 h-8" />
                </div>
                {index < steps.length - 1 && (
                  <div className="w-0.5 h-24 bg-gradient-to-b from-emerald-800 to-emerald-300 mt-4" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-12">
                <div className="bg-white rounded-xl border-2 border-gray-100 p-6 hover:border-emerald-200 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {step.timeline}
                    </span>
                    <h3 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-gray-700 mb-4 text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {step.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {step.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Documents Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Export Documentation
            </h2>
            <p className="text-xl text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              Complete documentation support for hassle-free customs clearance
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 flex items-center gap-3 hover:border-emerald-600 hover:shadow-md transition-all">
                <FileCheck className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                <span className="font-medium text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>{doc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Ready to Start Your Export Journey?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            Get a detailed quote and timeline for your specific requirements
          </p>
          <a
            href="/contact"
            className="inline-block bg-white text-emerald-900 px-10 py-4 rounded-lg font-bold text-lg hover:bg-emerald-50 transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Request Quote
          </a>
        </div>
      </div>
    </div>
  );
}
