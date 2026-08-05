import React, { memo } from 'react';
import { Building2, Globe, ArrowUpRight } from 'lucide-react';

// --- DATA CONSTANTS (Static data moved outside component) ---
const partnersRow1 = [
  { name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
  { name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" },
  { name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
  { name: "TCS", logo: "https://companieslogo.com/img/orig/TCS.NS-7401f1bd.png" },
  { name: "Infosys", logo: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg" },
  { name: "Meta", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg" },
  { name: "Netflix", logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" }
];

const partnersRow2 = [
  { name: "Zomato", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Zomato_Logo.svg" },
  { name: "Accenture", logo: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg" },
  { name: "Wipro", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg" },
  { name: "Paytm", logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" },
  { name: "Swiggy", logo: "https://logos-world.net/wp-content/uploads/2020/11/Swiggy-Logo.png" },
  { name: "Uber", logo: "https://upload.wikimedia.org/wikipedia/commons/5/58/Uber_logo_2018.svg" },
  { name: "Oracle", logo: "https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg" },
  { name: "IBM", logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg" }
];

const partnersRow3 = [
  { name: "Flipkart", logo: "https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/fkheaderlogo_exploreplus-44005d.svg" },
  { name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
  { name: "Samsung", logo: "https://logos-world.net/wp-content/uploads/2020/04/Samsung-Logo.png" },
  { name: "Tesla", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg" },
  { name: "Dell", logo: "https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg" },
  { name: "HP", logo: "https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg" },
  { name: "Sony", logo: "https://logos-world.net/wp-content/uploads/2020/04/Sony-Logo.png" }
];

// --- OPTIMIZED SUB-COMPONENTS ---

// 1. CompanyCard: Memoized to prevent re-renders
// Removed 'backdrop-blur-sm' for performance. Used a solid dark color with opacity instead.
const CompanyCard = memo(({ data }) => (
  <div className="
    group relative flex items-center gap-4
    bg-[#121212] border border-white/5 
    px-6 py-4 rounded-xl min-w-[200px]
    transition-colors duration-300
    hover:bg-[#1a1a1a] hover:border-[#008a45]/50
    cursor-pointer
    /* Hardware acceleration hints */
    transform-gpu
  ">
    {/* Logo Container */}
    <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center p-2 shrink-0 transition-transform duration-300 group-hover:scale-110">
      {data.logo ? (
        <img 
          src={data.logo} 
          alt={data.name} 
          loading="lazy"
          decoding="async"
          className="w-full h-full object-contain"
        />
      ) : (
        <Building2 size={20} className="text-gray-500" />
      )}
    </div>

    {/* Text Info */}
    <div className="flex flex-col">
      <span className="text-gray-200 font-bold text-lg leading-tight group-hover:text-white transition-colors">
        {data.name}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold group-hover:text-[#008a45] transition-colors">
        Hiring Now
      </span>
    </div>

    {/* Hover Arrow */}
    <ArrowUpRight size={14} className="absolute top-3 right-3 text-white/20 opacity-0 group-hover:opacity-100 group-hover:text-[#008a45] transition-all" />
  </div>
));

CompanyCard.displayName = 'CompanyCard';

// 2. MarqueeRow: Cleaned up structure
const MarqueeRow = memo(({ items, direction = "normal", speed = "30s" }) => {
  return (
    <div className="relative flex overflow-hidden mb-6 group/marquee select-none pointer-events-none">
      {/* Wrapper to handle pointer events only on children */}
      <div 
        className={`
          flex gap-6 items-center w-max pointer-events-auto
          ${direction === "normal" ? "animate-marquee" : "animate-marquee-reverse"}
        `}
        style={{ 
          animationDuration: speed,
          willChange: 'transform' // Hints browser to use GPU
        }}
      >
        {items.map((item, idx) => (
          <CompanyCard key={idx} data={item} />
        ))}
        {/* Duplicate items for infinite loop */}
        {items.map((item, idx) => (
          <CompanyCard key={`dup-${idx}`} data={item} />
        ))}
      </div>
    </div>
  );
});

MarqueeRow.displayName = 'MarqueeRow';

// --- MAIN COMPONENT ---
const HiringPartners = () => {
  return (
    <section className="bg-[#050505] py-24 overflow-hidden relative border-t border-white/5">
      
      {/* Background Ambience - Static Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#008a45]/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Header */}
      <div className="relative z-10 px-4 mb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
          <Globe size={12} className="text-[#008a45]" />
          World Class Faculty
        </div>

        <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight">
          OUR STUDENTS <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#008a45] to-emerald-400">WORK AT</span>
        </h3>

        <p className="text-gray-500 mt-4 max-w-lg mx-auto">
          Don't just watch tutorials. Learn real-world coding standards directly from engineers working at top-tier product companies.
        </p>
      </div>

      {/* Rows Container - Added translate-z-0 to force hardware acceleration context */}
      <div className="relative z-10 space-y-2 transform-gpu">
        <MarqueeRow items={partnersRow1} direction="normal" speed="40s" />
        <MarqueeRow items={partnersRow2} direction="reverse" speed="45s" />
        <MarqueeRow items={partnersRow3} direction="normal" speed="35s" />
      </div>

      {/* Vignette / Edge Fade - Simplified gradients */}
      <div className="absolute inset-y-0 left-0 w-24 md:w-64 bg-gradient-to-r from-[#050505] to-transparent z-20 pointer-events-none"></div>
      <div className="absolute inset-y-0 right-0 w-24 md:w-64 bg-gradient-to-l from-[#050505] to-transparent z-20 pointer-events-none"></div>

      {/* Optimized CSS Keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes marquee-reverse {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse linear infinite;
        }
        /* Only pause on non-touch devices to prevent scroll jank on mobile */
        @media (hover: hover) {
          .group\\/marquee:hover .animate-marquee,
          .group\\/marquee:hover .animate-marquee-reverse {
            animation-play-state: paused;
          }
        }
      `}} />
    </section>
  );
};

export default HiringPartners;