import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
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
    <div className="relative bg-gradient-to-r from-[#7f0d0d] via-[#C1121F] to-[#7f0d0d] text-white overflow-hidden border-b border-white/10">
      <div className="max-w-[1400px] mx-auto px-4 pr-10 py-2 relative z-10">
        <div className="flex items-center justify-center gap-3 text-center text-[13px]">
          <p className="font-medium text-white/95 truncate">
            <span className="font-bold text-white">
              {masterclass.title}
            </span>
            <span className="hidden sm:inline text-white/70"> — {masterclass.tagline || "Join the live session"}</span>
            <span className="mx-2 text-white/40">•</span>
            <span className="text-white/90">Live {formatDate(masterclass.schedule?.startDate)}</span>
            <span className="mx-2 text-white/40">•</span>
            {masterclass.price?.discounted === 0 ? (
              <span className="font-bold text-white">FREE</span>
            ) : (
              <span className="font-bold text-white">₹{masterclass.price?.discounted}</span>
            )}
          </p>

          <Link
            to={`/masterclass/${masterclass.slug}`}
            className="shrink-0 group inline-flex items-center gap-1 bg-white text-[#B30D0D] font-black text-[12px] px-4 py-1 rounded-full hover:bg-red-50 transition-all active:scale-95"
          >
            Register
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white/70 hover:text-white transition-colors z-20"
        aria-label="Close banner"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default TopBanner;
