import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom'; 
import { BASE_URL } from '../config';

const TopBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [masterclass, setMasterclass] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestMasterclass = async () => {
      try {
        const res = await fetch(`${BASE_URL}/masterclasses`);
        if (!res.ok) throw new Error('Network error');
        
        const result = await res.json();
        
        if (Array.isArray(result) && result.length > 0) {
          setMasterclass(result[0]);
        }
      } catch (error) {
        console.error("Failed to load top banner data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestMasterclass();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Coming Soon";
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!isVisible || loading || !masterclass) return null;

  return (
    <div className="relative bg-[#0f172a] text-white overflow-hidden transition-all duration-300 ease-in-out border-b border-white/5">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]"></div>

      {/* FIX 3: Added pr-10 and adjusted sm:px-12 to ensure text avoids the close button area */}
      <div className="max-w-7xl mx-auto pl-4 pr-10 py-3 sm:px-12 lg:px-12 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-y-2 gap-x-4 text-center sm:text-left text-sm">
          
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-semibold text-xs border border-blue-500/20 uppercase tracking-wide">
            <Sparkles size={12} /> New
          </span>

          <p className="font-medium text-gray-200">
            <span className="font-bold text-white mr-1">
               {masterclass.title}:
            </span> 
            {masterclass.tagline || "Join the live session"}
            <span className="hidden sm:inline mx-3 text-gray-600">|</span>
          </p>
          
          <p className="text-gray-300">
            Live on <span className="text-white font-bold">{formatDate(masterclass.schedule?.startDate)}</span>
            <span className="mx-2 text-gray-600">•</span>
            {masterclass.price?.discounted === 0 ? (
              <span className="text-[#38bdf8] font-bold">100% FREE</span>
            ) : (
              <>Only <span className="text-[#38bdf8] font-bold">₹{masterclass.price?.discounted}</span></>
            )}
          </p>

          <Link 
            to={`/masterclass/${masterclass.slug}`}
            className="group flex items-center gap-1 font-bold text-[#38bdf8] hover:text-white transition-colors sm:ml-2"
          >
            Register Now 
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>

        </div>
      </div>

      {/* FIX 1 & 2: Added z-20, changed top-1/2 to sm:top-1/2 and added top-1 for mobile */}
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-2 top-1 sm:top-1/2 sm:-translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors z-20"
        aria-label="Close banner"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default TopBanner;