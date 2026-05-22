import { Link } from 'react-router';
import { Package, DollarSign, Ship, FileText, Globe, TrendingUp, CheckCircle2, Info, ArrowRight } from 'lucide-react';

const hsCodeData = [
  {
    product: 'Turmeric Powder',
    hsCode: '0910 30 10',
    description: 'Turmeric (curcuma), ground',
    moq: '500 kg',
    avgDuty: '0-10%',
  },
  {
    product: 'Chilli Powder',
    hsCode: '0904 22 19',
    description: 'Fruits of genus Capsicum, dried, crushed or ground',
    moq: '500 kg',
    avgDuty: '0-15%',
  },
  {
    product: 'Black Pepper',
    hsCode: '0904 11 00',
    description: 'Pepper, neither crushed nor ground',
    moq: '250 kg',
    avgDuty: '0-12%',
  },
  {
    product: 'Cumin Seeds',
    hsCode: '0909 21 00',
    description: 'Coriander seeds, neither crushed nor ground',
    moq: '500 kg',
    avgDuty: '0-8%',
  },
  {
    product: 'Coriander Powder',
    hsCode: '0909 21 00',
    description: 'Coriander seeds, crushed or ground',
    moq: '500 kg',
    avgDuty: '0-8%',
  },
  {
    product: 'Cloves',
    hsCode: '0907 10 00',
    description: 'Cloves (whole fruit, cloves and stems)',
    moq: '100 kg',
    avgDuty: '0-10%',
  },
  {
    product: 'Cinnamon',
    hsCode: '0906 11 00',
    description: 'Cinnamon (Cinnamomum zeylanicum Blume)',
    moq: '250 kg',
    avgDuty: '0-12%',
  },
];

const packagingOptions = [
  {
    type: '25 kg PP Bags',
    description: 'Polypropylene woven bags with inner liner',
    suitable: 'Powder spices, seeds',
    icon: '📦',
  },
  {
    type: '50 kg PP Bags',
    description: 'Heavy-duty PP bags for bulk orders',
    suitable: 'All spices',
    icon: '📦',
  },
  {
    type: '10 kg Cartons',
    description: 'Corrugated cartons with inner bags',
    suitable: 'Whole spices, premium products',
    icon: '📦',
  },
  {
    type: 'Jute Bags',
    description: 'Eco-friendly natural jute bags',
    suitable: 'Organic products',
    icon: '🌿',
  },
  {
    type: 'Custom Retail Packaging',
    description: 'Private label, pouches, jars',
    suitable: 'Retail distribution',
    icon: '🏪',
  },
  {
    type: 'Vacuum Sealed',
    description: 'Extended shelf life packaging',
    suitable: 'Premium exports',
    icon: '🔒',
  },
];

const paymentTerms = [
  {
    term: 'T/T (Bank Transfer)',
    description: 'Telegraphic Transfer - Most common for international trade',
    typical: '30% advance + 70% against documents',
    icon: '💳',
  },
  {
    term: 'L/C at Sight',
    description: 'Letter of Credit - Secure payment method',
    typical: 'Payment upon presentation of documents',
    icon: '📄',
  },
  {
    term: 'DP (Documents against Payment)',
    description: 'Documents released upon payment',
    typical: '100% payment before document release',
    icon: '💰',
  },
  {
    term: 'DA (Documents against Acceptance)',
    description: 'Documents released upon acceptance of draft',
    typical: 'Payment within agreed credit period',
    icon: '✍️',
  },
];

const incoterms = [
  {
    term: 'FOB',
    fullName: 'Free on Board',
    description: 'Seller delivers goods on board the vessel at the port of shipment. Buyer bears all costs and risks from that point.',
    sellerResponsibility: 'Export clearance, loading on vessel',
    buyerResponsibility: 'Sea freight, insurance, import clearance',
    bestFor: 'Buyers with own freight forwarders',
    popular: true,
  },
  {
    term: 'CIF',
    fullName: 'Cost, Insurance and Freight',
    description: 'Seller pays for shipping and insurance to destination port. Risk transfers when goods are loaded on vessel.',
    sellerResponsibility: 'Export clearance, sea freight, marine insurance',
    buyerResponsibility: 'Import clearance, destination charges',
    bestFor: 'Buyers preferring door-to-port service',
    popular: true,
  },
  {
    term: 'C&F (CFR)',
    fullName: 'Cost and Freight',
    description: 'Similar to CIF but without insurance. Seller pays freight to destination port.',
    sellerResponsibility: 'Export clearance, sea freight',
    buyerResponsibility: 'Insurance, import clearance',
    bestFor: 'Buyers arranging own insurance',
    popular: true,
  },
  {
    term: 'EXW',
    fullName: 'Ex Works',
    description: 'Buyer collects goods from seller\'s premises. Seller has minimal responsibility.',
    sellerResponsibility: 'Make goods available at factory',
    buyerResponsibility: 'All transportation, export/import clearance',
    bestFor: 'Experienced buyers with local agents',
    popular: false,
  },
  {
    term: 'FCA',
    fullName: 'Free Carrier',
    description: 'Seller delivers goods to carrier nominated by buyer at agreed location.',
    sellerResponsibility: 'Export clearance, delivery to carrier',
    buyerResponsibility: 'Main carriage, insurance, import clearance',
    bestFor: 'Air freight shipments',
    popular: false,
  },
];

