import { useState, useEffect } from 'react';
import { Globe, MapPin, Ship, Plane, TrendingUp } from 'lucide-react';
import { useStats } from '../hooks/useStats';

interface Country {
  name: string;
  flag: string;
  region: string;
  x: number;
  y: number;
  clients: number;
}

const exportCountries: Country[] = [
  // North America
  { name: 'USA', flag: '🇺🇸', region: 'North America', x: 20, y: 35, clients: 85 },
  { name: 'Canada', flag: '🇨🇦', region: 'North America', x: 18, y: 28, clients: 42 },
  { name: 'Mexico', flag: '🇲🇽', region: 'North America', x: 15, y: 42, clients: 28 },
  
  // Europe
  { name: 'UK', flag: '🇬🇧', region: 'Europe', x: 48, y: 28, clients: 95 },
  { name: 'Germany', flag: '🇩🇪', region: 'Europe', x: 52, y: 30, clients: 78 },
  { name: 'France', flag: '🇫🇷', region: 'Europe', x: 50, y: 33, clients: 65 },
  { name: 'Netherlands', flag: '🇳🇱', region: 'Europe', x: 51, y: 29, clients: 58 },
  { name: 'Italy', flag: '🇮🇹', region: 'Europe', x: 53, y: 35, clients: 45 },
  { name: 'Spain', flag: '🇪🇸', region: 'Europe', x: 48, y: 36, clients: 38 },
  
  // Middle East
  { name: 'UAE', flag: '🇦🇪', region: 'Middle East', x: 60, y: 42, clients: 120 },
  { name: 'Saudi Arabia', flag: '🇸🇦', region: 'Middle East', x: 58, y: 43, clients: 88 },
  { name: 'Qatar', flag: '🇶🇦', region: 'Middle East', x: 59, y: 43, clients: 35 },
  { name: 'Kuwait', flag: '🇰🇼', region: 'Middle East', x: 58, y: 41, clients: 32 },
  
  // Asia Pacific
  { name: 'Singapore', flag: '🇸🇬', region: 'Asia Pacific', x: 75, y: 52, clients: 72 },
  { name: 'Malaysia', flag: '🇲🇾', region: 'Asia Pacific', x: 75, y: 50, clients: 55 },
  { name: 'Japan', flag: '🇯🇵', region: 'Asia Pacific', x: 85, y: 35, clients: 48 },
  { name: 'South Korea', flag: '🇰🇷', region: 'Asia Pacific', x: 83, y: 36, clients: 42 },
  { name: 'Australia', flag: '🇦🇺', region: 'Oceania', x: 82, y: 68, clients: 65 },
  { name: 'New Zealand', flag: '🇳🇿', region: 'Oceania', x: 88, y: 72, clients: 28 },
  
  // Africa
  { name: 'South Africa', flag: '🇿🇦', region: 'Africa', x: 54, y: 68, clients: 38 },
  { name: 'Kenya', flag: '🇰🇪', region: 'Africa', x: 57, y: 52, clients: 25 },
  
  // South America
  { name: 'Brazil', flag: '🇧🇷', region: 'South America', x: 32, y: 62, clients: 35 },
  { name: 'Chile', flag: '🇨🇱', region: 'South America', x: 28, y: 68, clients: 22 },
];

const shippingRoutes = [
  { from: 'India', to: 'UAE', color: '#f59e0b', delay: 0 },
  { from: 'India', to: 'USA', color: '#3b82f6', delay: 0.5 },
  { from: 'India', to: 'UK', color: '#10b981', delay: 1 },
  { from: 'India', to: 'Singapore', color: '#8b5cf6', delay: 1.5 },
  { from: 'India', to: 'Germany', color: '#ef4444', delay: 2 },
];

