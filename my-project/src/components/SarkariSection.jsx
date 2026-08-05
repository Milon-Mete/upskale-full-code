import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Lock, ChevronRight, BarChart3, FileSpreadsheet, 
  Bot, Presentation, MessageSquare, Sparkles, ArrowUpRight, Loader2, Globe, CheckCircle2 
} from 'lucide-react';
import { BASE_URL } from '../config'; 

// 1. Create a mapping dictionary for dynamic icons
const IconMap = {
  FileSpreadsheet: FileSpreadsheet,
  Presentation: Presentation,
  Bot: Bot,
  BarChart3: BarChart3,
  MessageSquare: MessageSquare
};

const SarkariSection = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);

  // 🔴 THE FIX: Read the user's session from localStorage to check subscription status
  const userObj = JSON.parse(localStorage.getItem('user') || 'null');
  const isSubscribed = userObj?.biteSizeSubscription?.status === 'active' && new Date(userObj?.biteSizeSubscription?.expiresAt) > new Date();
  const isAdmin = userObj?.role === 'admin';
  const hasAccess = isSubscribed || isAdmin;

  // 3. Fetch courses from the backend on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${BASE_URL}/bitesize-courses`);
        if (response.ok) {
          const data = await response.json();
          setCourses(data);
        } else {
          console.error("Failed to fetch bite-sized courses");
        }
      } catch (error) {
        console.error("Network error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <section className="bg-[#050505] w-full py-16 font-sans relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-[#050505] pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent opacity-50" />
      </div>

      {/* Header Section */}
      <div className="relative z-10 flex justify-between items-end px-6 mb-10 max-w-[1400px] mx-auto">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <Sparkles className="text-[#008a45]" size={16} />
              <span className="text-[#008a45] font-bold text-xs uppercase tracking-[0.2em]">Bites</span>
           </div>
           
           <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none">
              Learn a tech skill <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">in mins</span>
           </h2>
        </div>
        
        <button className="hidden md:flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors group">
          View All Paths <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-20 relative z-10">
          <Loader2 className="animate-spin text-emerald-500" size={32} />
        </div>
      ) : (
        /* Slider Container: Forced Flex Row for ALL screens */
        <div 
          ref={sliderRef}
          className="
            flex overflow-x-auto gap-5 px-6 pb-12 no-scrollbar snap-x snap-mandatory 
            touch-pan-x touch-pan-y max-w-[1400px] mx-auto relative z-10
          "
          style={{ WebkitOverflowScrolling: 'touch' }} 
        >
          {courses.toReversed().map((course) => {
            const CurrentIcon = IconMap[course.iconName] || MessageSquare;

            // 1. Determine where the card should send the user
            const targetUrl = course.isLocked 
              ? "#" 
              : hasAccess 
                ? `/bitesize/${course.slug}` // Has access -> Go to course
                : "/pro";                    // No access -> Go to checkout

            // 2. If sending to checkout, attach the return URL silently in the state
            const navState = (!course.isLocked && !hasAccess) 
              ? { returnTo: `/bitesize/${course.slug}` } 
              : null;

            return (
              <Link 
                to={targetUrl} 
                state={navState} 
                key={course._id} 
                className={`
                  flex-shrink-0 w-[85%] sm:w-[320px] lg:w-[320px] snap-center transform-gpu
                  h-[450px] relative rounded-[2rem] overflow-hidden border border-white/5 flex flex-col group 
                  transition-all duration-300 md:duration-500 md:hover:-translate-y-2 md:hover:shadow-2xl ${course.glowColor}
                  ${course.isLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}
                `}
                onClick={(e) => course.isLocked && e.preventDefault()}
              >
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-90 md:opacity-80 md:group-hover:opacity-100 md:group-hover:from-black transition-all duration-500 z-10" />
                
                {/* Top Content Layer */}
                <div className="relative z-20 p-6 flex flex-col h-full justify-between">
                  
                  {/* Header: Icon & Lock Status */}
                  <div className="flex justify-between items-start">
                    <div className="bg-black/80 md:bg-black/40 md:backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-lg md:group-hover:bg-white/10 transition-colors">
                      <CurrentIcon size={20} className={course.highlightColor} />
                    </div>
                    {course.isLocked ? (
                      <div className="bg-black/80 md:bg-black/60 md:backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/5 flex items-center gap-1.5">
                        <Lock size={12} className="text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Coming Soon</span>
                      </div>
                    ) : (
                      <div className="bg-[#008a45] px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-green-900/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wide">Certificate Course</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom: Text Content */}
                  <div className="md:transform md:transition-transform md:duration-500 md:group-hover:translate-y-[-12px]">
                    <div className="inline-block px-2 py-1 rounded bg-black/60 md:bg-white/10 md:backdrop-blur-md border border-white/5 text-[10px] font-bold text-white/80 uppercase tracking-widest mb-3">
                      {course.tag}
                    </div>
                    
                    <div className="space-y-0.5 mb-4">
                        <h3 className="text-gray-300 font-medium text-lg line-clamp-1">
                        {course.title}
                        </h3>
                        <h3 className={`font-black text-3xl leading-[0.9] uppercase tracking-tight ${course.highlightColor} line-clamp-2`}>
                        {course.highlight}
                        </h3>
                    </div>

                    {/* 🔴 NEW LOGIC: Show Pricing ONLY if they DO NOT have access */}
                    {!course.isLocked && !hasAccess && (
                      <div className="mt-4 opacity-100 transition-opacity w-full">
                          <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-2">
                              <Globe size={10}/> Global Access Plans
                          </div>
                          
                          <div className="space-y-1.5">
                              {/* Trial Row */}
                              <div className="flex items-center justify-between bg-gradient-to-r from-[#eab308]/10 to-transparent border border-[#eab308]/20 rounded-md px-2.5 py-1.5 backdrop-blur-sm">
                                  <span className="text-[10px] text-[#eab308] font-black uppercase tracking-wider">3-Day Trial</span>
                                  <div className="flex items-baseline gap-1">
                                      <span className="text-white font-black text-sm">₹1</span>
                                      <span className="text-[9px] text-[#eab308]/80 font-medium">only</span>
                                  </div>
                              </div>
                              
                              {/* Monthly & Yearly Row */}
                              <div className="flex items-center gap-1.5">
                                  <div className="flex-1 flex items-center justify-between bg-white/5 border border-white/10 rounded-md px-2 py-1.5 backdrop-blur-sm">
                                      <span className="text-[9px] text-gray-400 font-bold uppercase">Monthly</span>
                                      <span className="text-white font-bold text-xs">₹99</span>
                                  </div>
                                  <div className="flex-1 flex items-center justify-between bg-white/5 border border-white/10 rounded-md px-2 py-1.5 backdrop-blur-sm">
                                      <span className="text-[9px] text-gray-400 font-bold uppercase">Yearly</span>
                                      <span className="text-white font-bold text-xs">₹599</span>
                                  </div>
                              </div>
                          </div>
                      </div>
                    )}

                    {/* 🔴 NEW LOGIC: Show "Pro Access Active" if they DO have access */}
                    {!course.isLocked && hasAccess && (
                        <div className="mt-4 opacity-100 transition-opacity w-full">
                            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg backdrop-blur-sm w-max">
                                <CheckCircle2 size={16} className="text-emerald-400" />
                                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Pro Access Active</span>
                            </div>
                        </div>
                    )}

                    {/* Explore text */}
                    {!course.isLocked && (
                        <div className="hidden md:block h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-500 overflow-hidden mt-0 group-hover:mt-4">
                            <span className="text-xs font-bold text-white flex items-center gap-2">
                                {/* Button text changes dynamically */}
                                {hasAccess ? "Continue Learning" : "Start Learning"} <ChevronRight size={14} />
                            </span>
                        </div>
                    )}
                  </div>
                </div>

                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                   <img 
                     src={course.image} 
                     alt={course.title}
                     loading="lazy"
                     className="w-full h-full object-cover md:transition-transform md:duration-700 md:group-hover:scale-110 md:grayscale-[0.2] md:group-hover:grayscale-0"
                   />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

    </section>
  );
};

export default SarkariSection;