import { Link } from 'react-router';
import { ArrowRight, Shield, Award, CheckCircle2, FileCheck } from 'lucide-react';
import { CertificateSection } from '../components/CertificateSection';

const trustBadges = [
  {
    icon: '🏆',
    title: 'ISO 22000:2018 Certified',
    desc: 'International food safety management system',
  },
  {
    icon: '✅',
    title: 'FSSAI Licensed',
    desc: 'Food safety & hygiene compliance',
  },
  {
    icon: '🌍',
    title: 'APEDA Registered',
    desc: 'Authorized agricultural exporter',
  },
  {
    icon: '📋',
    title: 'HACCP Compliant',
    desc: 'Hazard analysis & critical control',
  },
  {
    icon: '🇮🇳',
    title: 'Spice Board Member',
    desc: 'Govt. of India registered exporter',
  },
  {
    icon: '🔒',
    title: 'IEC Authorized',
    desc: 'Import-export code holder',
  },
];

const qualityStandards = [
  {
    title: 'In-House Laboratory',
    desc: 'NABL accredited lab for physical, chemical, and microbiological testing',
    icon: '🔬',
  },
  {
    title: 'Third-Party Audits',
    desc: 'Regular inspections by SGS, Bureau Veritas, and Intertek',
    icon: '🔍',
  },
  {
    title: 'Traceability System',
    desc: 'Complete farm-to-export tracking with batch coding',
    icon: '📊',
  },
  {
    title: 'Quality Documentation',
    desc: 'COA, COO, Phytosanitary, and Health certificates for every shipment',
    icon: '📄',
  },
];

export function Certificates() {
  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="relative bg-stone-900 py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNEOTc3MDYiIGZpbGwtb3BhY2l0eT0iMC40Ij48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/40 text-amber-400 text-xs font-semibold px-4 py-2 rounded-full mb-4">
            <Shield size={14} />
            Certified & Verified
          </div>
          <h1 className="text-white font-bold text-4xl lg:text-5xl mb-4">
            Our Certifications & <span className="text-amber-400">Credentials</span>
          </h1>
          <p className="text-stone-400 text-base max-w-2xl mx-auto leading-relaxed">
            We hold all necessary certifications and registrations required for international spice
            export. Every certificate is verified, regularly audited, and compliant with global
            food safety standards.
          </p>
          <div className="flex justify-center gap-2 mt-5 text-sm text-stone-400">
            <Link to="/" className="hover:text-amber-400 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-amber-400">Certificates</span>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {trustBadges.map((badge) => (
              <div
                key={badge.title}
                className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <div className="text-stone-900 font-bold text-xs mb-1">{badge.title}</div>
                <div className="text-stone-500 text-xs leading-tight">{badge.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      

      {/* Quality Standards */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide mb-3">
              Quality Assurance
            </div>
            <h2 className="text-stone-900 font-bold text-3xl lg:text-4xl mb-4">
              Our Quality <span className="text-amber-600">Standards</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {qualityStandards.map((standard) => (
              <div
                key={standard.title}
                className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-2xl p-6 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{standard.icon}</div>
                <h3 className="text-stone-900 font-bold text-lg mb-2">{standard.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{standard.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Statement */}
      <section className="py-16 px-4 bg-stone-900">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-stone-800 to-stone-800/50 border border-stone-700 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                  <FileCheck size={24} className="text-amber-400" />
                </div>
                <h3 className="text-white font-bold text-xl">Compliance Statement</h3>
              </div>
              <p className="text-stone-300 text-sm leading-relaxed mb-4">
                Tanzora Export is fully compliant with all Indian and international regulations
                governing the export of spices and food products. Our facility undergoes regular
                third-party audits, and we maintain complete documentation for traceability,
                quality control, and food safety.
              </p>
              <p className="text-stone-300 text-sm leading-relaxed mb-6">
                We are committed to maintaining the highest standards of quality, safety, and
                ethical business practices. All our certifications are current, verified, and
                available for inspection by authorized buyers and regulatory agencies.
              </p>
              <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                <CheckCircle2 size={16} />
                <span>All certificates verified and up-to-date as of 2024</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Certifications Matter */}
      <section className="py-20 px-4 bg-amber-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-stone-900 font-bold text-3xl lg:text-4xl mb-4">
              Why Certifications <span className="text-amber-600">Matter</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-amber-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Shield size={24} className="text-green-600" />
              </div>
              <h3 className="text-stone-900 font-bold text-lg mb-2">Food Safety Assurance</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Our ISO 22000 and HACCP certifications ensure that every product meets
                international food safety standards from farm to export.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md border border-amber-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Award size={24} className="text-blue-600" />
              </div>
              <h3 className="text-stone-900 font-bold text-lg mb-2">Legal Compliance</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                APEDA, FSSAI, and IEC registrations ensure full legal compliance for smooth customs
                clearance and hassle-free imports.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md border border-amber-100">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle2 size={24} className="text-amber-600" />
              </div>
              <h3 className="text-stone-900 font-bold text-lg mb-2">Buyer Confidence</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Verified certifications build trust with international buyers, ensuring quality,
                authenticity, and reliability in every shipment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-amber-700 to-amber-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-white font-bold text-3xl mb-4">
            Need Certificate Verification?
          </h2>
          <p className="text-amber-100 text-sm mb-6 max-w-xl mx-auto">
            We provide complete documentation including certificates, test reports, and compliance
            documents with every export shipment.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-white text-amber-700 hover:bg-amber-50 px-8 py-3.5 rounded-xl font-bold text-sm transition-colors shadow-xl"
          >
            Contact Our Export Team <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
