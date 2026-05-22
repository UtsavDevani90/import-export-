import { Award, CheckCircle2, Shield, FileCheck, Globe2, Leaf } from 'lucide-react';

const certificates = [
  {
    name: 'APEDA',
    fullName: 'Agricultural & Processed Food Products Export Development Authority',
    icon: Globe2,
    color: 'from-green-500 to-green-600',
    description: 'Registered exporter of agricultural products',
    certNo: 'APEDA/2024/12345',
  },
  {
    name: 'FSSAI',
    fullName: 'Food Safety and Standards Authority of India',
    icon: Shield,
    color: 'from-blue-500 to-blue-600',
    description: 'Food safety & hygiene compliance',
    certNo: 'FSSAI-10012345678901',
  },
  {
    name: 'IEC',
    fullName: 'Import Export Code',
    icon: FileCheck,
    color: 'from-purple-500 to-purple-600',
    description: 'Authorized for international trade',
    certNo: 'IEC-0512345678',
  },
  {
    name: 'GST',
    fullName: 'Goods and Services Tax',
    icon: CheckCircle2,
    color: 'from-orange-500 to-orange-600',
    description: 'GST registered business entity',
    certNo: '24XXXXX1234X1ZX',
  },
  {
    name: 'Spice Board India',
    fullName: 'Ministry of Commerce & Industry, Govt. of India',
    icon: Leaf,
    color: 'from-amber-500 to-amber-600',
    description: 'Registered spice exporter member',
    certNo: 'SBI/EXP/2024/5678',
  },
  {
    name: 'ISO 22000:2018',
    fullName: 'Food Safety Management System',
    icon: Award,
    color: 'from-red-500 to-red-600',
    description: 'International food safety standard',
    certNo: 'ISO-22000-2024-IN-001',
  },
];

export function CertificatesShowcase() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {certificates.map((cert) => {
        const Icon = cert.icon;
        return (
          <div
            key={cert.name}
            className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 border border-stone-200 hover:border-amber-300 hover:-translate-y-2"
          >
            <div className="flex items-start gap-4 mb-4">
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cert.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
              >
                <Icon size={28} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-stone-900 font-bold text-lg mb-1">{cert.name}</h3>
                <p className="text-stone-500 text-xs leading-tight">{cert.fullName}</p>
              </div>
            </div>
            <p className="text-stone-600 text-sm mb-3 leading-relaxed">{cert.description}</p>
            <div className="bg-stone-50 rounded-lg px-3 py-2 border border-stone-200">
              <div className="text-stone-400 text-xs mb-0.5">Certificate No.</div>
              <div className="text-stone-700 font-mono text-xs font-semibold">{cert.certNo}</div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-green-600 text-xs font-medium">
              <CheckCircle2 size={14} />
              <span>Verified & Active</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
