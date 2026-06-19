import { useState } from "react";
import { Link } from "react-router";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  MessageSquare,
  Globe,
  Building2,
  AlertCircle,
} from "lucide-react";
import { inquiryService } from "../services/api";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    country: "",
    product: "",
    quantity: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await inquiryService.submit(formData);
      setSubmitted(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        "Failed to submit inquiry. Please try again or email us directly."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };


  return (
    <div className="min-h-screen">
      {/* ── Page Header ── */}
      <div className="bg-stone-900 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block bg-amber-500/20 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide mb-4">
            Get In Touch
          </div>
          <h1 className="text-white font-bold text-4xl lg:text-5xl mb-4">Contact Us</h1>
          <p className="text-stone-400 text-base max-w-xl mx-auto">
            Our export team is available to assist with inquiries, samples, pricing, and all
            international trade requirements.
          </p>
          <div className="flex justify-center gap-2 mt-5 text-sm text-stone-400">
            <Link to="/" className="hover:text-amber-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-amber-400">Contact</span>
          </div>
        </div>
      </div>

      {/* ── Quick Contact Bars ── */}
      <div className="bg-amber-600 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 text-white">
          <a
            href="tel:+918200197967"
            className="flex items-center gap-3 justify-center sm:justify-start hover:text-amber-100 transition-colors"
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Phone size={18} />
            </div>
            <div>
              <div className="font-bold text-sm">Call Us</div>
              <div className="text-amber-100 text-xs">+91 8200197967</div>
            </div>
          </a>
          <a
            href="mailto:exports@tanzoraexport.com"
            className="flex items-center gap-3 justify-center hover:text-amber-100 transition-colors"
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Mail size={18} />
            </div>
            <div>
              <div className="font-bold text-sm">Email Us</div>
              <div className="text-amber-100 text-xs">exports@tanzoraexport.com</div>
            </div>
          </a>
          <a
            href="https://wa.me/918200197967"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 justify-center sm:justify-end hover:text-amber-100 transition-colors"
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <MessageSquare size={18} />
            </div>
            <div>
              <div className="font-bold text-sm">WhatsApp</div>
              <div className="text-amber-100 text-xs">Chat with export team</div>
            </div>
          </a>
        </div>
      </div>

      {/* ── Main Content ── */}
      <section className="py-16 px-4 bg-amber-50">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-10">
          {/* Contact Info Panel */}
          <div className="space-y-6">
            {/* Office */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-amber-100">
              <div className="flex items-center gap-2 mb-4">
                <Building2 size={20} className="text-amber-600" />
                <h3 className="text-stone-900 font-bold text-base">Export Office</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex gap-2 text-stone-600">
                  <MapPin size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    Town Hall shopping center, 54,<br />
                    Amreli, Gujarat – 365601, India
                  </div>
                </div>
                <div className="flex gap-2 text-stone-600">
                  <Phone size={16} className="text-amber-500 shrink-0" />
                  <div>
                    <a href="tel:+918200197967" className="hover:text-amber-600 block">+91 8200197967</a>
                    <a href="tel:+919876543211" className="hover:text-amber-600 block">+91 98765 43211</a>
                  </div>
                </div>
                <div className="flex gap-2 text-stone-600">
                  <Mail size={16} className="text-amber-500 shrink-0" />
                  <div>
                    <a href="mailto:exports@tanzoraexport.com" className="hover:text-amber-600 block">exports@tanzoraexport.com</a>
                    <a href="mailto:info@tanzoraexport.com" className="hover:text-amber-600 block">info@tanzoraexport.com</a>
                  </div>
                </div>
                <div className="flex gap-2 text-stone-600">
                  <Globe size={16} className="text-amber-500 shrink-0" />
                  <a href="#" className="hover:text-amber-600">www.tanzoraexport.com</a>
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-amber-100">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={20} className="text-amber-600" />
                <h3 className="text-stone-900 font-bold text-base">Business Hours</h3>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  { day: "Monday – Friday", time: "9:00 AM – 7:00 PM IST" },
                  { day: "Saturday", time: "9:00 AM – 3:00 PM IST" },
                  { day: "Sunday", time: "Closed" },
                ].map((item) => (
                  <div key={item.day} className="flex justify-between items-center">
                    <span className="text-stone-600">{item.day}</span>
                    <span className={`font-medium ${item.time === "Closed" ? "text-red-500" : "text-amber-600"}`}>
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-amber-50 rounded-xl p-3 text-xs text-amber-700 border border-amber-100">
                🌍 We respond to international inquiries within <strong>24 hours</strong> on business days.
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/918200197967"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-green-600 hover:bg-green-700 text-white rounded-2xl p-5 text-center transition-colors shadow-md"
            >
              <div className="text-3xl mb-2">💬</div>
              <div className="font-bold text-base mb-1">Chat on WhatsApp</div>
              <div className="text-green-100 text-xs">+91 8200197967</div>
              <div className="text-green-100 text-xs mt-1">Available for quick export queries</div>
            </a>

            {/* Certifications Mini */}
            <div className="bg-white rounded-2xl p-5 shadow-md border border-amber-100">
              <h3 className="text-stone-900 font-bold text-sm mb-3">Our Certifications</h3>
              <div className="flex flex-wrap gap-2">
                {["ISO 22000", "FSSAI", "APEDA", "HACCP", "Kosher"].map((c) => (
                  <span key={c} className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2.5 py-1 rounded-full">
                    ✓ {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md border border-amber-100 p-8">
              <h2 className="text-stone-900 font-bold text-2xl mb-2">Send Export Inquiry</h2>
              <p className="text-stone-500 text-sm mb-7">
                Fill in the form below with your requirements and our export team will respond within
                24 hours with pricing, samples, and documentation details.
              </p>

              {submitted ? (
                <div className="py-12 text-center">
                  <CheckCircle2 size={56} className="text-green-500 mx-auto mb-5" />
                  <h3 className="text-stone-900 font-bold text-2xl mb-2">
                    Inquiry Received!
                  </h3>
                  <p className="text-stone-600 text-sm mb-6 max-w-md mx-auto">
                    Thank you, <strong>{formData.name}</strong>! Your export inquiry has been
                    submitted. Our team will respond to <strong>{formData.email}</strong> within 24
                    business hours.
                  </p>
                  <button
                  onClick={() => { setSubmitted(false); setError(""); setFormData({ name: "", company: "", email: "", phone: "", country: "", product: "", quantity: "", subject: "", message: "" }); }}
                    className="bg-amber-600 text-white px-7 py-3 rounded-xl text-sm font-medium"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-stone-700 text-xs font-semibold block mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-stone-50"
                      />
                    </div>
                    <div>
                      <label className="text-stone-700 text-xs font-semibold block mb-1.5">Company / Business Name *</label>
                      <input
                        type="text"
                        name="company"
                        required
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Your company name"
                        className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-stone-50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-stone-700 text-xs font-semibold block mb-1.5">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@company.com"
                        className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-stone-50"
                      />
                    </div>
                    <div>
                      <label className="text-stone-700 text-xs font-semibold block mb-1.5">Phone / WhatsApp</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 234 567 8900"
                        className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-stone-50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-stone-700 text-xs font-semibold block mb-1.5">Country *</label>
                      <input
                        type="text"
                        name="country"
                        required
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="Your country"
                        className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-stone-50"
                      />
                    </div>
                    <div>
                      <label className="text-stone-700 text-xs font-semibold block mb-1.5">Product of Interest</label>
                      <select
                        name="product"
                        value={formData.product}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-stone-50"
                      >
                        <option value="">Select a product</option>
                        <option>Turmeric Powder</option>
                        <option>Chilli Powder</option>
                        <option>Black Pepper</option>
                        <option>Cumin Seeds</option>
                        <option>Coriander Powder</option>
                        <option>Cloves</option>
                        <option>Cinnamon</option>
                        <option>Ajwain Seeds</option>
                        <option>White Pepper</option>
                        <option>Garam Masala</option>
                        <option>Multiple Products</option>
                        <option>Custom/Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-stone-700 text-xs font-semibold block mb-1.5">Required Quantity</label>
                      <input
                        type="text"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        placeholder="e.g. 5 MT, 2000 kg"
                        className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-stone-50"
                      />
                    </div>
                    <div>
                      <label className="text-stone-700 text-xs font-semibold block mb-1.5">Subject</label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-stone-50"
                      >
                        <option value="">Select subject</option>
                        <option>Price Inquiry</option>
                        <option>Sample Request</option>
                        <option>Product Certification</option>
                        <option>Custom Packaging</option>
                        <option>Private Label</option>
                        <option>Shipping & Logistics</option>
                        <option>General Inquiry</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-stone-700 text-xs font-semibold block mb-1.5">Message / Additional Requirements</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Please describe your requirements: packaging specifications, destination port, certification requirements, payment terms, incoterms preference, etc."
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-stone-50 resize-none"
                    />
                  </div>
                  {error && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-md"
                  >
                    {loading ? (
                      <><span className="animate-spin w-4 h-4 border-2 border-white/40 border-t-white rounded-full" /> Sending...</>
                    ) : (
                      <><Send size={17} /> Submit Export Inquiry</>
                    )}
                  </button>
                  <p className="text-center text-stone-400 text-xs">
                    By submitting this form you agree to our privacy policy. We never share your data.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Google Map ── */}
      <section className="py-10 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-5">
            <MapPin size={20} className="text-amber-600" />
            <h2 className="text-stone-900 font-bold text-xl">Our Location – Amreli, Gujarat, India</h2>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl border border-amber-100 h-80">
            <iframe
              title="Tanzora Export Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14692.17703068748!2d72.3869963!3d23.8051048..."
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="flex flex-wrap gap-3 mt-4 text-sm text-stone-600">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-amber-500" />
              Town Hall shopping center, 54, Amreli, Gujarat 365601, India
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <a
                href="https://maps.google.com/?q=Amreli+Gujarat+India"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 hover:text-amber-700 font-medium text-xs underline"
              >
                Open in Google Maps →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Branch Offices ── */}
      <section className="py-12 px-4 bg-amber-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-stone-900 font-bold text-xl mb-6">Our Offices</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                type: "Head Office & Factory",
                location: "Amreli, Gujarat",
                address: "Town Hall shopping center, 54, Amreli, Gujarat 365601",
                phone: "+91 8200197967",
                email: "exports@tanzoraexport.com",
              },
           
             
            ].map((office) => (
              <div
                key={office.type}
                className="bg-white rounded-2xl p-6 shadow-md border border-amber-100 hover:shadow-lg transition-shadow"
              >
                <div className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
                  {office.type}
                </div>
                <h3 className="text-stone-900 font-bold text-base mb-3">{office.location}</h3>
                <div className="space-y-2 text-xs text-stone-600">
                  <div className="flex gap-1.5">
                    <MapPin size={13} className="text-amber-500 mt-0.5 shrink-0" />
                    {office.address}
                  </div>
                  <div className="flex gap-1.5">
                    <Phone size={13} className="text-amber-500 shrink-0" />
                    <a href={`tel:${office.phone.replace(/\s/g, "")}`} className="hover:text-amber-600">{office.phone}</a>
                  </div>
                  <div className="flex gap-1.5">
                    <Mail size={13} className="text-amber-500 shrink-0" />
                    <a href={`mailto:${office.email}`} className="hover:text-amber-600">{office.email}</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
