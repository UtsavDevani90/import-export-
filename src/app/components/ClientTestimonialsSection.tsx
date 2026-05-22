import { useState } from 'react';
import { Star, Quote, Play, MapPin, Building2, User, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  country: string;
  flag: string;
  rating: number;
  review: string;
  image: string;
  verified: boolean;
  orderVolume?: string;
  partnership?: string;
}

interface VideoTestimonial {
  id: number;
  name: string;
  company: string;
  country: string;
  thumbnail: string;
  duration: string;
  title: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'James O\'Brien',
    role: 'Import Manager',
    company: 'GlobalFoods Ltd.',
    country: 'United Kingdom',
    flag: '🇬🇧',
    rating: 5,
    review: 'Tanzora Export has been our trusted supplier for 6 years. Consistent quality, proper documentation, and always on-time delivery. Their turmeric powder meets our strict EU standards every single time. Highly recommended for any serious importer.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    verified: true,
    orderVolume: '50+ MT annually',
    partnership: '6 years',
  },
  {
    id: 2,
    name: 'Ahmed Al-Rashid',
    role: 'Procurement Director',
    company: 'AlFarouk Trading',
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    rating: 5,
    review: 'We import Turmeric and Chilli Powder from Tanzora regularly. The quality is top-notch, and their export team handles everything efficiently from sample to shipment. Their competitive pricing and reliable logistics make them our preferred supplier.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    verified: true,
    orderVolume: '30+ MT annually',
    partnership: '4 years',
  },
  {
    id: 3,
    name: 'Sarah Chen',
    role: 'Purchasing Head',
    company: 'Pacific Spice Co.',
    country: 'Singapore',
    flag: '🇸🇬',
    rating: 5,
    review: 'Excellent source for authentic Indian spices. Their pre-shipment quality reports are thorough and meet our strict food safety requirements. The ISO certification and HACCP compliance give us complete confidence. A true export partner.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    verified: true,
    orderVolume: '25+ MT annually',
    partnership: '3 years',
  },
  {
    id: 4,
    name: 'Michael Schmidt',
    role: 'Supply Chain Manager',
    company: 'Deutsche Gewürze GmbH',
    country: 'Germany',
    flag: '🇩🇪',
    rating: 5,
    review: 'Professional service from start to finish. Their black pepper and cumin seeds are of exceptional quality. Documentation is always complete and accurate, making customs clearance smooth. We have never had a single quality complaint.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    verified: true,
    orderVolume: '40+ MT annually',
    partnership: '5 years',
  },
  {
    id: 5,
    name: 'Maria Rodriguez',
    role: 'Import Coordinator',
    company: 'Especias del Mundo',
    country: 'Spain',
    flag: '🇪🇸',
    rating: 5,
    review: 'Tanzora provides excellent customer service and high-quality spices. Their response time is impressive, and they always accommodate our specific packaging requirements. The best Indian spice exporter we have worked with.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    verified: true,
    orderVolume: '20+ MT annually',
    partnership: '2 years',
  },
  {
    id: 6,
    name: 'David Thompson',
    role: 'Purchasing Director',
    company: 'American Spice Imports',
    country: 'United States',
    flag: '🇺🇸',
    rating: 5,
    review: 'Outstanding quality and reliability. We import multiple containers every quarter, and the consistency is remarkable. Their team understands FDA requirements perfectly. Tanzora has become an integral part of our supply chain.',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
    verified: true,
    orderVolume: '80+ MT annually',
    partnership: '7 years',
  },
];

const videoTestimonials: VideoTestimonial[] = [
  {
    id: 1,
    name: 'John Williams',
    company: 'UK Spice Distributors',
    country: 'United Kingdom',
    thumbnail: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
    duration: '2:45',
    title: 'Why We Choose Tanzora Export',
  },
  {
    id: 2,
    name: 'Fatima Hassan',
    company: 'Middle East Food Trading',
    country: 'UAE',
    thumbnail: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800',
    duration: '3:12',
    title: 'Quality That Exceeds Expectations',
  },
  {
    id: 3,
    name: 'Robert Chen',
    company: 'Asia Pacific Imports',
    country: 'Singapore',
    thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
    duration: '2:58',
    title: 'Reliable Export Partner',
  },
];

