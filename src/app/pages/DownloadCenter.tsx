import { useState } from 'react';
import { Link } from 'react-router';
import { Download, FileText, Image, Package, Building2, Award, CheckCircle2, Eye, Search, Filter } from 'lucide-react';

interface DownloadResource {
  id: string;
  title: string;
  description: string;
  category: string;
  fileSize: string;
  pages: string;
  format: string;
  thumbnail: string;
  downloadUrl: string;
  views: number;
  downloads: number;
  lastUpdated: string;
  featured?: boolean;
}

const categories = [
  'All Resources',
  'Product Catalogs',
  'Company Profile',
  'Packaging Guides',
  'Certificates',
  'Price Lists',
  'Technical Specs',
];

const resources: DownloadResource[] = [
  {
    id: '1',
    title: 'Complete Product Catalog 2025',
    description: 'Comprehensive catalog featuring all our spice products with specifications, packaging options, and export details. Includes whole spices, powder spices, seeds, and custom blends.',
    category: 'Product Catalogs',
    fileSize: '8.5 MB',
    pages: '48 pages',
    format: 'PDF',
    thumbnail: 'https://images.unsplash.com/photo-1768729341078-9da4e0ea959e?w=400',
    downloadUrl: '/downloads/product-catalog-2025.pdf',
    views: 2847,
    downloads: 1523,
    lastUpdated: '2025-01-15',
    featured: true,
  },
  {
    id: '2',
    title: 'Tanzora Export Company Profile',
    description: 'Detailed company profile including our history, infrastructure, certifications, export capabilities, quality control processes, and global client testimonials.',
    category: 'Company Profile',
    fileSize: '4.2 MB',
    pages: '24 pages',
    format: 'PDF',
    thumbnail: 'https://images.unsplash.com/photo-1734977112531-cb74329ce3d5?w=400',
    downloadUrl: '/downloads/company-profile.pdf',
    views: 1956,
    downloads: 1087,
    lastUpdated: '2025-01-10',
    featured: true,
  },
  {
    id: '3',
    title: 'Export Packaging Solutions Guide',
    description: 'Complete guide to our packaging options including PP bags, kraft paper bags, jute bags, custom retail packaging, and private label solutions with specifications.',
    category: 'Packaging Guides',
    fileSize: '3.8 MB',
    pages: '16 pages',
    format: 'PDF',
    thumbnail: 'https://images.unsplash.com/photo-1580982331877-489fb58aeade?w=400',
    downloadUrl: '/downloads/packaging-guide.pdf',
    views: 1432,
    downloads: 856,
    lastUpdated: '2024-12-20',
    featured: true,
  },
  {
    id: '4',
    title: 'Turmeric Powder - Product Specification Sheet',
    description: 'Detailed technical specifications for our premium turmeric powder including curcumin content, moisture levels, color values, and quality parameters.',
    category: 'Technical Specs',
    fileSize: '1.2 MB',
    pages: '4 pages',
    format: 'PDF',
    thumbnail: 'https://images.unsplash.com/photo-1608797178894-bf7c596932da?w=400',
    downloadUrl: '/downloads/turmeric-specs.pdf',
    views: 892,
    downloads: 534,
    lastUpdated: '2025-01-05',
  },
  {
    id: '5',
    title: 'Black Pepper - Product Specification Sheet',
    description: 'Complete specifications for Malabar black pepper including piperine content, bulk density, moisture, and grading standards.',
    category: 'Technical Specs',
    fileSize: '1.1 MB',
    pages: '4 pages',
    format: 'PDF',
    thumbnail: 'https://images.unsplash.com/photo-1769614596747-860600b5f2f1?w=400',
    downloadUrl: '/downloads/black-pepper-specs.pdf',
    views: 756,
    downloads: 445,
    lastUpdated: '2025-01-05',
  },
  {
    id: '6',
    title: 'ISO 22000:2018 Certificate',
    description: 'Official ISO 22000:2018 Food Safety Management System certification issued by accredited certification body.',
    category: 'Certificates',
    fileSize: '0.8 MB',
    pages: '2 pages',
    format: 'PDF',
    thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400',
    downloadUrl: '/downloads/iso-certificate.pdf',
    views: 1245,
    downloads: 789,
    lastUpdated: '2024-04-12',
  },
  {
    id: '7',
    title: 'APEDA Registration Certificate',
    description: 'Agricultural & Processed Food Products Export Development Authority registration certificate.',
    category: 'Certificates',
    fileSize: '0.6 MB',
    pages: '1 page',
    format: 'PDF',
    thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400',
    downloadUrl: '/downloads/apeda-certificate.pdf',
    views: 987,
    downloads: 623,
    lastUpdated: '2024-01-15',
  },
  {
    id: '8',
    title: 'FSSAI License Certificate',
    description: 'Food Safety and Standards Authority of India license certificate for manufacturing and export.',
    category: 'Certificates',
    fileSize: '0.5 MB',
    pages: '1 page',
    format: 'PDF',
    thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400',
    downloadUrl: '/downloads/fssai-certificate.pdf',
    views: 876,
    downloads: 567,
    lastUpdated: '2023-03-10',
  },
  {
    id: '9',
    title: 'Whole Spices Product Range',
    description: 'Dedicated catalog for whole spices including black pepper, cloves, cinnamon, cardamom, and more with export specifications.',
    category: 'Product Catalogs',
    fileSize: '5.2 MB',
    pages: '20 pages',
    format: 'PDF',
    thumbnail: 'https://images.unsplash.com/photo-1765118433463-93af73bc8ff9?w=400',
    downloadUrl: '/downloads/whole-spices-catalog.pdf',
    views: 1123,
    downloads: 678,
    lastUpdated: '2024-11-15',
  },
  {
    id: '10',
    title: 'Powder Spices Product Range',
    description: 'Complete catalog of powder spices including turmeric, chilli, coriander, and custom blends with quality parameters.',
    category: 'Product Catalogs',
    fileSize: '4.8 MB',
    pages: '18 pages',
    format: 'PDF',
    thumbnail: 'https://images.unsplash.com/photo-1625921133217-8d978f7872b8?w=400',
    downloadUrl: '/downloads/powder-spices-catalog.pdf',
    views: 1034,
    downloads: 645,
    lastUpdated: '2024-11-15',
  },
  {
    id: '11',
    title: 'FOB Price List - Q1 2025',
    description: 'Current FOB Mumbai/Mundra pricing for all products. Valid for Q1 2025. Subject to market fluctuations.',
    category: 'Price Lists',
    fileSize: '0.9 MB',
    pages: '6 pages',
    format: 'PDF',
    thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
    downloadUrl: '/downloads/price-list-q1-2025.pdf',
    views: 2156,
    downloads: 1234,
    lastUpdated: '2025-01-01',
  },
  {
    id: '12',
    title: 'Private Label & Custom Packaging Solutions',
    description: 'Guide to our private label services including custom packaging design, MOQ requirements, and branding options.',
    category: 'Packaging Guides',
    fileSize: '3.2 MB',
    pages: '12 pages',
    format: 'PDF',
    thumbnail: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400',
    downloadUrl: '/downloads/private-label-guide.pdf',
    views: 945,
    downloads: 567,
    lastUpdated: '2024-10-20',
  },
];