export function TradeInformation() {
  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="bg-stone-900 py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNEOTc3MDYiIGZpbGwtb3BhY2l0eT0iMC40Ij48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/40 text-amber-400 text-xs font-semibold px-4 py-2 rounded-full mb-4">
            <Globe size={14} />
            International Trade
          </div>
          <h1 className="text-white font-bold text-4xl lg:text-5xl mb-4">
            Trade <span className="text-amber-400">Information</span>
          </h1>
          <p className="text-stone-400 text-base max-w-2xl mx-auto leading-relaxed">
            Complete guide to HS codes, MOQ, packaging options, payment terms, shipping terms, and
            Incoterms for importing spices from India.
          </p>
          <div className="flex justify-center gap-2 mt-5 text-sm text-stone-400">
            <Link to="/" className="hover:text-amber-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-amber-400">Trade Info</span>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-amber-600 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-4 text-white">
          <a href="#hs-codes" className="flex items-center gap-2 hover:text-amber-100 transition-colors">
            <FileText size={16} /> HS Codes
          </a>
          <span className="text-amber-300">|</span>
          <a href="#moq" className="flex items-center gap-2 hover:text-amber-100 transition-colors">
            <Package size={16} /> MOQ
          </a>
          <span className="text-amber-300">|</span>
          <a href="#packaging" className="flex items-center gap-2 hover:text-amber-100 transition-colors">
            <Package size={16} /> Packaging
          </a>
          <span className="text-amber-300">|</span>
          <a href="#payment" className="flex items-center gap-2 hover:text-amber-100 transition-colors">
            <DollarSign size={16} /> Payment Terms
          </a>
          <span className="text-amber-300">|</span>
          <a href="#incoterms" className="flex items-center gap-2 hover:text-amber-100 transition-colors">
            <Ship size={16} /> Incoterms
          </a>
        </div>
      </div>

      {/* HS Codes Section */}
      <section id="hs-codes" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide mb-3">
              HS Codes
            </div>
            <h2 className="text-stone-900 font-bold text-3xl lg:text-4xl mb-4">
              Harmonized System <span className="text-amber-600">Codes</span>
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto text-sm leading-relaxed">
              HS codes are internationally standardized codes for classifying traded products. Use these
              codes for customs clearance and duty calculation.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-amber-600 to-amber-500">
                    <th className="text-left px-6 py-4 text-white font-bold text-sm">Product</th>
                    <th className="text-left px-6 py-4 text-white font-bold text-sm">HS Code</th>
                    <th className="text-left px-6 py-4 text-white font-bold text-sm">Description</th>
                    <th className="text-left px-6 py-4 text-white font-bold text-sm">MOQ</th>
                    <th className="text-left px-6 py-4 text-white font-bold text-sm">Avg. Import Duty</th>
                  </tr>
                </thead>
                <tbody>
                  {hsCodeData.map((item, index) => (
                    <tr
                      key={index}
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-amber-50'} border-b border-stone-100 last:border-0 hover:bg-amber-100 transition-colors`}
                    >
                      <td className="px-6 py-4 text-stone-900 font-semibold text-sm">{item.product}</td>
                      <td className="px-6 py-4 text-amber-600 font-mono font-bold text-sm">{item.hsCode}</td>
                      <td className="px-6 py-4 text-stone-600 text-sm">{item.description}</td>
                      <td className="px-6 py-4 text-stone-700 font-medium text-sm">{item.moq}</td>
                      <td className="px-6 py-4 text-stone-700 text-sm">{item.avgDuty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <strong>💡 Note:</strong> Import duties vary by destination country. Check with your local customs
            authority for exact rates. We provide complete documentation for smooth customs clearance.
          </div>
        </div>
      </section>

      {/* MOQ Section */}
      <section id="moq" className="py-20 px-4 bg-amber-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide mb-3">
              Minimum Order Quantity
            </div>
            <h2 className="text-stone-900 font-bold text-3xl lg:text-4xl mb-4">
              MOQ <span className="text-amber-600">Requirements</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-md border border-amber-100">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-stone-900 font-bold text-xl mb-3">Powder Spices</h3>
              <div className="text-amber-600 font-bold text-3xl mb-2">500 kg</div>
              <p className="text-stone-600 text-sm mb-4">Minimum order per product</p>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                  Turmeric, Chilli, Coriander
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                  Garam Masala, Curry Powder
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-md border border-amber-100">
              <div className="text-4xl mb-4">🫙</div>
              <h3 className="text-stone-900 font-bold text-xl mb-3">Whole Spices</h3>
              <div className="text-amber-600 font-bold text-3xl mb-2">100-250 kg</div>
              <p className="text-stone-600 text-sm mb-4">Varies by product</p>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                  Cloves: 100 kg minimum
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                  Black Pepper, Cinnamon: 250 kg
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-md border border-amber-100">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-stone-900 font-bold text-xl mb-3">Seeds</h3>
              <div className="text-amber-600 font-bold text-3xl mb-2">500 kg</div>
              <p className="text-stone-600 text-sm mb-4">Minimum order per product</p>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                  Cumin, Ajwain, Fennel
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                  Mustard, Fenugreek
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-2xl p-6 shadow-md border border-amber-100">
            <h3 className="text-stone-900 font-bold text-lg mb-4">Sample Orders</h3>
            <p className="text-stone-600 text-sm mb-4">
              We provide free samples (up to 500g per product) for quality evaluation. Courier charges
              to be borne by buyer. Sample orders of 1-5 kg are available for trial purposes.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors"
            >
              Request Sample <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Packaging Section */}
      <section id="packaging" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide mb-3">
              Packaging Options
            </div>
            <h2 className="text-stone-900 font-bold text-3xl lg:text-4xl mb-4">
              Export <span className="text-amber-600">Packaging</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {packagingOptions.map((pkg, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-amber-50 to-white rounded-2xl p-6 border border-amber-100 hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-3">{pkg.icon}</div>
                <h3 className="text-stone-900 font-bold text-lg mb-2">{pkg.type}</h3>
                <p className="text-stone-600 text-sm mb-3">{pkg.description}</p>
                <div className="bg-amber-100 text-amber-700 text-xs px-3 py-1.5 rounded-full inline-block">
                  {pkg.suitable}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Terms Section */}
      <section id="payment" className="py-20 px-4 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide mb-3">
              Payment Terms
            </div>
            <h2 className="text-stone-900 font-bold text-3xl lg:text-4xl mb-4">
              Accepted <span className="text-amber-600">Payment Methods</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {paymentTerms.map((payment, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-md border border-stone-200 hover:border-amber-300 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{payment.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-stone-900 font-bold text-lg mb-2">{payment.term}</h3>
                    <p className="text-stone-600 text-sm mb-3">{payment.description}</p>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                      <div className="text-xs text-amber-700 font-semibold mb-1">Typical Terms:</div>
                      <div className="text-sm text-stone-700">{payment.typical}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-amber-600 rounded-2xl p-6 text-white text-center">
            <h3 className="font-bold text-xl mb-2">Flexible Payment Terms Available</h3>
            <p className="text-amber-100 text-sm">
              For established buyers, we offer favorable payment terms. Contact our export team to discuss.
            </p>
          </div>
        </div>
      </section>

      {/* Incoterms Section */}
      <section id="incoterms" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide mb-3">
              Shipping Terms
            </div>
            <h2 className="text-stone-900 font-bold text-3xl lg:text-4xl mb-4">
              Incoterms <span className="text-amber-600">2020</span>
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto text-sm leading-relaxed">
              International Commercial Terms defining responsibilities between buyer and seller in
              international trade.
            </p>
          </div>

          <div className="space-y-6">
            {incoterms.map((term, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-8 shadow-lg border-2 ${
                  term.popular ? 'border-amber-300 ring-2 ring-amber-100' : 'border-stone-200'
                } hover:shadow-xl transition-all`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-stone-900 font-bold text-2xl">{term.term}</h3>
                      {term.popular && (
                        <span className="bg-amber-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                          Most Popular
                        </span>
                      )}
                    </div>
                    <p className="text-amber-600 font-semibold text-sm">{term.fullName}</p>
                  </div>
                  <Ship size={32} className="text-amber-500" />
                </div>

                <p className="text-stone-600 text-sm mb-6 leading-relaxed">{term.description}</p>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="text-green-700 font-semibold text-xs mb-2">Seller Responsibility</div>
                    <p className="text-stone-700 text-sm">{term.sellerResponsibility}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="text-blue-700 font-semibold text-xs mb-2">Buyer Responsibility</div>
                    <p className="text-stone-700 text-sm">{term.buyerResponsibility}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="text-amber-700 font-semibold text-xs mb-2">Best For</div>
                    <p className="text-stone-700 text-sm">{term.bestFor}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-amber-700 to-amber-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-white font-bold text-3xl mb-4">
            Need Help with Trade Terms?
          </h2>
          <p className="text-amber-100 text-sm mb-6 max-w-xl mx-auto">
            Our export team can guide you through documentation, payment terms, and shipping options
            to ensure smooth international trade.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-white text-amber-700 hover:bg-amber-50 px-8 py-3.5 rounded-xl font-bold text-sm transition-colors shadow-xl"
          >
            Contact Export Team <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
