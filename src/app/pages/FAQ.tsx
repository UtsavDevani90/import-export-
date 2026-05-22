import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: 'Export & Shipping',
    question: 'What is your minimum order quantity (MOQ)?',
    answer: 'MOQ varies by product: Powder Spices - 500 kg, Whole Spices - 1000 kg, Oil Seeds - 2000 kg. We can discuss flexible terms for first-time buyers.'
  },
  {
    category: 'Export & Shipping',
    question: 'Which countries do you export to?',
    answer: 'We export to 24+ countries including USA, UK, UAE, Saudi Arabia, Germany, Singapore, Malaysia, Australia, and more across Middle East, Europe, Asia, and Africa.'
  },
  {
    category: 'Export & Shipping',
    question: 'What shipping terms do you offer?',
    answer: 'We offer FOB, CIF, C&F, EXW, and FCA terms. Our logistics team handles complete documentation and ensures timely delivery.'
  },
  {
    category: 'Export & Shipping',
    question: 'How long does shipping take?',
    answer: 'Typically 15-30 days depending on destination. Air freight: 5-7 days, Sea freight: 20-35 days. We provide real-time tracking for all shipments.'
  },
  {
    category: 'Payment & Pricing',
    question: 'What payment methods do you accept?',
    answer: 'We accept T/T (Telegraphic Transfer), L/C (Letter of Credit), D/P (Documents against Payment), and D/A (Documents against Acceptance).'
  },
  {
    category: 'Payment & Pricing',
    question: 'Do you provide samples?',
    answer: 'Yes, we provide free samples up to 500g. Courier charges are borne by the buyer. For larger sample quantities, nominal charges apply.'
  },
  {
    category: 'Payment & Pricing',
    question: 'Can I get a custom quote?',
    answer: 'Absolutely! Contact us with your requirements (product, quantity, destination) and we\'ll provide a detailed quote within 24 hours.'
  },
  {
    category: 'Quality & Certification',
    question: 'What quality certifications do you have?',
    answer: 'We hold ISO 22000:2018, FSSAI, APEDA, HACCP, Spice Board India, MSME, IEC, GST, and Kosher certifications ensuring international quality standards.'
  },
  {
    category: 'Quality & Certification',
    question: 'How do you ensure product quality?',
    answer: 'Multi-stage quality control: raw material inspection, processing monitoring, lab testing (moisture, purity, microbial), and final packaging inspection.'
  },
  {
    category: 'Quality & Certification',
    question: 'Do you provide quality certificates with shipments?',
    answer: 'Yes, every shipment includes Certificate of Analysis, Phytosanitary Certificate, Certificate of Origin, and other required export documents.'
  },
  {
    category: 'Products & Packaging',
    question: 'What packaging options are available?',
    answer: 'PP bags (25/50kg), HDPE bags, Jute bags, Vacuum packs, Carton boxes, and custom private labeling with your brand.'
  },
  {
    category: 'Products & Packaging',
    question: 'Can you do private labeling?',
    answer: 'Yes, we offer complete private labeling services including custom packaging design, branding, and labeling as per your specifications.'
  },
  {
    category: 'Products & Packaging',
    question: 'What is the shelf life of your products?',
    answer: 'Whole spices: 24 months, Powder spices: 18 months, Oil seeds: 12 months when stored in cool, dry conditions in original packaging.'
  },
  {
    category: 'Business & Partnership',
    question: 'Do you work with distributors?',
    answer: 'Yes, we welcome partnerships with distributors, wholesalers, and retailers worldwide. We offer competitive pricing and dedicated support.'
  },
  {
    category: 'Business & Partnership',
    question: 'Can I visit your facility?',
    answer: 'Yes, clients are welcome to visit our office for business discussions and sourcing consultations.'
  }
];

const categories = ['All', 'Export & Shipping', 'Payment & Pricing', 'Quality & Certification', 'Products & Packaging', 'Business & Partnership'];

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFAQs = activeCategory === 'All' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-emerald-100" style={{ fontFamily: 'Inter, sans-serif' }}>
            Everything you need to know about exporting spices with Tanzora
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                activeCategory === category
                  ? 'bg-emerald-800 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200'
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <span className="text-xs font-semibold text-amber-600 mb-1 block" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {faq.category}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {faq.question}
                  </h3>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-emerald-800 transition-transform flex-shrink-0 ml-4 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5 pt-2">
                  <p className="text-gray-700 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 bg-gradient-to-r from-emerald-800 to-emerald-900 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Still Have Questions?
          </h2>
          <p className="text-emerald-100 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
            Our export team is ready to assist you with any queries
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/contact"
              className="bg-white text-emerald-900 px-8 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Contact Us
            </a>
            <a
              href="https://wa.me/918200197967"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