export function DownloadCenter() {
  const [selectedCategory, setSelectedCategory] = useState('All Resources');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'All Resources' || resource.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDownload = (resource: DownloadResource) => {
    // Simulate download
    alert(`Downloading: ${resource.title}\n\nIn production, this would download the PDF file.`);
  };

  const handlePreview = (resource: DownloadResource) => {
    // Simulate preview
    alert(`Opening preview for: ${resource.title}\n\nIn production, this would open a PDF preview modal.`);
  };

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="bg-stone-900 py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNEOTc3MDYiIGZpbGwtb3BhY2l0eT0iMC40Ij48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/40 text-amber-400 text-xs font-semibold px-4 py-2 rounded-full mb-4">
            <Download size={14} />
            Resource Library
          </div>
          <h1 className="text-white font-bold text-4xl lg:text-5xl mb-4">
            Download <span className="text-amber-400">Center</span>
          </h1>
          <p className="text-stone-400 text-base max-w-2xl mx-auto leading-relaxed">
            Access our complete collection of product catalogs, company profiles, technical specifications,
            certificates, and export documentation. All resources are free to download.
          </p>
          <div className="flex justify-center gap-2 mt-5 text-sm text-stone-400">
            <Link to="/" className="hover:text-amber-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-amber-400">Downloads</span>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-amber-600 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-white text-center">
          <div>
            <div className="text-3xl font-bold mb-1">{resources.length}</div>
            <div className="text-amber-100 text-sm">Resources Available</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">
              {resources.reduce((sum, r) => sum + r.downloads, 0).toLocaleString()}
            </div>
            <div className="text-amber-100 text-sm">Total Downloads</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">Free</div>
            <div className="text-amber-100 text-sm">All Resources</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">24/7</div>
            <div className="text-amber-100 text-sm">Instant Access</div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border-b border-stone-200 sticky top-16 lg:top-20 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources..."
                className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-stone-50"
              />
            </div>

            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'grid' ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'list' ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600'
                }`}
              >
                List
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-stone-100 text-stone-600 hover:bg-amber-50 hover:text-amber-700'
                }`}
              >
                <Filter size={14} />
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resources Grid/List */}
      <section className="py-12 px-4 bg-amber-50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto">
          {filteredResources.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-stone-700 font-bold text-xl mb-2">No resources found</h3>
              <p className="text-stone-500 text-sm mb-5">
                Try adjusting your search or filter criteria.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All Resources'); }}
                className="bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium"
              >
                Clear Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <div
                  key={resource.id}
                  className={`bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border ${
                    resource.featured ? 'border-amber-300 ring-2 ring-amber-200' : 'border-stone-200'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 overflow-hidden bg-stone-100">
                    <img
                      src={resource.thumbnail}
                      alt={resource.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {resource.featured && (
                      <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs px-2.5 py-1 rounded-full font-bold">
                        Featured
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="flex items-center gap-1">
                        <Eye size={12} /> {resource.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download size={12} /> {resource.downloads.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">
                        {resource.category}
                      </span>
                      <span className="text-stone-400 text-xs">{resource.format}</span>
                    </div>
                    <h3 className="text-stone-900 font-bold text-base mb-2 line-clamp-2">
                      {resource.title}
                    </h3>
                    <p className="text-stone-500 text-xs mb-4 line-clamp-2 leading-relaxed">
                      {resource.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-stone-400 mb-4 pb-4 border-b border-stone-100">
                      <span>{resource.fileSize}</span>
                      <span>•</span>
                      <span>{resource.pages}</span>
                      <span>•</span>
                      <span>Updated {new Date(resource.lastUpdated).toLocaleDateString()}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePreview(resource)}
                        className="flex-1 text-center bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye size={14} /> Preview
                      </button>
                      <button
                        onClick={() => handleDownload(resource)}
                        className="flex-1 text-center bg-amber-600 hover:bg-amber-700 text-white px-3 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <Download size={14} /> Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResources.map((resource) => (
                <div
                  key={resource.id}
                  className={`bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all border ${
                    resource.featured ? 'border-amber-300' : 'border-stone-200'
                  }`}
                >
                  <div className="flex gap-6">
                    {/* Thumbnail */}
                    <div className="w-32 h-32 rounded-xl overflow-hidden shrink-0 bg-stone-100">
                      <img
                        src={resource.thumbnail}
                        alt={resource.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-amber-100 text-amber-700 text-xs px-2.5 py-1 rounded-full font-medium">
                              {resource.category}
                            </span>
                            {resource.featured && (
                              <span className="bg-amber-500 text-white text-xs px-2.5 py-1 rounded-full font-bold">
                                Featured
                              </span>
                            )}
                          </div>
                          <h3 className="text-stone-900 font-bold text-lg mb-2">
                            {resource.title}
                          </h3>
                          <p className="text-stone-600 text-sm leading-relaxed mb-3">
                            {resource.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-stone-400">
                          <span className="flex items-center gap-1">
                            <FileText size={12} /> {resource.format}
                          </span>
                          <span>{resource.fileSize}</span>
                          <span>{resource.pages}</span>
                          <span className="flex items-center gap-1">
                            <Eye size={12} /> {resource.views.toLocaleString()} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Download size={12} /> {resource.downloads.toLocaleString()} downloads
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePreview(resource)}
                            className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                          >
                            <Eye size={14} /> Preview
                          </button>
                          <button
                            onClick={() => handleDownload(resource)}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                          >
                            <Download size={14} /> Download
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-stone-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-white font-bold text-3xl mb-4">
            Need Custom Documentation?
          </h2>
          <p className="text-stone-400 text-sm mb-6 max-w-xl mx-auto">
            We can provide customized product specifications, COA reports, and export documentation
            tailored to your specific requirements.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-colors shadow-xl"
          >
            Contact Export Team
          </Link>
        </div>
      </section>
    </div>
  );
}
