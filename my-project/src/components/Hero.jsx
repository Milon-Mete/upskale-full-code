import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // 🔴 Added useLocation just in case, though useNavigate handles state
import { 
  Phone, ChevronDown, MoveUpRight, ShieldCheck, X, 
  MessageCircle, Clock, TrendingUp, Play, Users, Award, Loader2, Sparkles, Bookmark, Flame
} from 'lucide-react';
import { BASE_URL } from '../config'; 
import CoverflowCarousel from './CoverflowCarousel';

const Hero = ({ onDiscoverClick }) => {
  const navigate = useNavigate();
  
  // State for popups
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isDiscoverOpen, setIsDiscoverOpen] = useState(false);

  // --- DYNAMIC CAROUSEL LOGIC ---
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🔴 Streak state
  const [streak, setStreak] = useState(0);
  const [streakAlive, setStreakAlive] = useState(false);

  // 🔴 THE FIX: Read the user's session from localStorage to check subscription status
  const userObj = JSON.parse(localStorage.getItem('user') || 'null');
  const isSubscribed = userObj?.biteSizeSubscription?.status === 'active' && new Date(userObj?.biteSizeSubscription?.expiresAt) > new Date();
  const isAdmin = userObj?.role === 'admin';
  const hasAccess = isSubscribed || isAdmin;

  // 🔴 Fetch streak data
  useEffect(() => {
    const userObj = JSON.parse(localStorage.getItem('user') || 'null');
    if (userObj) {
      fetch(`${BASE_URL}/engagement/streak`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setStreak(data.currentStreak);
            setStreakAlive(data.streakAlive);
          }
        })
        .catch(err => console.log("Streak fetch error", err));
    }
  }, []);

  // Fetch the latest 5 courses from the database
  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        const res = await fetch(`${BASE_URL}/bitesize-courses`);
        if (res.ok) {
          const data = await res.json();
          // Grab the first 5 courses
          setFeaturedCourses(data.slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to fetch featured courses", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeaturedCourses();
  }, []);

  // Auto-rotate the slider every 4 seconds
  useEffect(() => {
    if (featuredCourses.length <= 1) return; // Don't spin if there's only 0 or 1 course
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === featuredCourses.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [featuredCourses.length]);

  // Card Gradient Style
  const cardBgStyle = {
    background: 'radial-gradient(circle at bottom right, rgba(0, 138, 69, 0.15) 0%, rgba(22, 22, 22, 1) 60%, rgba(15, 15, 15, 1) 100%)',
  };

  // Dropdown Navigation Handler
  const handleNavigate = (path) => {
    setIsDiscoverOpen(false);
    if (path === 'scroll' && onDiscoverClick) {
        onDiscoverClick();
    } else {
        navigate(path);
    }
  };

  return (
    <div className="relative bg-[#050505] min-h-[90vh] overflow-hidden font-sans selection:bg-[#008a45] selection:text-white">

      {/* --- CONTACT POPUP MODAL --- */}
      {isContactOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsContactOpen(false)}
          ></div>

          <div className="relative bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl transform transition-all scale-100">
            <button
              onClick={() => setIsContactOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="h-12 w-12 bg-[#008a45]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Phone className="text-[#008a45]" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">Connect with Upskale</h3>
              <p className="text-gray-400 text-sm mt-1">Choose how you'd like to connect</p>
            </div>

            <div className="space-y-3">
              <a
                href="tel:+919038022891"
                className="flex items-center justify-center gap-3 w-full py-3.5 bg-[#008a45] hover:bg-[#007a3d] text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-green-500/20"
              >
                <Phone size={18} />
                Call +91 9038022891
              </a>

              <a
                href="https://wa.me/919038022891"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-green-500/20"
              >
                <MessageCircle size={18} />
                Chat on WhatsApp
              </a>
            </div>

            <p className="text-center text-gray-600 text-xs mt-6">
              Available Mon-Sat, 10 AM - 7 PM
            </p>
          </div>
        </div>
      )}

      {/* --- PAGE BACKGROUND ELEMENTS --- */}
      <div className="absolute top-1/2 right-[-10%] w-[600px] h-[600px] bg-[#008a45] rounded-full blur-[180px] opacity-15 pointer-events-none z-0 transform -translate-y-1/2"></div>

      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#333 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]/50 z-0 pointer-events-none"></div>

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-2 flex flex-col lg:flex-row items-center">

        {/* LEFT SIDE: Text & Buttons */}
        <div className="w-full lg:w-1/2 space-y-4">
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#008a45]"></span>
              </span>
              <span className="text-gray-300 text-[10px] font-bold tracking-wide uppercase">
                Job Ready Certification
              </span>
            </div>
            
          </div>

          <div className="space-y-2 mb-6">
            <h1 className="text-4xl md:text-2xl lg:text-5xl font-thin text-white leading-[1.1] tracking-tight">
              Launch Your Dream <br />
              Career with Skills in
              <span className="inline-flex items-center justify-center ml-2 align-middle -mt-1 w-10 h-10 rounded-md border border-gray-700 bg-[#1a1a1a] transform rotate-12 shadow-xl">
                <span className="text-green-500/80 font-mono text-lg font-normal"><TrendingUp className="text-[#008f0c] w-8 h-8 opacity-80" /></span>
              </span>
            </h1>

            <h1 className="text-3xl md:text-3xl lg:text-5xl font-thin leading-[1.1] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#008a45] to-[#00ff8a]">
              Bengali & Hindi
            </h1>
          </div>

          <p className="text-lg text-gray-400 max-w-lg font-medium leading-relaxed">
            Stop struggling with English tutorials. Master Digital Marketing, Data, and AI with live mentorship in your native language.
          </p>

          <div className="flex flex-col gap-3 w-full max-w-xl pt-4">
            
            {/* --- TOP ACTION BUTTONS --- */}
            <div className="flex flex-col sm:flex-row gap-3">
              
              <button
                onClick={() => setIsContactOpen(true)}
                style={cardBgStyle}
                className="group flex-1 border border-white/5 rounded-2xl p-5 flex items-center justify-between transition-all duration-500 hover:border-[#008a45]/40 hover:shadow-[0_0_30px_rgba(0,138,69,0.1)] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                <div className="text-left relative z-10">
                  <p className="text-white text-lg font-bold leading-tight tracking-tight">
                    Talk to Career <br /> Expert
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-[#008a45]/15 text-[#008a45] flex items-center justify-center group-hover:bg-[#008a45] group-hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(0,138,69,0.2)]">
                  <Phone size={18} fill="currentColor" className="group-hover:fill-none" />
                </div>
              </button>

              <div className="relative flex-1">
                <button
                  onClick={() => setIsDiscoverOpen(!isDiscoverOpen)}
                  style={cardBgStyle}
                  className={`group w-full border rounded-2xl p-5 flex items-center justify-between transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,138,69,0.1)] relative overflow-hidden ${
                    isDiscoverOpen ? 'border-[#008a45]/80 bg-[#008a45]/5' : 'border-white/5 hover:border-[#008a45]/40'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                  <div className="text-left relative z-10">
                    <p className="text-white text-lg font-bold leading-tight tracking-tight">
                      Discover All <br /> Courses
                    </p>
                  </div>
                  <div className={`h-10 w-10 rounded-full bg-white/5 text-white/80 border border-white/10 flex items-center justify-center transition-all duration-300 ${
                    isDiscoverOpen ? 'bg-[#008a45] text-white rotate-180' : 'group-hover:bg-[#008a45] group-hover:text-white'
                  }`}>
                    <ChevronDown size={20} />
                  </div>
                </button>

                {/* THE SLEEK DROPDOWN MENU */}
                {isDiscoverOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsDiscoverOpen(false)} 
                    />
                    
                    <div className="absolute top-full left-0 right-0 lg:right-auto lg:w-max mt-3 bg-[#121212]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="flex flex-col lg:flex-row p-2 gap-2">
                        <a 
                          href="#bitesize" 
                          onClick={() => setIsDiscoverOpen(false)}
                          className="flex-1 flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors text-left group/item"
                        >
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover/item:bg-emerald-500 group-hover/item:text-white transition-colors shrink-0">
                            <Play size={18} />
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm whitespace-nowrap">Bite-Sized Courses</p>
                            <p className="text-gray-500 text-xs whitespace-nowrap">Learn via 60-second shorts</p>
                          </div>
                        </a>

                        <a 
                          href="#cohortcourse" 
                          onClick={() => setIsDiscoverOpen(false)}
                          className="flex-1 flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors text-left group/item"
                        >
                          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover/item:bg-blue-500 group-hover/item:text-white transition-colors shrink-0">
                            <Users size={18} />
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm whitespace-nowrap">Live Cohorts</p>
                            <p className="text-gray-500 text-xs whitespace-nowrap">Interactive group learning</p>
                          </div>
                        </a>

                        <a 
                          href="#masterclass" 
                          onClick={() => setIsDiscoverOpen(false)}
                          className="flex-1 flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors text-left group/item"
                        >
                          <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 group-hover/item:bg-yellow-500 group-hover/item:text-black transition-colors shrink-0">
                            <Award size={18} />
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm whitespace-nowrap">Masterclasses</p>
                            <p className="text-gray-500 text-xs whitespace-nowrap">1-day deep dive sessions</p>
                          </div>
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* --- 3-COLUMN GRID --- */}
            <div className="grid grid-cols-3 pb-8 gap-2 sm:gap-3 mt-4">

              {/* 1. REAL GOOGLE REVIEW BOX */}
              <div style={cardBgStyle} className="border border-white/5 rounded-2xl p-2 sm:p-4 flex flex-col items-center justify-center relative group min-h-[90px] hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="bg-white rounded-full p-0.5 w-5 h-5 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  </div>
                  <span className="text-white font-bold text-sm sm:text-base group-hover:text-[#008a45] transition-colors">5.0</span>
                </div>
                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide text-center">
                  Review
                </div>
              </div>

              {/* 2. ISO CERTIFIED BOX */}
              <div style={cardBgStyle} className="border border-white/5 rounded-2xl p-2 sm:p-4 flex flex-col items-center justify-center relative overflow-hidden group min-h-[90px] hover:bg-white/[0.02] transition-colors">
                <div className="absolute inset-0 bg-[#008a45]/0 group-hover:bg-[#008a45]/5 transition-colors duration-500" />
                <div className="bg-[#008a45]/20 w-7 h-7 rounded-full flex items-center justify-center mb-1.5 group-hover:bg-[#008a45] transition-colors duration-300">
                  <ShieldCheck size={14} className="text-[#008a45] group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-white font-bold text-[11px] sm:text-xs leading-none">ISO 9001:2015</span>
                  <span className="text-[9px] text-gray-500 font-medium mt-0.5 uppercase group-hover:text-white transition-colors">Certified</span>
                </div>
              </div>

              {/* 3. 🔥 DAILY STREAK BOX */}
              <div style={cardBgStyle} className="border border-white/5 rounded-2xl p-2 sm:p-4 flex flex-col items-center justify-center min-h-[90px] hover:bg-white/[0.02] transition-colors group">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1.5 transition-colors duration-300 ${streak > 0 ? 'bg-orange-500/20 group-hover:bg-orange-500' : 'bg-[#008a45]/20 group-hover:bg-[#008a45]'}`}>
                  <Flame size={14} className={`transition-colors ${streak > 0 ? 'text-orange-500 group-hover:text-white' : 'text-[#008a45] group-hover:text-white'}`} />
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-white font-bold text-[11px] sm:text-xs leading-none">
                    {streak > 0 ? `${streak} Day${streak > 1 ? 's' : ''}` : 'Start'}
                  </span>
                  <span className="text-[9px] text-gray-500 font-medium mt-0.5 uppercase group-hover:text-white transition-colors">
                    {streak > 0 ? (streakAlive ? '🔥 Streak Active' : 'Streak') : 'Learning Streak'}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        
{/* --- RIGHT SIDE: True 3D Coverflow Carousel --- */}
<div className="w-full lg:w-1/2 mt-10 lg:mt-0 relative flex justify-center items-center h-[450px] lg:h-[550px] overflow-hidden lg:overflow-visible perspective-1000">
  
  {/* Skeleton Loading State */}
  {isLoading && (
    <div className="w-full max-w-[340px] aspect-[3/4] bg-[#121212] rounded-2xl border border-white/5 flex items-center justify-center z-50">
      <Loader2 className="animate-spin text-white" size={40} />
    </div>
  )}

  {/* API Driven Dynamic Courses */}
  {!isLoading && featuredCourses.length > 0 && featuredCourses.map((course, index) => {
    
    // 1. Calculate relative position (infinite loop math)
    const total = featuredCourses.length;
    let diff = index - currentImageIndex;
    
    // Fix looping so moving past the last item brings the first item to the right side
    if (diff === total - 1) diff = -1;
    if (diff === -(total - 1)) diff = 1;

    // 2. Assign dynamic classes based on position
    let transformClasses = '';
    
    if (diff === 0) {
      // Center Card (Active)
      transformClasses = 'translate-x-0 scale-100 opacity-100 z-30 shadow-[0_20px_50px_rgba(0,0,0,0.5)]';
    } else if (diff === 1) {
      // Right Card
      transformClasses = 'translate-x-[60%] lg:translate-x-[45%] scale-[0.8] opacity-40 z-20 blur-[2px] hover:opacity-70 cursor-pointer';
    } else if (diff === -1) {
      // Left Card
      transformClasses = '-translate-x-[60%] lg:-translate-x-[45%] scale-[0.8] opacity-40 z-20 blur-[2px] hover:opacity-70 cursor-pointer';
    } else {
      // Hidden Cards (pushed to the back)
      transformClasses = 'translate-x-0 scale-[0.6] opacity-0 z-0 pointer-events-none';
    }

    // 🔴 3. CALCULATE ROUTER STATE & NAVIGATION PATH
    const targetUrl = course.isLocked 
        ? "#" 
        : hasAccess 
            ? `/bitesize/${course.slug}` 
            : "/pro";

    const navState = (!course.isLocked && !hasAccess) 
        ? { returnTo: `/bitesize/${course.slug}` } 
        : null;

    return (
      <div
        key={course._id || index}
        // If it's a side card, clicking it should navigate the carousel to that index
        onClick={() => diff !== 0 ? setCurrentImageIndex(index) : null}
        className={`
          absolute w-[280px] sm:w-[320px] lg:w-[340px] aspect-[3/4] 
          transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
          ${transformClasses}
        `}
      >
        <div className="w-full h-full bg-[#050505] rounded-2xl overflow-hidden relative group">
          
          {/* Background Poster & Heavy Gradient */}
          <div className="absolute inset-0 z-0">
            {course.image && (
              <img 
                src={course.image} 
                alt={course.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
            )}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/90 via-black/50 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/95 to-transparent h-[95%] mt-auto"></div>
          </div>

          {/* Top Bar */}
          <div className="absolute top-0 inset-x-0 z-20 p-5 flex justify-between items-start">
            <span className="bg-[#E50914] text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm shadow-[0_0_10px_rgba(229,9,20,0.3)]">
              {course.tag || "PREMIUM"}
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              Live Now
            </span>
          </div>

          {/* Strict Bottom-Left Content Anchor */}
          <div className="absolute inset-0 z-10 p-6 flex flex-col justify-end">
            
            <h3 className="text-sm text-gray-300 font-medium line-clamp-1 mb-1 drop-shadow-md">
              {course.title}
            </h3>
            <h2 className="text-3xl font-black text-white leading-none tracking-tight uppercase mb-5 line-clamp-2 drop-shadow-lg">
              {course.highlight || course.title.split(' ')[0]}
            </h2>
            
            {/* Pricing Section (Or "Active" badge if they are subscribed) */}
            {!course.isLocked && !hasAccess ? (
                <div className="flex items-center gap-4 lg:gap-5 mb-5 border-t border-white/10 pt-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Trial</span>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-white font-bold text-lg">₹1</span>
                      <span className="text-[10px] text-gray-400">/Days</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Standard</span>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-gray-200 font-bold text-sm">₹99</span>
                      <span className="text-[10px] text-gray-400">/Month</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Premium</span>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-gray-200 font-bold text-sm">₹599</span>
                      <span className="text-[10px] text-gray-400">/Year</span>
                    </div>
                  </div>
                </div>
            ) : (
                <div className="mb-5 border-t border-white/10 pt-4">
                    <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded">
                        Pro Access Active
                    </span>
                </div>
            )}

            {/* 🔴 4. APPLY NAVIGATION TO THE BUTTON */}
            <button 
              onClick={() => {
                  if (diff !== 0 || course.isLocked) return;
                  navigate(targetUrl, { state: navState });
              }}
              disabled={diff !== 0 || course.isLocked}
              className={`w-full font-bold py-3.5 rounded flex items-center justify-center gap-2 transition-all text-sm tracking-wide
                ${diff === 0 && !course.isLocked ? 'bg-white hover:bg-gray-200 text-black' : 'bg-white/10 text-white/50 cursor-not-allowed'}
              `}
            >
              <Play size={18} fill="currentColor" /> 
              {hasAccess ? "Continue Watching" : "Watch Now"}
            </button>
          </div>
        </div>
      </div>
    );
  })}

  {/* Dots Indicator */}
  {!isLoading && featuredCourses.length > 0 && (
    <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-1.5 z-40">
      {featuredCourses.map((_, index) => (
        <button 
          key={index} 
          onClick={() => setCurrentImageIndex(index)}
          className={`h-1 rounded-full transition-all duration-300 ${currentImageIndex === index ? 'w-6 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/50'}`}
        />
      ))}
    </div>
  )}
</div>
    

      </div>
    </div>
  );
};

export default Hero;