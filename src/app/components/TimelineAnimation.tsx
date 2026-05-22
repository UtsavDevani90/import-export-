import { useEffect, useRef, useState } from 'react';

interface TimelineItem {
  year: string;
  title: string;
  desc: string;
}

export function TimelineAnimation({ items }: { items: TimelineItem[] }) {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = itemRefs.current.map((ref, index) => {
      if (!ref) return null;
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleItems((prev) => [...new Set([...prev, index])]);
            }
          });
        },
        { threshold: 0.2 }
      );
      
      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  return (
    <div className="relative">
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-200 via-amber-300 to-amber-200" />
      <div className="space-y-8">
        {items.map((item, i) => (
          <div
            key={i}
            ref={(el) => (itemRefs.current[i] = el)}
            className={`relative pl-20 transition-all duration-700 ${
              visibleItems.includes(i)
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-10'
            }`}
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <div
              className={`absolute left-5 top-3 w-6 h-6 rounded-full border-4 border-amber-100 shadow-lg transition-all duration-500 ${
                visibleItems.includes(i)
                  ? 'bg-amber-500 scale-100'
                  : 'bg-amber-200 scale-75'
              }`}
            >
              {visibleItems.includes(i) && (
                <div className="absolute inset-0 rounded-full bg-amber-500 animate-ping opacity-75" />
              )}
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-md border border-amber-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-md">
                  {item.year}
                </span>
                <h3 className="text-stone-900 font-bold text-lg">{item.title}</h3>
              </div>
              <p className="text-stone-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
