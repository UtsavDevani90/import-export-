import { useState, useEffect } from 'react';
import { X, Send, Package, User, Globe, MessageSquare, Phone, Mail, CheckCircle2 } from 'lucide-react';

interface QuickInquiryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
}

export function QuickInquiryPopup({ isOpen, onClose, productName }: QuickInquiryPopupProps) {
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    email: '',
    phone: '',
    product: productName || '',
    quantity: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (productName) {
      setFormData(prev => ({ ...prev, product: productName }));
    }
  }, [productName]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      setFormData({
        name: '',
        country: '',
        email: '',
        phone: '',
        product: '',
        quantity: '',
        message: '',
      });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Package size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Quick Export Inquiry</h2>
              <p className="text-amber-100 text-sm">Get response within 24 hours</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {submitted ? (
            <div className="py-12 text-center">
              <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
              <h3 className="text-stone-900 font-bold text-2xl mb-2">Inquiry Sent!</h3>
              <p className="text-stone-600 text-sm mb-4">
                Thank you, <strong>{formData.name}</strong>! Our export team will contact you at{' '}
                <strong>{formData.email}</strong> within 24 hours.
              </p>
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm">
                <CheckCircle2 size={16} />
                We'll send you pricing, samples info, and documentation details
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                <strong>💡 Quick Tip:</strong> Provide detailed requirements for faster response
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-stone-700 text-sm font-semibold mb-2">
                    <User size={16} className="text-amber-600" />
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full name"
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-stone-700 text-sm font-semibold mb-2">
                    <Globe size={16} className="text-amber-600" />
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Your country"
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-stone-700 text-sm font-semibold mb-2">
                    <Mail size={16} className="text-amber-600" />
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-stone-700 text-sm font-semibold mb-2">
                    <Phone size={16} className="text-amber-600" />
                    Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 234 567 8900"
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-stone-700 text-sm font-semibold mb-2">
                  <Package size={16} className="text-amber-600" />
                  Product of Interest *
                </label>
                <select
                  name="product"
                  required
                  value={formData.product}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="">Select a product</option>
                  <optgroup label="Powder Spices">
                    <option>Turmeric Powder</option>
                    <option>Chilli Powder</option>
                    <option>Coriander Powder</option>
                    <option>Garam Masala</option>
                  </optgroup>
                  <optgroup label="Whole Spices">
                    <option>Black Pepper</option>
                    <option>White Pepper</option>
                    <option>Cloves</option>
                    <option>Cinnamon</option>
                  </optgroup>
                  <optgroup label="Seeds">
                    <option>Cumin Seeds</option>
                    <option>Ajwain Seeds</option>
                    <option>Fennel Seeds</option>
                  </optgroup>
                  <option>Multiple Products</option>
                  <option>Custom Requirement</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-stone-700 text-sm font-semibold mb-2">
                  <Package size={16} className="text-amber-600" />
                  Required Quantity
                </label>
                <input
                  type="text"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="e.g., 5 MT, 2000 kg, 1 container"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-stone-700 text-sm font-semibold mb-2">
                  <MessageSquare size={16} className="text-amber-600" />
                  Additional Details
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Packaging requirements, destination port, certifications needed, etc."
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Send size={18} />
                Send Inquiry Now
              </button>

              <p className="text-center text-stone-400 text-xs">
                🔒 Your information is secure. We respond within 24 hours.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook to trigger popup
export function useQuickInquiry() {
  const [isOpen, setIsOpen] = useState(false);
  const [productName, setProductName] = useState<string>();

  const openInquiry = (product?: string) => {
    setProductName(product);
    setIsOpen(true);
  };

  const closeInquiry = () => {
    setIsOpen(false);
    setProductName(undefined);
  };

  return { isOpen, openInquiry, closeInquiry, productName };
}