export function GlobalPresenceSection() {
  const [activeRegion, setActiveRegion] = useState<string>('all');
  const [hoveredCountry, setHoveredCountry] = useState<Country | null>(null);
  const [animatedRoutes, setAnimatedRoutes] = useState<boolean>(false);
  const { stats, loading } = useStats();

  // Default values fallback
  const statsCountries = stats.countries || `${exportCountries.length}+`;
  const statsMtExported = stats.products || '5000+';

  useEffect(() => {
    setAnimatedRoutes(true);
  }, []);

  const regions = ['all', 'North America', 'Europe', 'Middle East', 'Asia Pacific', 'Africa', 'South America', 'Oceania'];
  
  const filteredCountries = activeRegion === 'all' 
    ? exportCountries 
    : exportCountries.filter(c => c.region === activeRegion);

  const totalClients = exportCountries.reduce((sum, c) => sum + c.clients, 0);

  return (
    <div className="space-y-12">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
          <div className="text-blue-600 mb-2">
            <Globe size={28} />
          </div>
          <div className="text-blue-900 font-bold text-3xl mb-1">{loading ? '...' : statsCountries}</div>
          <div className="text-blue-700 text-sm font-medium">Export Countries</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
          <div className="text-green-600 mb-2">
            <MapPin size={28} />
          </div>
          <div className="text-green-900 font-bold text-3xl mb-1">{totalClients}+</div>
          <div className="text-green-700 text-sm font-medium">Global Clients</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200">
          <div className="text-amber-600 mb-2">
            <Ship size={28} />
          </div>
          <div className="text-amber-900 font-bold text-3xl mb-1">{loading ? '...' : statsMtExported}</div>
          <div className="text-amber-700 text-sm font-medium">MT Exported</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
          <div className="text-purple-600 mb-2">
            <TrendingUp size={28} />
          </div>
          <div className="text-purple-900 font-bold text-3xl mb-1">40%</div>
          <div className="text-purple-700 text-sm font-medium">YoY Growth</div>
        </div>
      </div>

      {/* Region Filter */}
      <div className="flex flex-wrap gap-2">
        {regions.map(region => (
          <button
            key={region}
            onClick={() => setActiveRegion(region)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeRegion === region
                ? 'bg-amber-600 text-white shadow-lg'
                : 'bg-white text-stone-600 border border-stone-200 hover:border-amber-300 hover:text-amber-700'
            }`}
          >
            {region === 'all' ? 'All Regions' : region}
          </button>
        ))}
      </div>

      {/* Interactive World Map */}
      <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100 overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Map Container */}
        <div className="relative w-full aspect-[2/1] bg-white/50 rounded-2xl border-2 border-blue-200 overflow-hidden">
          {/* Animated Shipping Routes */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            <defs>
              {shippingRoutes.map((route, i) => (
                <linearGradient key={i} id={`gradient-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={route.color} stopOpacity="0" />
                  <stop offset="50%" stopColor={route.color} stopOpacity="0.6" />
                  <stop offset="100%" stopColor={route.color} stopOpacity="0" />
                </linearGradient>
              ))}
            </defs>
            
            {/* India Hub */}
            <circle cx="68%" cy="45%" r="8" fill="#f59e0b" opacity="0.3">
              <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="68%" cy="45%" r="4" fill="#f59e0b" />
            
            {/* Routes from India */}
            {animatedRoutes && shippingRoutes.map((route, i) => {
              const routes = {
                'UAE': { x2: '60%', y2: '42%' },
                'USA': { x2: '20%', y2: '35%' },
                'UK': { x2: '48%', y2: '28%' },
                'Singapore': { x2: '75%', y2: '52%' },
                'Germany': { x2: '52%', y2: '30%' },
              };
              const coords = routes[route.to as keyof typeof routes];
              
              return (
                <g key={i}>
                  <line
                    x1="68%" y1="45%"
                    x2={coords.x2} y2={coords.y2}
                    stroke={`url(#gradient-${i})`}
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    opacity="0.6"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="100"
                      to="0"
                      dur="3s"
                      begin={`${route.delay}s`}
                      repeatCount="indefinite"
                    />
                  </line>
                  {/* Moving dot */}
                  <circle r="3" fill={route.color}>
                    <animateMotion
                      dur="4s"
                      begin={`${route.delay}s`}
                      repeatCount="indefinite"
                      path={`M 68,45 L ${coords.x2.replace('%', '')},${coords.y2.replace('%', '')}`}
                    />
                  </circle>
                </g>
              );
            })}
          </svg>

          {/* Country Markers */}
          {filteredCountries.map((country, i) => (
            <div
              key={country.name}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ left: `${country.x}%`, top: `${country.y}%`, zIndex: 2 }}
              onMouseEnter={() => setHoveredCountry(country)}
              onMouseLeave={() => setHoveredCountry(null)}
            >
              {/* Pulse Animation */}
              <div className="absolute inset-0 w-6 h-6 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
                <div className="absolute inset-0 bg-amber-500 rounded-full opacity-30 animate-ping" />
              </div>
              
              {/* Pin */}
              <div className="relative w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-lg group-hover:scale-125 transition-transform">
                {country.flag}
              </div>

              {/* Tooltip */}
              {hoveredCountry?.name === country.name && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-stone-900 text-white rounded-xl p-3 shadow-2xl animate-fade-in z-10">
                  <div className="text-center">
                    <div className="text-2xl mb-1">{country.flag}</div>
                    <div className="font-bold text-sm mb-1">{country.name}</div>
                    <div className="text-xs text-stone-400 mb-2">{country.region}</div>
                    <div className="text-amber-400 font-semibold text-sm">
                      {country.clients} Active Clients
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-stone-900 rotate-45" />
                </div>
              )}
            </div>
          ))}

          {/* India Hub Label */}
          <div className="absolute" style={{ left: '68%', top: '45%', transform: 'translate(-50%, -50%)', zIndex: 3 }}>
            <div className="bg-amber-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
              🇮🇳 INDIA (HQ)
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full" />
            <span className="text-stone-600">Export Hub (India)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-stone-600">Major Markets</span>
          </div>
          <div className="flex items-center gap-2">
            <Ship size={14} className="text-stone-500" />
            <span className="text-stone-600">Shipping Routes</span>
          </div>
        </div>
      </div>

      {/* Shipping Route Timeline */}
      <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-md">
        <h3 className="text-stone-900 font-bold text-xl mb-6 flex items-center gap-2">
          <Plane className="text-amber-600" size={24} />
          Major Shipping Routes
        </h3>
        <div className="space-y-4">
          {[
            { route: 'India → UAE', time: '3-5 days', method: 'Sea Freight', color: 'bg-orange-500' },
            { route: 'India → USA', time: '18-22 days', method: 'Sea Freight', color: 'bg-blue-500' },
            { route: 'India → UK', time: '20-25 days', method: 'Sea Freight', color: 'bg-green-500' },
            { route: 'India → Singapore', time: '7-10 days', method: 'Sea Freight', color: 'bg-purple-500' },
            { route: 'India → Germany', time: '22-28 days', method: 'Sea Freight', color: 'bg-red-500' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl hover:bg-amber-50 transition-colors">
              <div className={`w-2 h-2 ${item.color} rounded-full`} />
              <div className="flex-1">
                <div className="font-semibold text-stone-900 text-sm">{item.route}</div>
                <div className="text-stone-500 text-xs">{item.method}</div>
              </div>
              <div className="text-amber-600 font-bold text-sm">{item.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Countries Grid */}
      <div>
        <h3 className="text-stone-900 font-bold text-xl mb-6">All Export Destinations</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {exportCountries.map(country => (
            <div
              key={country.name}
              className="bg-white border border-stone-200 hover:border-amber-300 rounded-xl p-3 text-center transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer"
              onMouseEnter={() => setHoveredCountry(country)}
              onMouseLeave={() => setHoveredCountry(null)}
            >
              <div className="text-3xl mb-2">{country.flag}</div>
              <div className="text-stone-900 font-semibold text-xs mb-1">{country.name}</div>
              <div className="text-stone-400 text-xs">{country.region}</div>
              <div className="text-amber-600 font-bold text-xs mt-1">{country.clients} clients</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