const clientLogos = [
  { name: 'GlobalFoods Ltd.', country: 'UK', logo: '🏢' },
  { name: 'AlFarouk Trading', country: 'UAE', logo: '🏪' },
  { name: 'Pacific Spice Co.', country: 'Singapore', logo: '🏭' },
  { name: 'Deutsche Gewürze', country: 'Germany', logo: '🏛️' },
  { name: 'Especias del Mundo', country: 'Spain', logo: '🏬' },
  { name: 'American Spice Imports', country: 'USA', logo: '🏢' },
  { name: 'Tokyo Food Trading', country: 'Japan', logo: '🏪' },
  { name: 'Sydney Spice House', country: 'Australia', logo: '🏭' },
  { name: 'Canada Spice Corp', country: 'Canada', logo: '🏛️' },
  { name: 'Brazil Food Imports', country: 'Brazil', logo: '🏬' },
  { name: 'South Africa Trading', country: 'South Africa', logo: '🏢' },
  { name: 'Malaysia Spice Co.', country: 'Malaysia', logo: '🏪' },
];

export function ClientTestimonialsSection() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<VideoTestimonial | null>(null);

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="space-y-16">
      {/* Featured Testimonial Carousel */}
      <div className="relative">
        <div className="bg-gradient-to-br from-amber-50 to-white rounded-3xl p-8 md:p-12 border-2 border-amber-100 shadow-xl overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-30" />
          
          <div className="relative">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              {/* Image */}
              <div className="shrink-0">
                <div className="relative">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                    <img
                      src={testimonials[activeTestimonial].image}
                      alt={testimonials[activeTestimonial].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {testimonials[activeTestimonial].verified && (
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                      <CheckCircle2 size={20} className="text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Quote size={24} className="text-amber-500" />
                  <div className="flex gap-1">
                    {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                      <Star key={i} size={18} fill="#f59e0b" className="text-amber-500" />
                    ))}
                  </div>
                </div>

                <p className="text-stone-700 text-lg italic leading-relaxed mb-6">
                  "{testimonials[activeTestimonial].review}"
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <div className="text-stone-900 font-bold text-lg">
                      {testimonials[activeTestimonial].name}
                    </div>
                    <div className="text-amber-600 text-sm font-medium">
                      {testimonials[activeTestimonial].role}
                    </div>
                    <div className="text-stone-500 text-sm flex items-center gap-1.5 mt-1">
                      <Building2 size={14} />
                      {testimonials[activeTestimonial].company}
                    </div>
                    <div className="text-stone-500 text-sm flex items-center gap-1.5 mt-1">
                      <MapPin size={14} />
                      {testimonials[activeTestimonial].flag} {testimonials[activeTestimonial].country}
                    </div>
                  </div>

                  {testimonials[activeTestimonial].orderVolume && (
                    <div className="flex gap-3">
                      <div className="bg-white rounded-lg px-4 py-2 border border-amber-200">
                        <div className="text-xs text-stone-500">Order Volume</div>
                        <div className="text-sm font-bold text-stone-900">
                          {testimonials[activeTestimonial].orderVolume}
                        </div>
                      </div>
                      <div className="bg-white rounded-lg px-4 py-2 border border-amber-200">
                        <div className="text-xs text-stone-500">Partnership</div>
                        <div className="text-sm font-bold text-stone-900">
                          {testimonials[activeTestimonial].partnership}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === activeTestimonial ? 'w-8 bg-amber-600' : 'w-2 bg-amber-200'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={prevTestimonial}
                  className="w-10 h-10 bg-white hover:bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronLeft size={20} className="text-amber-600" />
                </button>
                <button
                  onClick={nextTestimonial}
                  className="w-10 h-10 bg-white hover:bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronRight size={20} className="text-amber-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Testimonials Grid */}
      <div>
        <h3 className="text-stone-900 font-bold text-2xl mb-6 text-center">
          What Our <span className="text-amber-600">Clients Say</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-2xl p-6 border border-stone-200 hover:border-amber-300 hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-200">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-stone-900 font-bold text-sm">{testimonial.name}</div>
                  <div className="text-stone-500 text-xs">{testimonial.role}</div>
                  <div className="text-stone-400 text-xs">{testimonial.flag} {testimonial.country}</div>
                </div>
                {testimonial.verified && (
                  <CheckCircle2 size={18} className="text-green-500" />
                )}
              </div>

              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={14} fill="#f59e0b" className="text-amber-500" />
                ))}
              </div>

              <p className="text-stone-600 text-sm leading-relaxed italic">
                "{testimonial.review}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Video Testimonials */}
      <div>
        <h3 className="text-stone-900 font-bold text-2xl mb-6 text-center">
          Video <span className="text-amber-600">Testimonials</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {videoTestimonials.map((video) => (
            <div
              key={video.id}
              className="group relative bg-stone-900 rounded-2xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all"
              onClick={() => setSelectedVideo(video)}
            >
              <div className="relative aspect-video">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                    <Play size={28} className="text-white ml-1" fill="white" />
                  </div>
                </div>

                {/* Duration */}
                <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              </div>

              <div className="p-4">
                <h4 className="text-white font-bold text-sm mb-1">{video.title}</h4>
                <div className="text-stone-400 text-xs">{video.name}</div>
                <div className="text-stone-500 text-xs">{video.company}, {video.country}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Client Logos */}
      <div>
        <h3 className="text-stone-900 font-bold text-2xl mb-6 text-center">
          Trusted by <span className="text-amber-600">Leading Importers</span>
        </h3>
        <div className="bg-gradient-to-br from-stone-50 to-amber-50 rounded-2xl p-8 border border-amber-100">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {clientLogos.map((client, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 border border-stone-200 hover:border-amber-300 hover:shadow-md transition-all text-center group"
              >
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                  {client.logo}
                </div>
                <div className="text-stone-900 font-semibold text-xs mb-1">{client.name}</div>
                <div className="text-stone-400 text-xs">{client.country}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 rounded-2xl p-8 text-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-white text-4xl font-bold mb-2">500+</div>
            <div className="text-amber-100 text-sm">Happy Clients</div>
          </div>
          <div>
            <div className="text-white text-4xl font-bold mb-2">4.9/5</div>
            <div className="text-amber-100 text-sm">Average Rating</div>
          </div>
          <div>
            <div className="text-white text-4xl font-bold mb-2">95%</div>
            <div className="text-amber-100 text-sm">Retention Rate</div>
          </div>
          <div>
            <div className="text-white text-4xl font-bold mb-2">50+</div>
            <div className="text-amber-100 text-sm">Countries</div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="bg-stone-900 rounded-2xl max-w-4xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video bg-black flex items-center justify-center">
              <div className="text-white text-center">
                <Play size={64} className="mx-auto mb-4 text-amber-500" />
                <p className="text-lg mb-2">{selectedVideo.title}</p>
                <p className="text-sm text-stone-400">
                  {selectedVideo.name} - {selectedVideo.company}
                </p>
                <p className="text-xs text-stone-500 mt-4">
                  Video player would be embedded here
                </p>
              </div>
            </div>
            <div className="p-4 flex justify-between items-center">
              <div>
                <div className="text-white font-bold">{selectedVideo.title}</div>
                <div className="text-stone-400 text-sm">
                  {selectedVideo.name} - {selectedVideo.company}
                </div>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
