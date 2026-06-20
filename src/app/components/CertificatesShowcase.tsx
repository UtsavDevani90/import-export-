import { Award, CheckCircle2, Shield, FileCheck, Globe2, Leaf } from 'lucide-react';

const certificates = [];

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
