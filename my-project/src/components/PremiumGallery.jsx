import React, { useState, useRef, useEffect } from 'react';
import { X, Maximize2, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const PremiumGallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef(null);

  const galleryItems = [
    { id: 1, src: "https://res.cloudinary.com/dv5ysdbps/image/upload/f_auto,q_auto/v1775578909/fnwmzdystnp8nlnd6hui.webp", title: "LTech Masterclass", category: "Seminars" },
    { id: 2, src: "https://res.cloudinary.com/dv5ysdbps/image/upload/f_auto,q_auto/v1775579003/rn0ltqar2lymnhaladm5.webp", title: "Institutional Tie-ups", category: "Partnerships" },
    { id: 3, src: "https://res.cloudinary.com/dv5ysdbps/image/upload/f_auto,q_auto/v1775579024/vgnmo7q8bpeewvppwpdb.webp", title: "Student Community", category: "Impact" },
    { id: 4, src: "https://res.cloudinary.com/dv5ysdbps/image/upload/f_auto,q_auto/v1775579059/huc7umr4gia3gt2shnez.webp", title: "Leading the Room", category: "Leadership" },
    { id: 5, src: "https://res.cloudinary.com/dv5ysdbps/image/upload/f_auto,q_auto/v1775579089/nbwi67k6dvuksof4wvbj.webp", title: "Packed Auditorium", category: "Bootcamps" },
    { id: 6, src: "https://res.cloudinary.com/dv5ysdbps/image/upload/f_auto,q_auto/v1775579129/vjfp6mgzxipbx4rgcguh.webp", title: "1:1 Networking", category: "Mentorship" }
  ];

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -374 : 374; // Approx item width + gap
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Auto-scroll logic
  useEffect(() => {
    let interval;
    // Only auto-scroll if the modal is closed and the user isn't hovering/touching the carousel
    if (!selectedImage && !isPaused) {
      interval = setInterval(() => {
        if (scrollContainerRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
          
          // If we reached the end of the scroll, smoothly reset to the beginning
          if (scrollLeft + clientWidth >= scrollWidth - 10) {
            scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            // Otherwise, scroll one item to the right
            scrollContainerRef.current.scrollBy({ left: 374, behavior: 'smooth' });
          }
        }
      }, 3000); // Scrolls every 3 seconds
    }
    return () => clearInterval(interval);
  }, [selectedImage, isPaused]);

  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#008a45]/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6 shadow-lg shadow-emerald-900/20">
            <Sparkles size={16} /> Life at Upskale
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Our Recent <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">College Visit</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            T3 City Murshidabad DNC College
          </p>
        </div>

        {/* Carousel Controls & Container with Hover/Touch Pause Events */}
        <div 
          className="relative group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 z-20 w-12 h-12 bg-black/60 hover:bg-[#008a45] border border-white/10 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
          >
            <ChevronLeft size={24} />
          </button>

          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 z-20 w-12 h-12 bg-black/60 hover:bg-[#008a45] border border-white/10 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight size={24} />
          </button>

          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-6 snap-x snap-mandatory pb-8 pt-4 custom-scrollbar hide-scrollbar-arrows"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} 
          >
            <style dangerouslySetInnerHTML={{__html: `
              .custom-scrollbar::-webkit-scrollbar { display: none; }
            `}} />

            {galleryItems.map((item) => (
              <div 
                key={item.id}
                onClick={() => setSelectedImage(item)}
                className="snap-center shrink-0 w-[85vw] sm:w-[350px] md:w-[400px] h-[300px] md:h-[400px] relative rounded-3xl overflow-hidden group cursor-pointer border border-white/10 bg-[#121212] shadow-2xl transform transition-transform hover:-translate-y-2"
              >
                <img 
                  src={item.src} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500"></div>

                <div className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 border border-white/20">
                  <Maximize2 size={18} className="text-white" />
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="text-[#00d26a] text-[10px] font-black uppercase tracking-widest mb-2 drop-shadow-md">
                    {item.category}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg leading-tight">
                    {item.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 md:top-10 md:right-10 w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center text-white transition-colors z-50"
          >
            <X size={24} />
          </button>

          <div className="relative max-w-6xl w-full max-h-[85vh] p-4 flex flex-col items-center animate-in zoom-in-95 duration-300">
            <img 
              src={selectedImage.src} 
              alt={selectedImage.title} 
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10"
            />
            <div className="mt-6 text-center">
              <span className="text-[#008a45] text-xs font-black uppercase tracking-widest">{selectedImage.category}</span>
              <h3 className="text-3xl font-bold text-white mt-2">{selectedImage.title}</h3>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

export default PremiumGallery;