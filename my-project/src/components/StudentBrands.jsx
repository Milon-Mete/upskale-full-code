import React, { memo } from 'react';
import { Rocket } from 'lucide-react';

// --- DATA: Your 5 Provided Logos ---
const studentBrands = [
  { name: "KiteCurve", logo: "https://res.cloudinary.com/dv5ysdbps/image/upload/f_auto,q_auto/v1775591846/zvpydtteaf2y9gsxil0w.webp" },
  { name: "TARAaang Landscape", logo: "https://res.cloudinary.com/dv5ysdbps/image/upload/f_auto,q_auto/v1775591863/qmdnbxylt3btlz2dfhtl.webp" },
  { name: "Eagle Gym", logo: "https://res.cloudinary.com/dv5ysdbps/image/upload/f_auto,q_auto/v1775591878/wxa2n9hthdphzwigfa1b.webp" },
  { name: "Student Brand 4", logo: "https://res.cloudinary.com/dv5ysdbps/image/upload/f_auto,q_auto/v1775591892/xxsq88hjin2wyghyk0de.webp" },
  { name: "Student Brand 5", logo: "https://res.cloudinary.com/dv5ysdbps/image/upload/f_auto,q_auto/v1775591904/wx72mtbfcpvbmzwh2ch3.webp" }
];

// --- OPTIMIZED SUB-COMPONENTS ---

// 1. LogoCard: overhaul visibility settings for a light background
const LogoCard = memo(({ data }) => (
  <div className="
    group relative flex items-center justify-center
    bg-white border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]
    px-8 py-6 rounded-xl w-48 h-24
    transition-all duration-300
    hover:border-[#008a45]/40
    hover:shadow-[0_8px_30px_rgba(0,138,69,0.15)]
    hover:-translate-y-1.5
    cursor-pointer transform-gpu
  ">
    {/* 🔴 FIXED: Default opacity is 100% and filter is removed so the logo's real colors are immediately visible. */}
    <img 
      src={data.logo} 
      alt={data.name} 
      loading="lazy"
      decoding="async"
      className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110 opacity-100 drop-shadow-sm"
    />
  </div>
));

LogoCard.displayName = 'LogoCard';

// 2. MarqueeRow: Single line logic
const MarqueeRow = memo(({ items, speed = "25s" }) => {
  const extendedItems = [...items, ...items];

  return (
    <div className="relative flex overflow-hidden group/marquee select-none pointer-events-none pb-4 pt-2">
      <div 
        className="flex gap-6 items-center w-max pointer-events-auto animate-marquee py-4"
        style={{ 
          animationDuration: speed,
          willChange: 'transform' 
        }}
      >
        {extendedItems.map((item, idx) => (
          <LogoCard key={`first-${idx}`} data={item} />
        ))}
        {extendedItems.map((item, idx) => (
          <LogoCard key={`second-${idx}`} data={item} />
        ))}
      </div>
    </div>
  );
});

MarqueeRow.displayName = 'MarqueeRow';

// --- MAIN COMPONENT ---
const StudentBrands = () => {
  return (
    <section className="bg-white py-16 overflow-hidden relative border-t border-gray-100">
      
      {/* Light Mode Background Ambience */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-30"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#008a45]/10 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Light Mode HEADER */}
      <div className="relative z-10 px-4 mb-10 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-widest mb-3 shadow-inner">
          <Rocket size={12} className="text-[#008a45]" />
          Entrepreneurship
        </div>
        <h3 className="text-2xl md:text-3xl font-black text-gray-950 tracking-tight uppercase">
          Brands our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#008a45] to-emerald-500">students build</span>
        </h3>
      </div>

      {/* Single Row Container */}
      <div className="relative z-10 transform-gpu">
        <MarqueeRow items={studentBrands} speed="25s" />
      </div>

      {/* Light Mode Vignette / Edge Fade (White fades instead of Black) */}
      <div className="absolute inset-y-0 left-0 w-16 md:w-48 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none"></div>
      <div className="absolute inset-y-0 right-0 w-16 md:w-48 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none"></div>

      {/* Optimized CSS Keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
        @media (hover: hover) {
          .group\\/marquee:hover .animate-marquee {
            animation-play-state: paused;
          }
        }
      `}} />
    </section>
  );
};

export default StudentBrands;