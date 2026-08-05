import React, { useState, useEffect } from 'react';
import { Play, Loader2 } from 'lucide-react';

const CoverflowCarousel = () => {
  // 1. Mock Data (Replace with your actual API data later)
  const featuredCourses = [
    { _id: '1', title: 'Mastering React', highlight: 'REACT JS', tag: 'PREMIUM', image: 'https://res.cloudinary.com/dv5ysdbps/image/upload/f_auto,q_auto/v1775649763/rqjvidu8zmlyxnjfmcro.webp', slug: 'react-js' },
    { _id: '2', title: 'Backend with Node', highlight: 'NODE JS', tag: 'TRENDING', image: 'https://res.cloudinary.com/dvcs9x8yp/image/upload/v1775412223/20250730_170449_0000_uq4d24.png', slug: 'node-js' },
    { _id: '3', title: 'UI/UX Design', highlight: 'FIGMA', tag: 'NEW', image: 'https://res.cloudinary.com/dv5ysdbps/image/upload/f_auto,q_auto/v1775649763/rqjvidu8zmlyxnjfmcro.webp', slug: 'figma' },
    { _id: '4', title: 'Database Design', highlight: 'MONGODB', tag: 'ESSENTIAL', image: 'https://res.cloudinary.com/dvcs9x8yp/image/upload/v1775412223/20250730_170449_0000_uq4d24.png', slug: 'mongodb' }
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const isLoading = false; // Toggle to test loader

  // 2. Auto-Play Logic
  useEffect(() => {
    if (featuredCourses.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % featuredCourses.length);
    }, 4000); // Changes every 4 seconds
    return () => clearInterval(interval);
  }, [featuredCourses.length]);

  // 3. Mathematical position calculator for the 3D effect
  const getCardStyle = (index) => {
    const length = featuredCourses.length;
    
    // Determine relative position (-1 is left, 0 is center, 1 is right)
    let diff = index - activeIndex;
    if (diff < -Math.floor(length / 2)) diff += length;
    if (diff > Math.floor(length / 2)) diff -= length;

    // CENTER CARD (Active)
    if (diff === 0) {
      return "translate-x-0 scale-100 opacity-100 z-30 pointer-events-auto blur-0";
    } 
    // RIGHT CARD
    else if (diff === 1) {
      return "translate-x-[75%] md:translate-x-[90%] scale-[0.85] opacity-50 z-20 pointer-events-none blur-[1px]";
    } 
    // LEFT CARD
    else if (diff === -1) {
      return "-translate-x-[75%] md:-translate-x-[90%] scale-[0.85] opacity-50 z-20 pointer-events-none blur-[1px]";
    } 
    // HIDDEN CARDS (Back of the stack)
    else {
      return "translate-x-0 scale-50 opacity-0 z-10 pointer-events-none blur-sm";
    }
  };

  return (
    <div className="w-full bg-[#0a0a0a] min-h-[600px] flex flex-col items-center justify-center overflow-hidden py-10 relative">
      
      {/* Container must be relative and wide enough to show side cards */}
      <div className="relative w-full max-w-[1000px] h-[450px] flex items-center justify-center">

        {isLoading && (
          <div className="absolute z-50 flex items-center justify-center">
            <Loader2 className="animate-spin text-white" size={40} />
          </div>
        )}

        {!isLoading && featuredCourses.map((course, index) => (
          <div
            key={course._id}
            // 🔴 THIS IS THE MAGIC: The transition handles the smooth 3D movement
            className={`absolute w-[280px] md:w-[320px] aspect-[3/4] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${getCardStyle(index)}`}
            onClick={() => {
                // Optional: Let user click a side card to bring it to the center
                if (index !== activeIndex) setActiveIndex(index);
            }}
          >
            {/* --- YOUR EXACT CARD DESIGN INTERIOR --- */}
            <div className="w-full h-full bg-[#050505] rounded-2xl overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/5">
              
              <div className="absolute inset-0 z-0">
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/90 via-black/50 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/95 to-transparent h-[95%] mt-auto"></div>
              </div>

              {/* Subtle Top Bar */}
              <div className="absolute top-0 inset-x-0 z-20 p-5 flex justify-between items-start">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#E50914] text-white text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm shadow-[0_0_10px_rgba(229,9,20,0.3)]">
                    {course.tag || "PREMIUM"}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  Live Now
                </span>
              </div>

              {/* Strict Bottom-Left Content Anchor */}
              <div className="absolute inset-0 z-10 p-6 flex flex-col justify-end">
                <h3 className="text-sm text-gray-300 font-medium line-clamp-1 mb-1 drop-shadow-md">
                  {course.title}
                </h3>
                <h2 className="text-3xl font-black text-white leading-none tracking-tight uppercase mb-5 line-clamp-2 shadow-black drop-shadow-lg">
                  {course.highlight || course.title.split(' ')[0]}
                </h2>

                {/* Pricing Section */}
                <div className="flex items-center gap-3 md:gap-5 mb-5 border-t border-white/10 pt-4">
                  <div className="flex flex-col">
                    <span className="text-[8px] md:text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Trial</span>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-white font-bold text-base md:text-lg">₹1</span>
                      <span className="text-[9px] md:text-[10px] text-gray-400">/Days</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] md:text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Standard</span>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-gray-200 font-bold text-sm md:text-base">₹99</span>
                      <span className="text-[9px] md:text-[10px] text-gray-400">/Month</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] md:text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Premium</span>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-gray-200 font-bold text-sm md:text-base">₹599</span>
                      <span className="text-[9px] md:text-[10px] text-gray-400">/Year</span>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-white hover:bg-gray-200 text-black font-bold py-3.5 rounded flex items-center justify-center gap-2 transition-colors text-sm tracking-wide">
                  <Play size={18} fill="currentColor" /> 
                  Watch Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      {!isLoading && featuredCourses.length > 0 && (
        <div className="flex justify-center gap-2 mt-8 z-20">
          {featuredCourses.map((_, index) => (
            <button 
              key={index} 
              onClick={() => setActiveIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${activeIndex === index ? 'w-8 bg-[#E50914]' : 'w-2 bg-white/30 hover:bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CoverflowCarousel;