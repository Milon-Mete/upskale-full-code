import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { BASE_URL } from '../config';

const MasterclassHighlight = () => {
  const [masterclasses, setMasterclasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const location = useLocation();

  // --- 1. GET USER FROM LOCALSTORAGE ---
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [location]);

  // --- 2. FETCH DATA ---
  useEffect(() => {
    const fetchMasterclasses = async () => {
      try {
        // Fetch only UPCOMING and PUBLISHED masterclasses from public route
        const res = await fetch(`${BASE_URL}/masterclasses`);
        
        if (!res.ok) throw new Error('Network error');
        
        const result = await res.json();
        // Only set data if we get a valid array
        setMasterclasses(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Failed to load masterclasses", error);
        setMasterclasses([]); 
      } finally {
        setLoading(false);
      }
    };
    fetchMasterclasses();
  }, []);

  // --- 3. CHECK ENROLLMENT ---
  const checkIsPurchased = (courseId) => {
    if (!user || !user.enrolledCourses) return false;
    return user.enrolledCourses.some(enrollment => {
        const item = enrollment.item;
        if (typeof item === 'string') return item === courseId;
        if (item && typeof item === 'object') return item._id === courseId;
        return false;
    });
  };

  const getFormattedDate = (dateString) => {
    if (!dateString) return "Date TBA";
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  // Don't show anything if loading or no classes available
  if (loading || masterclasses.length === 0) return null;

  return (
    <section className="py-8 px-4 w-full flex justify-center animate-fade-in-up">
      <div className="w-full flex flex-col items-center gap-8">
        
        {masterclasses.map((data) => {
            const isPurchased = checkIsPurchased(data._id);

            return (
            <div 
                key={data._id}
                className={`w-full max-w-6xl bg-[#0f0f0f] border rounded-2xl overflow-hidden relative shadow-2xl group transition-all hover:border-red-500/30
                ${isPurchased ? 'border-green-500/30' : 'border-white/10'}`}
            >
                 {/* Background Glow Effect */}
                 <div className={`absolute top-0 right-0 w-[300px] h-[300px] blur-[100px] rounded-full pointer-events-none transition-opacity
                    ${isPurchased ? 'bg-green-600/20 opacity-50' : 'bg-red-600/20 opacity-50 group-hover:opacity-100'}`} 
                 />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-6 md:p-8 gap-6">
                
                {/* LEFT: Content */}
                <div className="flex-1 text-left">
                    
                    {/* Badge Logic */}
                    {isPurchased ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold uppercase tracking-wider mb-3">
                            <CheckCircle2 size={12} /> You are registered
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-wider mb-3">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            Live Masterclass
                        </div>
                    )}

                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                    {data.title} <span className="text-gray-500 font-normal">{data.tagline || ""}</span>
                    </h2>
                    
                    <p className="text-gray-400 text-sm md:text-base max-w-xl mb-4 line-clamp-2">
                    {data.description || "Join us for an intensive live session designed to boost your skills."}
                    </p>

                    {/* Trust Badges - Horizontal */}
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 font-medium">
                        <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-500"/> Certificate</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-500"/> Recording</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-500"/> Templates</span>
                    </div>
                </div>

                {/* RIGHT: Action Card (Compact) */}
                <div className="flex-shrink-0 w-full md:w-auto bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm">
                    <div className="flex items-center gap-5 text-sm text-gray-300 mb-4">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className={isPurchased ? "text-green-500" : "text-red-500"} />
                            <span className="font-semibold text-white">
                                {data.schedule?.startDate ? getFormattedDate(data.schedule.startDate) : "Coming Soon"}
                            </span>
                        </div>
                        <div className="w-px h-4 bg-white/10"></div>
                        <div className="flex items-center gap-2">
                            <Clock size={16} className={isPurchased ? "text-green-500" : "text-red-500"} />
                            <span className="whitespace-nowrap">
                                {data.schedule?.startTime ? `${data.schedule.startTime} - ${data.schedule.endTime}` : "TBA"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {!isPurchased && (
                            <div className="text-left">
                                {data.price?.discounted === 0 ? (
                                    <p className="text-xl font-bold text-green-400">FREE</p>
                                ) : (
                                    <>
                                        <p className="text-xs text-gray-500 line-through">₹{data.price?.original}</p>
                                        <p className="text-xl font-bold text-white">₹{data.price?.discounted}</p>
                                    </>
                                )}
                            </div>
                        )}

                        {/* --- BUTTON LOGIC --- */}
                        <Link 
                            to={isPurchased ? "/profile" : `/masterclass/${data.slug}`} 
                            className={`flex-1 font-bold py-2.5 px-6 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 group-hover:scale-[1.02]
                            ${isPurchased 
                                ? "bg-green-600 hover:bg-green-500 text-white shadow-green-900/40" 
                                : "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-red-900/40"
                            }`}
                        >
                            {isPurchased ? (
                                <>
                                    <CheckCircle2 size={16} /> Go to Profile
                                </>
                            ) : (
                                <>
                                    Register <ArrowRight size={16} />
                                </>
                            )}
                        </Link>
                    </div>
                </div>

                </div>
            </div>
            );
        })}
      </div>
    </section>
  );
};

export default MasterclassHighlight;