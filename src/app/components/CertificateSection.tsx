import { useState } from 'react';
import { Download, X, ExternalLink, CheckCircle2, FileText, Shield } from 'lucide-react';

interface Certificate {
  id: string;
  name: string;
  fullName: string;
  issuer: string;
  certNumber: string;
  issueDate: string;
  validUntil: string;
  description: string;
  icon: any;
  color: string;
  gradient: string;
  pdfUrl: string;
  imagePreview: string;
}

const certificates: Certificate[] = [
  
];

export function CertificateSection() {
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {certificates.map((cert) => {
          const Icon = cert.icon;
          return (
            <div
              key={cert.id}
              className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 border border-stone-200 hover:border-amber-300 hover:-translate-y-2 cursor-pointer"
              onClick={() => setSelectedCert(cert)}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${cert.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-4`}
                >
                  <Icon size={32} className="text-white" />
                </div>
                <h3 className="text-stone-900 font-bold text-lg mb-1">{cert.name}</h3>
                <p className="text-stone-500 text-xs leading-tight mb-3">{cert.fullName}</p>
                <div className="bg-stone-50 rounded-lg px-3 py-2 border border-stone-200 w-full mb-3">
                  <div className="text-stone-400 text-xs mb-0.5">Certificate No.</div>
                  <div className="text-stone-700 font-mono text-xs font-semibold truncate">
                    {cert.certNumber}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-green-600 text-xs font-medium mb-4">
                  <CheckCircle2 size={14} />
                  <span>Verified & Active</span>
                </div>
                <div className="flex gap-2 w-full">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCert(cert);
                    }}
                    className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <ExternalLink size={12} /> View
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Simulate download
                      alert(`Downloading ${cert.name} certificate...`);
                    }}
                    className="flex-1 bg-stone-900 hover:bg-stone-800 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Download size={12} /> PDF
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Certificate Modal */}
      {selectedCert && (
        <CertificateModal cert={selectedCert} onClose={() => setSelectedCert(null)} />
      )}
    </>
  );
}

function CertificateModal({ cert, onClose }: { cert: Certificate; onClose: () => void }) {
  const Icon = cert.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in">
        {/* Header */}
        <div className={`bg-gradient-to-r ${cert.gradient} p-6 text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <Icon size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">{cert.name}</h2>
              <p className="text-white/90 text-sm">{cert.fullName}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Certificate Details */}
            <div className="space-y-4">
              <div>
                <div className="text-stone-500 text-xs font-semibold uppercase tracking-wide mb-1">
                  Issuing Authority
                </div>
                <div className="text-stone-900 font-medium">{cert.issuer}</div>
              </div>
              <div>
                <div className="text-stone-500 text-xs font-semibold uppercase tracking-wide mb-1">
                  Certificate Number
                </div>
                <div className="text-stone-900 font-mono font-semibold">{cert.certNumber}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-stone-500 text-xs font-semibold uppercase tracking-wide mb-1">
                    Issue Date
                  </div>
                  <div className="text-stone-900 font-medium">{cert.issueDate}</div>
                </div>
                <div>
                  <div className="text-stone-500 text-xs font-semibold uppercase tracking-wide mb-1">
                    Valid Until
                  </div>
                  <div className="text-green-600 font-semibold">{cert.validUntil}</div>
                </div>
              </div>
              <div>
                <div className="text-stone-500 text-xs font-semibold uppercase tracking-wide mb-2">
                  Description
                </div>
                <p className="text-stone-600 text-sm leading-relaxed">{cert.description}</p>
              </div>
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                <CheckCircle2 size={20} className="text-green-600" />
                <div>
                  <div className="text-green-900 font-semibold text-sm">Verified Certificate</div>
                  <div className="text-green-600 text-xs">Authenticated by issuing authority</div>
                </div>
              </div>
            </div>

            {/* Certificate Preview */}
            <div>
              <div className="text-stone-500 text-xs font-semibold uppercase tracking-wide mb-2">
                Certificate Preview
              </div>
              <div className="bg-stone-100 rounded-xl overflow-hidden border-2 border-stone-200 aspect-[3/4]">
                <img
                  src={cert.imagePreview}
                  alt={`${cert.name} Certificate`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-stone-200">
            <button
              onClick={() => alert(`Downloading ${cert.name} certificate...`)}
              className={`flex-1 bg-gradient-to-r ${cert.gradient} hover:opacity-90 text-white px-6 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2`}
            >
              <Download size={16} /> Download PDF
            </button>
            <button
              onClick={() => alert(`Opening ${cert.name} in new window...`)}
              className="flex-1 bg-stone-900 hover:bg-stone-800 text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink size={16} /> Open Full View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
