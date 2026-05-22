import { useEffect, useState } from 'react';

export function CounterAnimation({ end, label, suffix = '' }: { end: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = end / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [end]);

  return (
    <div className="text-center">
      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-400 mb-1 sm:mb-2">
        {count}{suffix}
      </div>
      <div className="text-stone-300 text-xs sm:text-sm leading-tight">{label}</div>
    </div>
  );
}

export function FloatingSpices() {
  const spices = [
    { emoji: '🌶️', delay: 0, x: '10%', duration: 6 },
    { emoji: '🧄', delay: 1, x: '80%', duration: 7 },
    { emoji: '🫚', delay: 2, x: '20%', duration: 8 },
    { emoji: '🌿', delay: 0.5, x: '70%', duration: 6.5 },
    { emoji: '⭐', delay: 1.5, x: '40%', duration: 7.5 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {spices.map((spice, i) => (
        <div
          key={i}
          className="absolute text-4xl opacity-20"
          style={{
            left: spice.x,
            bottom: '-50px',
            animation: `floatUp ${spice.duration}s ease-in-out ${spice.delay}s infinite`,
          }}
        >
          {spice.emoji}
        </div>
      ))}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.2; }
          90% { opacity: 0.2; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export function WorldMapAnimation() {
  return (
    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
      <svg
        viewBox="0 0 800 400"
        className="w-full h-full"
        style={{ animation: 'pulse 4s ease-in-out infinite' }}
      >
        <defs>
          <radialGradient id="mapGlow">
            <stop offset="0%" stopColor="#d4a017" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#d4a017" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Simplified world map paths */}
        <path
          d="M150,150 L200,140 L250,160 L280,150 L300,170 L320,160 L350,180"
          stroke="#d4a017"
          strokeWidth="2"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M400,120 L450,130 L500,110 L550,140 L600,120"
          stroke="#d4a017"
          strokeWidth="2"
          fill="none"
          opacity="0.4"
        />
        
        {/* Animated dots representing export destinations */}
        {[
          { cx: 200, cy: 150 },
          { cx: 350, cy: 180 },
          { cx: 500, cy: 120 },
          { cx: 600, cy: 140 },
          { cx: 300, cy: 250 },
        ].map((dot, i) => (
          <g key={i}>
            <circle
              cx={dot.cx}
              cy={dot.cy}
              r="4"
              fill="#d4a017"
              style={{
                animation: `ping 2s cubic-bezier(0, 0, 0.2, 1) ${i * 0.4}s infinite`,
              }}
            />
            <circle cx={dot.cx} cy={dot.cy} r="2" fill="#f0c040" />
          </g>
        ))}
      </svg>
      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(3);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient orbs */}
      <div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{
          background: 'radial-gradient(circle, #d4a017 0%, transparent 70%)',
          top: '10%',
          right: '10%',
          animation: 'float 8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-80 h-80 rounded-full blur-3xl opacity-15"
        style={{
          background: 'radial-gradient(circle, #f0c040 0%, transparent 70%)',
          bottom: '20%',
          left: '5%',
          animation: 'float 10s ease-in-out infinite reverse',
        }}
      />
      
      {/* Animated grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(#d4a017 1px, transparent 1px),
                           linear-gradient(90deg, #d4a017 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite',
        }}
      />
      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );
}
