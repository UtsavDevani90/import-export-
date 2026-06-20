import axios from 'axios';
import { useState } from 'react';
import { Package, User, Building2, Mail, Phone, Globe, MapPin, FileText, DollarSign, Truck, Calendar, CheckCircle2, Plus, Trash2 } from 'lucide-react';

interface ProductLine {
  product: string;
  quantity: string;
  packaging: string;
}

export function BulkOrderForm() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    businessType: '',
    paymentTerms: '',
    shippingTerms: '',
    destinationPort: '',
    targetDelivery: '',
    additionalInfo: '',
  });

  const [productLines, setProductLines] = useState<ProductLine[]>([
    { product: '', quantity: '', packaging: '' },
  ]);

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const inquiryData = {
      name: formData.name,
      company: formData.company,
      email: formData.email,
      phone: formData.phone,
      country: formData.country,
      product: productLines.map((p) => p.product).join(', '),
      quantity: productLines.map((p) => p.quantity).join(', '),
      message: formData.additionalInfo,
      subject: 'Bulk Order Inquiry',
    };

    const response = await fetch(
      'https://import-export-jhik.onrender.com/api/inquiries',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inquiryData),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to submit inquiry');
    }

    setSubmitted(true);

  } catch (error) {
    console.error('Inquiry Error:', error);
    alert('Failed to submit inquiry');
  }
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addProductLine = () => {
    setProductLines([...productLines, { product: '', quantity: '', packaging: '' }]);
  };

  const removeProductLine = (index: number) => {
    setProductLines(productLines.filter((_, i) => i !== index));
  };

  const updateProductLine = (index: number, field: keyof ProductLine, value: string) => {
    const updated = [...productLines];
    updated[index][field] = value;
    setProductLines(updated);
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center shadow-xl border border-amber-100">
        <CheckCircle2 size={72} className="text-green-500 mx-auto mb-6" />
        <h2 className="text-stone-900 font-bold text-3xl mb-3">Bulk Order Inquiry Received!</h2>
        <p className="text-stone-600 text-base mb-6 max-w-xl mx-auto">
          Thank you, <strong>{formData.name}</strong>! Your bulk order inquiry has been submitted successfully.
          Our export team will review your requirements and send a detailed quotation to{' '}
          <strong>{formData.email}</strong> within 24-48 hours.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 max-w-md mx-auto mb-6">
          <h3 className="font-bold text-stone-900 mb-3">What happens next?</h3>
          <ul className="text-left text-sm text-stone-600 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
              Our team reviews your requirements
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
              We prepare detailed quotation with FOB/CIF pricing
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
              Sample arrangements (if requested)
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
              Complete documentation and shipping details
            </li>
          </ul>
        </div>
        <button
          onClick={() => {
            setSubmitted(false);
            setFormData({
              name: '',
              company: '',
              email: '',
              phone: '',
              country: '',
              city: '',
              businessType: '',
              paymentTerms: '',
              shippingTerms: '',
              destinationPort: '',
              targetDelivery: '',
              additionalInfo: '',
            });
            setProductLines([{ product: '', quantity: '', packaging: '' }]);
          }}
          className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-xl font-medium transition-colors"
        >
          Submit Another Inquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-xl border border-amber-100 space-y-8">
      {/* Company Information */}
      <div>
        <h3 className="text-stone-900 font-bold text-xl mb-4 flex items-center gap-2">
          <Building2 size={24} className="text-amber-600" />
          Company Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-stone-700 text-sm font-semibold block mb-2">Full Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="text-stone-700 text-sm font-semibold block mb-2">Company Name *</label>
            <input
              type="text"
              name="company"
              required
              value={formData.company}
              onChange={handleChange}
              placeholder="Your company name"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="text-stone-700 text-sm font-semibold block mb-2">Email Address *</label>
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
            <label className="text-stone-700 text-sm font-semibold block mb-2">Phone / WhatsApp *</label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 234 567 8900"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="text-stone-700 text-sm font-semibold block mb-2">Country *</label>
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
          <div>
            <label className="text-stone-700 text-sm font-semibold block mb-2">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Your city"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-stone-700 text-sm font-semibold block mb-2">Business Type *</label>
            <select
              name="businessType"
              required
              value={formData.businessType}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">Select business type</option>
              <option>Importer / Distributor</option>
              <option>Wholesaler</option>
              <option>Food Manufacturer</option>
              <option>Retail Chain</option>
              <option>Restaurant / Hotel Chain</option>
              <option>Trading Company</option>
              <option>Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Requirements */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-stone-900 font-bold text-xl flex items-center gap-2">
            <Package size={24} className="text-amber-600" />
            Product Requirements
          </h3>
          <button
            type="button"
            onClick={addProductLine}
            className="flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>

        <div className="space-y-4">
          {productLines.map((line, index) => (
            <div key={index} className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-amber-700 font-semibold text-sm">Product #{index + 1}</span>
                {productLines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProductLine(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-stone-700 text-xs font-semibold block mb-1">Product *</label>
                  <select
                    required
                    value={line.product}
                    onChange={(e) => updateProductLine(index, 'product', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="">Select product</option>
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
                  </select>
                </div>
                <div>
                  <label className="text-stone-700 text-xs font-semibold block mb-1">Quantity *</label>
                  <input
                    type="text"
                    required
                    value={line.quantity}
                    onChange={(e) => updateProductLine(index, 'quantity', e.target.value)}
                    placeholder="e.g., 10 MT"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="text-stone-700 text-xs font-semibold block mb-1">Packaging</label>
                  <select
                    value={line.packaging}
                    onChange={(e) => updateProductLine(index, 'packaging', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="">Select packaging</option>
                    <option>25 kg PP Bags</option>
                    <option>50 kg PP Bags</option>
                    <option>10 kg Cartons</option>
                    <option>Custom Packaging</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping & Payment Terms */}
      <div>
        <h3 className="text-stone-900 font-bold text-xl mb-4 flex items-center gap-2">
          <Truck size={24} className="text-amber-600" />
          Shipping & Payment Terms
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-stone-700 text-sm font-semibold block mb-2">Preferred Shipping Terms</label>
            <select
              name="shippingTerms"
              value={formData.shippingTerms}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">Select shipping terms</option>
              <option>FOB (Free on Board)</option>
              <option>CIF (Cost, Insurance & Freight)</option>
              <option>C&F (Cost & Freight)</option>
              <option>EXW (Ex Works)</option>
            </select>
          </div>
          <div>
            <label className="text-stone-700 text-sm font-semibold block mb-2">Preferred Payment Terms</label>
            <select
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">Select payment terms</option>
              <option>T/T (Bank Transfer)</option>
              <option>L/C at Sight</option>
              <option>30% Advance + 70% Against Documents</option>
            </select>
          </div>
          <div>
            <label className="text-stone-700 text-sm font-semibold block mb-2">Destination Port</label>
            <input
              type="text"
              name="destinationPort"
              value={formData.destinationPort}
              onChange={handleChange}
              placeholder="e.g., Port of Los Angeles"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="text-stone-700 text-sm font-semibold block mb-2">Target Delivery Date</label>
            <input
              type="text"
              name="targetDelivery"
              value={formData.targetDelivery}
              onChange={handleChange}
              placeholder="e.g., Within 30 days"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div>
        <label className="text-stone-700 text-sm font-semibold block mb-2">Additional Information</label>
        <textarea
          name="additionalInfo"
          value={formData.additionalInfo}
          onChange={handleChange}
          rows={4}
          placeholder="Any specific requirements: certifications needed, quality specifications, private labeling, inspection requirements, etc."
          className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white py-4 rounded-xl font-bold text-base transition-all shadow-lg"
      >
        Submit Bulk Order Inquiry
      </button>

      <p className="text-center text-stone-400 text-xs">
        🔒 Your information is secure and confidential. We respond within 24-48 hours with detailed quotation.
      </p>
    </form>
  );
}
