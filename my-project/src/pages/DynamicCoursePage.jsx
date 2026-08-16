import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircle2, Star, ArrowRight, Database, Layout,
  GitMerge, FileSpreadsheet, BarChart3, Loader2, Unlock,
  Briefcase, Users, MonitorPlay, Calendar, Phone, Download,
  Linkedin, ChevronLeft, ChevronRight, Lock, Zap, Share2
} from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import Accreditations from '../components/Accreditations';
import { BASE_URL } from '../config';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = `${BASE_URL}`;

const DynamicCoursePage = () => {
  const navigate = useNavigate();
  const { slug } = useParams();

  const { addToCart } = useCart();
  const { user: authUser, openLoginModal } = useAuth();

  const [isPricingVisible, setIsPricingVisible] = useState(false);
  const pricingSectionRef = useRef(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(authUser || null);


  // --- 🔴 SILENT BACKGROUND USER REFRESH ---
  useEffect(() => {
    const fetchUserProfile = async () => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return;
        
        const localData = JSON.parse(storedUser);
        setUser(localData); // Set instantly for fast UI load

        try {
            // Quietly fetch fresh data from backend to see if they just bought this course
            const res = await fetch(`${API_BASE_URL}/user/${localData._id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include' // 🔴 REQUIRED
            });

            if (res.ok) {
                const freshUserData = await res.json();
                setUser(freshUserData);
                localStorage.setItem('user', JSON.stringify(freshUserData));
            }
        } catch (error) {
            console.error("Silent user refresh failed", error);
        }
    };
    
    fetchUserProfile();
  }, []);

  // --- 🔴 SCROLL OBSERVER FOR STICKY CTA ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        // If the pricing section is 10% visible, switch the button logic
        setIsPricingVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (pricingSectionRef.current) {
      observer.observe(pricingSectionRef.current);
    }

    return () => {
      if (pricingSectionRef.current) {
        observer.unobserve(pricingSectionRef.current);
      }
    };
  }, [course]); // Run after course loads

  // --- FETCH DYNAMIC COURSE DATA ---
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/cohorts/${slug}`, {
            credentials: 'include' // 🔴 ADDED just to be safe with strict CORS
        });
        if (!response.ok) throw new Error('Failed to fetch course data');
        const data = await response.json();

        // Handle different possible API response structures
        const fetchedCourse = data.CohortData || data.courseData || data;
        setCourse(fetchedCourse);
      } catch (err) {
        console.error("Error loading course:", err);
        setError("Could not load course details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchCourseData();

    // Scroll listener for sticky behaviors if needed
    const handleScrollNav = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScrollNav);
    return () => window.removeEventListener('scroll', handleScrollNav);
  }, [slug]);

  // --- CHECK ACCESS LEVEL ---
  const getAccessLevel = () => {
    if (!user || !course) return null;
    
    // Admin bypass
    if (user.role === 'admin') return 'live';

    const allEnrollments = [
      ...(user.enrolledCourses || []),
      ...(user.enrolledCohorts || [])
    ];

    const enrollment = allEnrollments.find(e => {
      if (!e || !e.item) return false;
      const itemId = typeof e.item === 'string' ? e.item : e.item._id;
      return itemId === course._id;
    });

    if (!enrollment) return null;
    return enrollment.planType || 'recorded';
  };

  const accessLevel = getAccessLevel();

  // --- REFERRAL & SHARE LOGIC ---
  // 1. Capture 'refer' from URL and save to localStorage
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const referId = searchParams.get('refer');
    if (referId) {
      localStorage.setItem('refer', referId);
    }
  }, []);

  // 2. Handle sharing via Native Mobile Share or Clipboard copy
  const handleShare = async () => {
    const baseUrl = window.location.origin + window.location.pathname;
    // Attach user ID if they are logged in, otherwise just share the plain link
    const shareUrl = user?._id ? `${baseUrl}?refer=${user._id}` : baseUrl;

    if (navigator.share) {
      try {
        await navigator.share({
          title: course?.title || 'Check out this course!',
          text: 'I found this awesome course on UPSKALE. Check it out!',
          url: shareUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback for desktop browsers
      navigator.clipboard.writeText(shareUrl);
      alert('Referral link copied to clipboard!');
    }
  };

  // --- HANDLE BUY / ADD TO CART ---
  const handlePurchase = (planType) => {
    if (!course) return;

    const price = planType === 'live' ? course.pricing?.live?.discount : course.pricing?.recorded?.discount;
    const originalPrice = planType === 'live' ? course.pricing?.live?.original : course.pricing?.recorded?.original;

    const cartItem = {
      id: course._id,
      title: course.title,
      plan: planType === 'live' ? 'Live + AI Cohort' : 'Self-Paced',
      planType: planType,
      price: price,
      originalPrice: originalPrice,
      image: course.thumbnail,
      itemModel: 'Cohort',
      features: planType === 'live'
        ? ["Live Mentorship", "Verified Certificate", "Job Assistance"]
        : ["Recorded Content", "Lifetime Access"]
    };

    addToCart(cartItem);
    navigate('/cart');
  };

  const scrollToPricing = () => {
    document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- FALLBACK REVIEWS ---
  const defaultTestimonials = [
    { studentName: "Puja Das", role: "Data Analyst @ Infosys", image: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png", comment: "The dashboard tracking kept me motivated. Bite-sized lessons made it easy to learn daily." },
    { studentName: "Amit Patel", role: "DevOps Engineer @ Wipro", image: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png", comment: "Real projects and GitHub reviews made it feel like a real job, not just a course." },
    { studentName: "Sneha Roy", role: "Designer @ Accenture", image: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png", comment: "I built my entire portfolio here. The design critiques were brutally honest and helpful." },
  ];

  const displayReviews = course?.reviews?.length > 0 ? course.reviews : defaultTestimonials;

// --- DYNAMIC BACKGROUND LOGIC ---
  const courseTitle = course?.title?.toLowerCase() || '';
  const isExcelCourse = courseTitle.includes('ms excel');
  const isPowerBiCourse = courseTitle.includes('power bi');

  // Comprehensive theme mapping (Deep Purple -> Emerald/Dark Green -> Vibrant Amber)
  const mainBgColor = isExcelCourse ? 'bg-[#064e3b]' : isPowerBiCourse ? 'bg-[#451a03]' : 'bg-[#1e103c]';
  const altBgColor = isExcelCourse ? 'bg-[#022c22]' : isPowerBiCourse ? 'bg-[#290f02]' : 'bg-[#150a2b]';
  
  const selectionBgColor = isExcelCourse ? 'selection:bg-[#10b981]' : isPowerBiCourse ? 'selection:bg-[#f59e0b]' : 'selection:bg-[#6c38ff]';
  const primaryBgColor = isExcelCourse ? 'bg-[#10b981]' : isPowerBiCourse ? 'bg-[#f59e0b]' : 'bg-[#6c38ff]';
  const primaryHoverColor = isExcelCourse ? 'hover:bg-[#059669]' : isPowerBiCourse ? 'hover:bg-[#d97706]' : 'hover:bg-[#5b2ce0]';
  
  const primaryBgLowColor = isExcelCourse ? 'bg-[#10b981]/10' : isPowerBiCourse ? 'bg-[#f59e0b]/10' : 'bg-[#6c38ff]/10';
  const primaryBgLowerColor = isExcelCourse ? 'bg-[#10b981]/20' : isPowerBiCourse ? 'bg-[#f59e0b]/20' : 'bg-[#6c38ff]/20';

  const cardBgColor = isExcelCourse ? 'bg-[#065f46]' : isPowerBiCourse ? 'bg-[#78350f]' : 'bg-[#2a1b54]';
  const cardBgOpaqueColor = isExcelCourse ? 'bg-[#065f46]/60' : isPowerBiCourse ? 'bg-[#78350f]/60' : 'bg-[#2a1b54]/60';
  const certCardBgColor = isExcelCourse ? 'bg-[#065f46]' : isPowerBiCourse ? 'bg-[#78350f]' : 'bg-[#2d1b54]';
  const cardBgLightColor = isExcelCourse ? 'bg-[#047857]' : isPowerBiCourse ? 'bg-[#92400e]' : 'bg-[#5629cc]';
  const tableHoverColor = isExcelCourse ? 'hover:bg-[#ecfdf5]' : isPowerBiCourse ? 'hover:bg-[#fffbeb]' : 'hover:bg-[#f3f0ff]';

  const gradientFromColor = isExcelCourse ? 'from-[#064e3b]' : isPowerBiCourse ? 'from-[#451a03]' : 'from-[#1e103c]';
  const cardGradientStart = isExcelCourse ? 'from-[#065f46]' : isPowerBiCourse ? 'from-[#78350f]' : 'from-[#2a1b54]';
  
  const glowGradientFrom = isExcelCourse ? 'from-[#10b981]' : isPowerBiCourse ? 'from-[#f59e0b]' : 'from-[#6c38ff]';
  const glowGradientTo = isExcelCourse ? 'to-[#34d399]' : isPowerBiCourse ? 'to-[#fcd34d]' : 'to-[#9d7aff]';
  const textGradientFrom = isExcelCourse ? 'from-[#10b981]' : isPowerBiCourse ? 'from-[#f59e0b]' : 'from-[#6c38ff]';
  const textGradientTo = isExcelCourse ? 'to-[#a7f3d0]' : isPowerBiCourse ? 'to-[#fde68a]' : 'to-[#c4b5fd]';

  const userBadgeGradientFrom = isExcelCourse ? 'from-[#a7f3d0]/10' : isPowerBiCourse ? 'from-[#fde68a]/10' : 'from-[#c4b5fd]/10';
  const userBadgeBorder = isExcelCourse ? 'border-[#a7f3d0]/20' : isPowerBiCourse ? 'border-[#fde68a]/20' : 'border-[#c4b5fd]/20';

  const mutedTextColor = isExcelCourse ? 'text-[#a7f3d0]' : isPowerBiCourse ? 'text-[#fde68a]' : 'text-[#c4b5fd]';
  const mutedTextOpaque = isExcelCourse ? 'text-[#a7f3d0]/80' : isPowerBiCourse ? 'text-[#fde68a]/80' : 'text-[#c4b5fd]/80';
  const primaryTextColor = isExcelCourse ? 'text-[#10b981]' : isPowerBiCourse ? 'text-[#f59e0b]' : 'text-[#6c38ff]';
  const primaryTextOpaque = isExcelCourse ? 'text-[#10b981]/20' : isPowerBiCourse ? 'text-[#f59e0b]/20' : 'text-[#6c38ff]/20';
  const darkTextColor = isExcelCourse ? 'text-[#064e3b]' : isPowerBiCourse ? 'text-[#451a03]' : 'text-[#1e103c]';

  const primaryBorderColor = isExcelCourse ? 'border-[#10b981]' : isPowerBiCourse ? 'border-[#f59e0b]' : 'border-[#6c38ff]';
  const primaryBorderSemiColor = isExcelCourse ? 'hover:border-[#10b981]/50' : isPowerBiCourse ? 'hover:border-[#f59e0b]/50' : 'hover:border-[#6c38ff]/50';
  const primaryBorderLowColor = isExcelCourse ? 'border-[#10b981]/30' : isPowerBiCourse ? 'border-[#f59e0b]/30' : 'border-[#6c38ff]/30';
  const primaryBorderLowestColor = isExcelCourse ? 'border-[#10b981]/20' : isPowerBiCourse ? 'border-[#f59e0b]/20' : 'border-[#6c38ff]/20';

  const primaryShadowColor = isExcelCourse ? 'shadow-[#10b981]/30' : isPowerBiCourse ? 'shadow-[#f59e0b]/30' : 'shadow-[#6c38ff]/30';
  const focusShadowColor = isExcelCourse ? 'shadow-[0_0_20px_rgba(16,185,129,0.2)]' : isPowerBiCourse ? 'shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'shadow-[0_0_20px_rgba(108,56,255,0.2)]';
  const domainImageFade = isExcelCourse ? 'via-[#064e3b]/40' : isPowerBiCourse ? 'via-[#451a03]/40' : 'via-[#1e103c]/40';
  // --- ERROR STATE ---
  if (error) {
    return (
      <div className={`min-h-screen ${mainBgColor} flex flex-col items-center justify-center text-white`}>
        <p className="text-xl font-bold mb-4">{error}</p>
        <button onClick={() => navigate(-1)} className={`px-6 py-2 ${primaryBgColor} rounded-lg font-bold`}>Go Back</button>
      </div>
    );
  }

  // --- HELPER FUNCTION: Format Date ---
  const formatLiveDate = (isoString) => {
    if (!isoString) return "TBA"; // Fallback if no date is set
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // Returns "May 15"
  };

  // --- ERROR STATE ---
  if (error) {
    return (
      <div className={`min-h-screen ${mainBgColor} flex flex-col items-center justify-center text-white`}>
        <p className="text-xl font-bold mb-4">{error}</p>
        <button onClick={() => navigate(-1)} className={`px-6 py-2 ${primaryBgColor} rounded-lg font-bold`}>Go Back</button>
      </div>
    );
  }

// --- 🔴 ORBITAL TECH LOADER ---
  if (loading || !course) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#050505] overflow-hidden">
        
        {/* Subtle Tech Grid Background */}
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        <div className="relative flex flex-col items-center justify-center">
          
          {/* Outer Fast Spinning Ring */}
          <div className="absolute w-36 h-36 md:w-52 md:h-52 rounded-full border-[1.5px] border-t-[#008a45] border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          
          {/* Inner Slow Reverse Spinning Ring */}
          <div className="absolute w-28 h-28 md:w-40 md:h-40 rounded-full border-[1.5px] border-b-[#008a45]/60 border-t-transparent border-r-transparent border-l-transparent animate-[spin_1.5s_linear_reverse_infinite]"></div>

          {/* Core Green Ambient Glow */}
          <div className="absolute w-20 h-20 bg-[#008a45]/20 blur-3xl rounded-full animate-pulse"></div>

          {/* Centered Logo */}
          <img 
            src="https://res.cloudinary.com/villain/image/upload/v1770662332/20250730_170553_0000_xyfhoc.png" 
            alt="UPSKALE" 
            className="h-10 md:h-14 w-auto object-contain relative z-10 drop-shadow-[0_0_15px_rgba(0,138,69,0.3)]"
          />
        </div>

        {/* Data Fetching Text & Bouncing Dots */}
        <div className="mt-16 flex flex-col items-center gap-3 relative z-10">
          <div className="flex gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#008a45] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
            <span className="w-1.5 h-1.5 bg-[#008a45] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
            <span className="w-1.5 h-1.5 bg-[#008a45] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
          </div>
          <span className="text-[#008a45] text-[10px] md:text-xs font-mono tracking-[0.3em] uppercase opacity-80">
            Fetching Course Data
          </span>
        </div>
        
      </div>
    );
  }



  return (
    <div className={`min-h-screen ${mainBgColor} font-sans text-gray-100 ${selectionBgColor} selection:text-white overflow-x-hidden transition-colors duration-500`}>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-0 pb-16 px-6 max-w-7xl mx-auto z-10 ">
        {/* INLINE NAVBAR (Shares the hero background seamlessly) */}
        <nav className=" py-6 flex items-center justify-between mb-8">
          {/* Brand/Logo */}
          <div 
          onClick={() => navigate('/')}
          className="flex-shrink-0 flex items-center cursor-pointer group">
                      <img
                        src="https://res.cloudinary.com/dvcs9x8yp/image/upload/v1775412223/20250730_170449_0000_uq4d24.png"
                        alt="UPSKALE Logo"
                        className="h-8 md:h-12 w-auto object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-[0_0_15px_rgba(0,138,69,0.3)]"
                      />
                    </div>

          {/* Center Links (Hidden on Mobile) */}
          <div className={`hidden md:flex items-center gap-8 font-medium text-sm ${mutedTextColor}`}>
            <button onClick={() => document.getElementById('curriculum')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">Curriculum</button>
            <button onClick={() => document.getElementById('instructors')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">Instructors</button>
            <button onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">Reviews</button>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-4 mr-10 md:mr-6">
            {user ? (
              <button
                onClick={() => navigate('/profile')}
                className="text-sm font-bold bg-white/5 border border-white/10 hover:bg-white/10 text-white px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => openLoginModal()}
                className="text-sm font-bold bg-white/5 border border-white/10 hover:bg-white/10 text-white px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Log In
              </button>

            )}
          </div>
        </nav>
        <div className="grid md:grid-cols-12 gap-12 items-center">

          {/* Left Content */}
          <div className="md:col-span-7 space-y-8 pr-0 md:pr-4">

            {/* Category Tag */}
            {/* Top Bar: Category Tag & Share Button */}
            <div className="flex items-center gap-4">
              <div className={`inline-block px-4 py-1.5 bg-white/5 border border-white/10 ${mutedTextColor} text-xs font-bold uppercase tracking-widest rounded-md shadow-sm`}>
                {course?.category || "Premium Placement Course"}
              </div>

              {/* Always show the button, but change the text dynamically */}
              <button
                onClick={handleShare}
                className={`flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-widest rounded-md shadow-sm transition-colors`}
              >
                <Share2 size={14} /> {user ? "Share & Earn" : "Share"}
              </button>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.15] tracking-tight text-white">
              {loading ? "Loading..." : course?.title}
            </h1>

            {/* Description */}
            <p className={`${mutedTextColor} text-lg md:text-xl max-w-xl leading-relaxed`}>
              {course?.description || "Master industry-relevant skills, build real-world projects, and accelerate your career with our dedicated placement support."}
            </p>

            {/* --- NEW: 4-Pillar Info Bar (Based on Reference Image) --- */}
            <div className={`${cardBgOpaqueColor} border border-white/10 rounded-xl p-5 hidden sm:grid grid-cols-4 divide-x divide-white/10 shadow-lg backdrop-blur-sm`}>
              <div className="flex flex-col items-center justify-center text-center px-2">
                <span className="text-white font-bold text-base md:text-lg">Hybrid</span>
                <span className={`${mutedTextColor} text-[10px] md:text-xs mt-1 leading-tight`}>Live & Recorded</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center px-2">
                <span className="text-white font-bold text-base md:text-lg">Projects</span>
                <span className={`${mutedTextColor} text-[10px] md:text-xs mt-1 leading-tight`}>Hands-on Building</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center px-2">
                <span className="text-white font-bold text-base md:text-lg">Mentorship</span>
                <span className={`${mutedTextColor} text-[10px] md:text-xs mt-1 leading-tight`}>1:1 Expert Guidance</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center px-2">
                <span className="text-white font-bold text-base md:text-lg">Placement</span>
                <span className={`${mutedTextColor} text-[10px] md:text-xs mt-1 leading-tight`}>Lifetime Support</span>
              </div>
            </div>

            {/* Ratings & Social Proof */}
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#f8e7a2]/10 to-transparent border border-[#f8e7a2]/20">
                <Star className="text-[#f8e7a2]" size={18} fill="currentColor" />
                <span className="font-semibold text-white text-sm">4.8/5 Avg. Rating</span>
              </div>
              <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg bg-gradient-to-r ${userBadgeGradientFrom} to-transparent border ${userBadgeBorder}`}>
                <Users className={`${mutedTextColor}`} size={18} />
                <span className="font-semibold text-white text-sm">Live Expert Mentorship</span>
              </div>
            </div>

          </div>

          {/* Right Card (Pricing / Enrollment Info) */}
          <div className="md:col-span-5  md:block">
            <div className="bg-white rounded-xl shadow-2xl text-black relative overflow-hidden flex flex-col w-full max-w-[360px] ml-auto">

              {/* Top Section (White) */}
              <div className="p-6 space-y-5">
                <div>
                  <p className="text-gray-600 text-xs font-medium mb-1">Cohort starts on</p>
<h3 className="text-xl font-bold text-black tracking-tight">
  {formatLiveDate(course?.liveStartDate)}
</h3>
                </div>
                <div>
                  <p className="text-gray-600 text-xs font-medium mb-1">Placement Support</p>
                  <h3 className="text-xl font-bold text-black tracking-tight">1 year</h3>
                </div>
              </div>

              {/* Bottom Section (Light Lavender/Gray) */}
              <div className="bg-[#f4f2f8] p-6 space-y-3 mt-auto">
                {loading ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className={`animate-spin ${primaryTextColor}`} />
                  </div>
                ) : (
                  <>
                    {/* 🔴 NEW: Primary Call to Action */}
                    {accessLevel ? (
                      <button
                        onClick={() => navigate(`/learn/${course._id}`)}
                        className={`w-full ${mainBgColor} text-white py-3.5 rounded-lg font-bold text-sm hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg`}
                      >
                        <MonitorPlay size={18} />
                        Access Course
                      </button>
                    ) : (
                      <button
                        onClick={scrollToPricing}
                        className={`w-full ${primaryBgColor} text-white py-3.5 rounded-lg font-bold text-sm ${primaryHoverColor} transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95`}
                      >
                        <Lock size={16} />
                        Enroll Now
                      </button>
                    )}

                    {/* Secondary Buttons */}
                    <button className="w-full flex items-center justify-between bg-[#efd697] border border-black text-black py-3 px-5 rounded-lg font-bold text-sm hover:bg-[#e4cb8c] transition-colors mt-2">
                      <span>Request a callback</span>
                      <Phone size={16} className="text-black" strokeWidth={2} />
                    </button>

                    <button className="w-full flex items-center justify-between bg-white border border-black text-black py-3 px-5 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors">
                      <span>Download Brochure</span>
                      <Download size={16} className="text-black" strokeWidth={2} />
                    </button>
                  </>
                )}
              </div>



            </div>
          </div>

        </div>
      </section>

      {/* --- SUCCESSFUL TRANSITIONS (Infinite Marquee) --- */}
      <section className={`py-20 ${mainBgColor} relative overflow-hidden`}>
        <style>
          {`
            @keyframes infinite-scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-infinite-scroll {
              animation: infinite-scroll 25s linear infinite;
              width: max-content;
            }
            .animate-infinite-scroll:hover {
              animation-play-state: paused;
            }
          `}
        </style>

        <div className="text-center mb-16 px-6">
          <h2 className="text-3xl md:text-5xl font-black text-white">
            100+ successful transitions
          </h2>
        </div>

        <div className="relative w-full mx-auto">
          <div className={`absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r ${gradientFromColor} to-transparent z-10 pointer-events-none`}></div>
          <div className={`absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l ${gradientFromColor} to-transparent z-10 pointer-events-none`}></div>

          <div className="flex animate-infinite-scroll pb-4">
            {[
              { name: "Amit Patel", img: "https://res.cloudinary.com/dvcs9x8yp/image/upload/v1770750327/Copilot_20260211_003509_xillrk.png", year: "2023" },
              { name: "Sneha Roy", img: "https://res.cloudinary.com/dvcs9x8yp/image/upload/v1770750326/Copilot_20260211_003303_k1ejvj.png", year: "2022" },
              { name: "Puja Das", img: "https://res.cloudinary.com/dvcs9x8yp/image/upload/v1770750326/Copilot_20260211_003423_l950ue.png", year: "2023" },
              { name: "Shishir Siddharth", img: "https://res.cloudinary.com/dvcs9x8yp/image/upload/v1773742488/Copilot_20260317_154420_kzcdmp.png", year: "2024" },
              { name: "Vanshu Saini", img: "https://res.cloudinary.com/dhm18d3so/image/upload/v1773741214/man-empty-avatar-photo-placeholder-for-social-networks-resumes-forums-and-dating-sites-male-and-female-no-photo-images-for-unfilled-user-profile-free-vector_qsnqyy.webp", year: "2021" },
              { name: "Miyanji Farhan", img: "https://res.cloudinary.com/dvcs9x8yp/image/upload/v1773742717/Copilot_20260317_154824_gif6qr.png", year: "2022" },
              // DUPLICATES
              { name: "Amit Patel", img: "https://res.cloudinary.com/dvcs9x8yp/image/upload/v1770750327/Copilot_20260211_003509_xillrk.png", year: "2023" },
              { name: "Sneha Roy", img: "https://res.cloudinary.com/dvcs9x8yp/image/upload/v1770750326/Copilot_20260211_003303_k1ejvj.png", year: "2022" },
              { name: "Puja Das", img: "https://res.cloudinary.com/dvcs9x8yp/image/upload/v1770750326/Copilot_20260211_003423_l950ue.png", year: "2023" },
              { name: "Shishir Siddharth", img: "https://res.cloudinary.com/dvcs9x8yp/image/upload/v1773742488/Copilot_20260317_154420_kzcdmp.png", year: "2024" },
              { name: "Vanshu Saini", img: "https://res.cloudinary.com/dhm18d3so/image/upload/v1773741214/man-empty-avatar-photo-placeholder-for-social-networks-resumes-forums-and-dating-sites-male-and-female-no-photo-images-for-unfilled-user-profile-free-vector_qsnqyy.webp", year: "2021" },
              { name: "Miyanji Farhan", img: "https://res.cloudinary.com/dvcs9x8yp/image/upload/v1773742717/Copilot_20260317_154824_gif6qr.png", year: "2022" },
            ].map((student, idx) => (

              <div
                key={idx}
                className="bg-white rounded-2xl w-[220px] h-[260px] flex flex-col items-center p-6 mx-4 shrink-0 shadow-lg cursor-pointer transform transition-transform hover:-translate-y-2"
              >
                {/* Profile Image - stays at top */}
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm mt-2">
                  <img src={student.img} alt={student.name} className="w-full h-full object-cover" />
                </div>

                {/* Text Group - This brings them closer */}
                <div className="mt-4 flex flex-col items-center gap-2">
                  <h3 className={`font-bold ${darkTextColor} text-lg text-center tracking-tight`}>
                    {student.name}
                  </h3>

                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-50/50 border border-blue-100 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="text-[11px] font-bold text-blue-700 uppercase tracking-widest">
                      Class of {student.year}
                    </span>
                  </div>
                </div>
              </div>

            ))}
          </div>
        </div>
      </section>

      {/* --- CAREER OUTCOMES / STATS STRIP --- */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`bg-gradient-to-br ${cardGradientStart} to-transparent border border-white/10 p-8 rounded-2xl text-center`}>
            <h3 className="text-5xl font-black text-white mb-2">88%</h3>
            <p className={`${mutedTextColor} font-bold uppercase tracking-widest text-sm`}>Average Salary Hike</p>
          </div>
          <div className={`bg-gradient-to-br ${cardGradientStart} to-transparent border border-white/10 p-8 rounded-2xl text-center`}>
            <h3 className="text-5xl font-black text-white mb-2">1000+</h3>
            <p className={`${mutedTextColor} font-bold uppercase tracking-widest text-sm`}>Hiring Partners</p>
          </div>
          <div className={`bg-gradient-to-br ${cardGradientStart} to-transparent border border-white/10 p-8 rounded-2xl text-center`}>
            <h3 className="text-5xl font-black text-white mb-2">1:1</h3>
            <p className={`${mutedTextColor} font-bold uppercase tracking-widest text-sm`}>Dedicated Mentorship</p>
          </div>
        </div>
      </section>

      {/* --- CORE DOMAINS / TOPICS YOU LEARN --- */}
      {course?.whatulearn && course.whatulearn.length > 0 && (
        <section className={`py-24 ${altBgColor} border-t border-white/5 relative overflow-hidden`}>

          {/* Subtle Background Glow for depth */}
          <div className={`absolute top-0 right-0 w-[600px] h-[600px] ${primaryBgLowColor} rounded-full blur-[150px] pointer-events-none`}></div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">

            <div className="text-center mb-12 md:mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f8e7a2]/10 border border-[#f8e7a2]/20 text-[#f8e7a2] text-xs font-bold uppercase tracking-widest mb-4">
                <Zap size={14} fill="currentColor" /> Course Focus
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
                Core Domains You Will <span className={`text-transparent bg-clip-text bg-gradient-to-r ${textGradientFrom} ${textGradientTo}`}>Master</span>
              </h2>
              <p className={`${mutedTextColor} text-lg max-w-2xl mx-auto leading-relaxed`}>
                Dive deep into these specialized fields. Gain hands-on experience and build a portfolio that proves your expertise to top recruiters.
              </p>
            </div>

            <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto pb-12 pt-4 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {course.whatulearn.map((item, idx) => (
                <div
                  key={idx}
                  className={`group ${mainBgColor} rounded-3xl overflow-hidden border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] ${primaryBorderSemiColor} transition-all duration-500 hover:-translate-y-2 flex flex-col shrink-0 w-[85vw] sm:w-[350px] md:w-auto snap-center relative`}
                >
                  {/* LARGE IMAGE AREA */}
                  <div className="relative w-full h-56 md:h-64 overflow-hidden bg-[#0a0514]">
                    <div className={`absolute inset-0 bg-gradient-to-t ${gradientFromColor} ${domainImageFade} to-transparent z-10 opacity-90 group-hover:opacity-50 transition-opacity duration-500`}></div>

                    {item.imageurl ? (
                      <img
                        src={item.imageurl}
                        alt={item.text}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${primaryTextOpaque}`}>
                        <Layout size={64} />
                      </div>
                    )}
                  </div>

                  {/* TEXT CONTENT */}
                  <div className="p-8 relative z-20 flex-1 flex flex-col -mt-8">
                    <div className={`w-12 h-12 ${cardBgColor} border ${primaryBorderLowColor} rounded-xl flex items-center justify-center font-black text-[#f8e7a2] shadow-xl mb-6 transform group-hover:rotate-12 transition-transform duration-300`}>
                      {String(idx + 1).padStart(2, '0')}
                    </div>

                    <h4 className="text-2xl font-bold text-white leading-snug mb-4">
                      {item.text}
                    </h4>

                    <p className={`${mutedTextOpaque} text-sm leading-relaxed mt-auto border-t border-white/10 pt-5`}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center -mt-6 md:hidden">
              <div className="flex items-center gap-2 text-gray-500 text-sm animate-pulse">
                <ArrowRight size={16} /> Swipe to explore
              </div>
            </div>

          </div>
        </section>
      )}

      {/* --- DYNAMIC SYLLABUS --- */}
      {course?.course && course.course.length > 0 && (
        <section id="curriculum" className="py-20 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Tools You Will Learn</h2>
            <p className={`${mutedTextColor} text-lg`}>A structured, week-by-week breakdown of your learning journey.</p>
          </div>

          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {course.course.map((mod, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl overflow-hidden flex flex-col min-w-[85vw] sm:min-w-[350px] md:min-w-0 snap-center shrink-0 shadow-lg"
              >
                <div className="p-6 md:p-8 flex-1">
                  <p className="text-gray-500 text-sm mb-2 font-medium">Week {idx}</p>
                  <h3 className={`text-xl md:text-2xl font-bold ${darkTextColor} mb-5 leading-tight`}>
                    {mod.Title}
                  </h3>

                  <ul className="space-y-3">
                    {mod.topic && mod.topic.map((item, i) => (
                      <li key={i} className="text-sm font-medium text-gray-600 flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0"></span>
                        <span className="leading-relaxed">{item.replace(/"/g, '')}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#f8f9fa] border-t border-gray-100 p-6 md:p-8 mt-auto">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">
                    Module Outcome
                  </p>
                  <p className={`text-sm ${darkTextColor} font-semibold`}>
                    Master essential skills for week {idx}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-4 md:hidden">
            <div className="flex items-center gap-2 text-gray-400 text-sm animate-pulse">
              <ArrowRight size={16} /> Swipe to see more
            </div>
          </div>
        </section>
      )}

      {/* --- REVIEWS / TESTIMONIALS --- */}
      <section id="reviews" className={`py-20 ${altBgColor} border-y border-white/10 px-6`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Student Success Stories</h2>
            <p className={`${mutedTextColor} text-lg`}>Join thousands of learners who have transformed their careers.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {displayReviews.map((review, i) => (
              <div key={i} className="bg-white rounded-xl p-8 shadow-xl flex flex-col justify-between border-t-4 border-[#f8e7a2]">
                <div>
                  <div className="flex text-[#facc15] gap-1 mb-6">
                    {Array.from({ length: review.rating || 5 }).map((_, idx) => (
                      <Star key={idx} size={18} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-gray-700 font-medium italic mb-8">"{review.comment}"</p>
                </div>
                <div className="flex items-center gap-4 border-t border-gray-100 pt-4">
                  <img src={review.image} alt="user" className="w-12 h-12 rounded-full object-cover bg-gray-200" />
                  <div>
                    <h4 className={`font-black ${darkTextColor}`}>{review.studentName}</h4>
                    <p className="text-xs text-gray-500 font-bold uppercase">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- LIVE CLASS SCHEDULE --- */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-white">Live Class Schedule</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Saturday */}
          <div className="rounded-xl overflow-hidden shadow-2xl hover:-translate-y-2 transition-transform duration-300 border border-black/20">
            <div className={`${primaryBgColor} p-6 md:p-8`}>
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mb-6 shadow-sm">
                <Calendar className={`${darkTextColor}`} size={20} />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Every Saturday
              </h3>
            </div>
            <div className={`${cardBgLightColor} p-6 md:p-8 h-full`}>
              <h4 className="text-lg font-bold text-white mb-2">Weekend Masterclass</h4>
              <p className={`${mutedTextColor} text-sm leading-relaxed`}>
                <span className="text-white font-semibold">05:00 PM - 07:00 PM IST</span><br />
                Deep dive into core concepts with interactive live coding sessions.
              </p>
            </div>
          </div>

          {/* Card 2: Sunday */}
          <div className="rounded-xl overflow-hidden shadow-2xl hover:-translate-y-2 transition-transform duration-300 border border-black/20">
            <div className={`${primaryBgColor} p-6 md:p-8`}>
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mb-6 shadow-sm">
                <Calendar className={`${darkTextColor}`} size={20} />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Every Sunday
              </h3>
            </div>
            <div className={`${cardBgLightColor} p-6 md:p-8 h-full`}>
              <h4 className="text-lg font-bold text-white mb-2">Project & Doubt Lab</h4>
              <p className={`${mutedTextColor} text-sm leading-relaxed`}>
                <span className="text-white font-semibold">05:00 PM - 07:00 PM IST</span><br />
                Real-world case studies followed by dedicated doubt clearing hours.
              </p>
            </div>
          </div>

          {/* Card 3: Daily */}
          <div className="rounded-xl overflow-hidden shadow-2xl hover:-translate-y-2 transition-transform duration-300 border border-black/20">
            <div className={`${primaryBgColor} p-6 md:p-8`}>
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mb-6 shadow-sm">
                <Calendar className={`${darkTextColor}`} size={20} />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                365 Days Learning
              </h3>
            </div>
            <div className={`${cardBgLightColor} p-6 md:p-8 h-full`}>
              <h4 className="text-lg font-bold text-white mb-2">Self-Paced Practice</h4>
              <p className={`${mutedTextColor} text-sm leading-relaxed`}>
                Access recorded sessions, daily challenges, and community support 24/7.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- INSTRUCTORS SECTION --- */}
      <section id="instructors" className={`py-20 ${mainBgColor} px-6 overflow-hidden`}>
        <div className="max-w-7xl mx-auto relative">

          <h2 className="text-3xl md:text-5xl font-black text-white text-center mb-16">
            Learn Concepts From Our Instructors
          </h2>

          <div
            id="instructor-slider"
            className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {[
              { name: "Sandipan Das", role: "Economic Professor", image: "https://res.cloudinary.com/dhm18d3so/image/upload/v1773741214/man-empty-avatar-photo-placeholder-for-social-networks-resumes-forums-and-dating-sites-male-and-female-no-photo-images-for-unfilled-user-profile-free-vector_qsnqyy.webp", subjects: ["Economics", "Data Science"] },
              { name: "Debraj Sarkar", role: "Senior Consultant", image: "https://res.cloudinary.com/dhm18d3so/image/upload/v1773741214/man-empty-avatar-photo-placeholder-for-social-networks-resumes-forums-and-dating-sites-male-and-female-no-photo-images-for-unfilled-user-profile-free-vector_qsnqyy.webp", subjects: ["Business", "Analytics"] },
              { name: "Soumyadeep Datta", role: "AI Specialist", image: "/soumyadeep-avatar.jpg", subjects: ["Machine Learning", "AI"] },
            ].map((instructor, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-8 flex flex-col items-center min-w-[280px] md:min-w-[300px] snap-center relative shadow-lg shrink-0 transform transition-all hover:shadow-2xl"
              >
                {/* Social Link */}
                <a href="#" className="absolute top-6 right-6 text-[#0077b5] hover:scale-110 transition-transform">
                  <Linkedin size={22} strokeWidth={1.5} fill="currentColor" />
                </a>

                {/* Profile Image */}
                <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-gray-50 shadow-sm">
                  <img
                    src={instructor.image}
                    alt={instructor.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Instructor Details */}
                <h3 className={`text-xl font-bold ${darkTextColor} mb-1 text-center tracking-tight`}>
                  {instructor.name}
                </h3>
                <p className="text-sm text-gray-500 text-center mb-6 h-10 line-clamp-2">
                  {instructor.role}
                </p>

                {/* Teaching Subjects Section */}
                <div className="mt-auto w-full pt-5 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-3 text-center tracking-[0.15em]">
                    Expertise
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {instructor.subjects.map((sub, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md border border-blue-100 uppercase"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-4 pr-2">
            <button
              onClick={() => document.getElementById('instructor-slider').scrollBy({ left: -320, behavior: 'smooth' })}
              className={`w-10 h-10 bg-white rounded-lg flex items-center justify-center ${darkTextColor} shadow hover:bg-gray-100 transition-colors`}
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => document.getElementById('instructor-slider').scrollBy({ left: 320, behavior: 'smooth' })}
              className={`w-10 h-10 bg-white rounded-lg flex items-center justify-center ${darkTextColor} shadow hover:bg-gray-100 transition-colors`}
            >
              <ChevronRight size={24} />
            </button>
          </div>

        </div>
      </section>

{/* --- CERTIFICATE SECTION --- */}
      <section className={`py-24 ${mainBgColor} px-6 border-y border-white/5 relative overflow-hidden`}>
        <div className={`absolute top-1/2 left-0 w-[500px] h-[500px] ${primaryBgLowColor} blur-[150px] rounded-full pointer-events-none -translate-y-1/2`}></div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
          <div className="lg:col-span-5 order-2 lg:order-1 flex justify-center lg:justify-end perspective-1000 relative">
            <div className={`absolute inset-0 bg-gradient-to-r ${glowGradientFrom} ${glowGradientTo} rounded-xl blur-xl opacity-20 transition duration-700 mx-auto max-w-[380px]`}></div>

            {/* FIX 1: aspect-auto on mobile, aspect-[3/4] on desktop */}
            <div className={`relative w-full max-w-[380px] aspect-auto md:aspect-[3/4] ${certCardBgColor} rounded-xl shadow-2xl overflow-hidden border border-white/10 shrink-0 transform transition-transform duration-500 hover:rotate-y-2 hover:-rotate-x-2 flex flex-col`}>
              <div className="absolute top-0 right-0 w-[90%] h-[90%] border-[40px] border-white/5 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-[70%] h-[70%] border-[30px] border-white/5 rounded-full -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

              {/* FIX 2: Adjusted padding for mobile (p-6) and spacing */}
              <div className="relative z-10 flex flex-col h-full p-6 md:p-10">
                <div className="text-white font-bold tracking-widest text-sm mb-6 md:mb-4 opacity-90">
                  <img
                        src="https://res.cloudinary.com/dvcs9x8yp/image/upload/v1775412223/20250730_170449_0000_uq4d24.png"
                        alt="UPSKALE Logo"
                        className="h-6 w-auto object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-[0_0_15px_rgba(0,138,69,0.3)]"
                      />
                </div>
                <h3 className="text-3xl md:text-4xl font-semibold text-white leading-[1.1] mb-4 md:mb-6 tracking-tight">
                  Certificate of<br />Completion
                </h3>
                <p className={`${mutedTextColor} text-xs leading-relaxed mb-6 md:mb-8 opacity-90 pr-4`}>
                  Congratulations on taking your next leap towards accelerating your career growth.<br />Keep learning, keep growing!
                </p>
                <div className="flex-1">
                  <p className={`${mutedTextColor} text-[10px] md:text-xs mb-1.5 opacity-80`}>This certificate is proudly awarded to</p>
                  <h4 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6 tracking-tight">Aarav Sharma</h4>
                  <p className={`${mutedTextColor} text-[10px] md:text-xs mb-1.5 opacity-80`}>for successfully completing</p>
                  <h5 className="text-lg md:text-xl font-medium text-white">{course?.title || "Data Analyst Fellowship"}</h5>
                </div>
                
                {/* FIX 3: Used mt-auto to ensure it pushes to the bottom cleanly */}
                <div className="flex justify-between items-end mt-6 md:mt-6 pt-6">
                  <div className="w-[35%]">
                    <div className="border-t-[1.5px] border-white/30 mb-2"></div>
                    <p className="text-white text-xs font-medium mb-0.5">12/08/2026</p>
                    <p className={`${mutedTextColor} text-[9px] opacity-80 uppercase tracking-widest`}>Date</p>
                  </div>
                  <div className="w-[45%] text-right relative">
                    <div className="absolute bottom-11 right-6 font-serif italic text-white/90 text-base -rotate-6">Debkanta</div>
                    <div className="border-t-[1.5px] border-white/30 mb-2"></div>
                    <p className="text-white text-[10px] md:text-xs font-medium mb-0.5 whitespace-nowrap">Debkanta Chakraborty</p>
                    <p className={`${mutedTextColor} text-[8px] md:text-[9px] opacity-80 leading-tight`}>Founder & CEO, Upskale</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight">
              Verifiable Certificate of <br /> Accomplishment
            </h2>
            <p className={`${mutedTextColor} text-lg leading-relaxed max-w-2xl`}>
              Upon completing the {course?.title || "Data Analyst Fellowship"} course, you'll receive a verifiable Certificate of Accomplishment that you can link to from your Résumé and LinkedIn profile.
            </p>
            <ul className="space-y-5 pt-6">
              <li className="flex items-center gap-4 text-white">
                <div className="w-10 h-10 rounded-full bg-[#0077b5]/20 flex items-center justify-center shrink-0">
                  <Linkedin size={18} className="text-[#0077b5]" fill="currentColor" />
                </div>
                <span className="font-bold text-lg">1-Click Add to LinkedIn Profile</span>
              </li>
              <li className="flex items-center gap-4 text-white">
                <div className="w-10 h-10 rounded-full bg-[#008a45]/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={20} className="text-[#008a45]" />
                </div>
                <span className="font-bold text-lg">ISO 9001:2015 Quality Assured</span>
              </li>
              <li className="flex items-center gap-4 text-white">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                  <Unlock size={18} className="text-blue-500" />
                </div>
                <span className="font-bold text-lg">Unique QR Code Verification ID</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* --- DYNAMIC SYLLABUS (Table Layout) --- */}
      {course?.course && course.course.length > 0 && (
        <section className="py-20 px-6 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Detailed Curriculum</h2>
            <p className={`${mutedTextColor} text-lg`}>Week-by-week breakdown of your learning journey.</p>
          </div>

          <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden border-2 ${primaryBorderLowestColor} overflow-x-auto`}>
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="bg-[#f8e7a2] border-b-2 border-yellow-300">
                <tr>
                  <th className={`p-5 text-sm font-black uppercase tracking-wider ${darkTextColor} w-1/3`}>Module / Week</th>
                  <th className={`p-5 text-sm font-black uppercase tracking-wider ${darkTextColor}`}>Topics Covered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {course.course.map((mod, idx) => (
                  <tr key={idx} className={`${tableHoverColor} transition-colors`}>
                    <td className="p-6 align-top border-r border-gray-100">
                      <div className={`inline-block px-2 py-1 ${mainBgColor} text-white text-xs font-bold rounded mb-2`}>
                        MODULE 0{idx + 1}
                      </div>
                      <h3 className={`font-black text-lg ${darkTextColor} leading-tight`}>{mod.Title}</h3>
                    </td>
                    <td className="p-6">
                      <ul className="space-y-3">
                        {mod.topic && mod.topic.map((item, i) => (
                          <li key={i} className="text-sm font-medium text-gray-700 flex items-start gap-3">
                            <CheckCircle2 size={16} className={`${primaryTextColor} mt-0.5 shrink-0`} />
                            <span>{item.replace(/"/g, '')}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* --- PRICING PLANS --- */}
      {/* --- PRICING PLANS --- */}
      <section id="pricing-section" ref={pricingSectionRef} className={`py-24 px-6 ${altBgColor} text-white border-y border-white/5 pb-32`}>
        <div className="max-w-3xl mx-auto">

          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-black mb-4 text-white">Unlock premium career support</h2>
            <p className={`${mutedTextColor} text-lg`}>Get complete access to live mentorship, placement support, and recorded modules.</p>
          </div>

          {loading ? (
            <div className="flex justify-center h-32 items-center"><Loader2 className={`animate-spin ${primaryTextColor}`} size={40} /></div>
          ) : (
            <div className={`${cardBgColor} border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden`}>

              {/* Decorative Background Glow */}
              <div className={`absolute top-0 right-0 w-64 h-64 ${primaryBgLowerColor} blur-[100px] rounded-full pointer-events-none`}></div>

              {/* Single Feature List */}
              <div className="space-y-4 mb-10 relative z-10">
                <div className={`flex justify-between items-center text-sm font-bold ${mutedTextColor} pb-4 border-b border-white/10`}>
                  <span className="flex-1 text-lg">Everything included in Live PRO</span>
                </div>

                {[
                  "HD Video Modules & Lifetime Access",
                  "Live Weekend Classes & Doubt Resolution",
                  "Dedicated Placement Support",
                  "Resume & Portfolio Review",
                  "Mock Interviews with Experts",
                  "Verifiable Standard Certificate"
                ].map((feature, idx) => (
                  <div key={idx} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors rounded-lg px-2 -mx-2">
                    <span className="flex-1 text-sm md:text-base text-gray-200">{feature}</span>
                    <span className="w-12 flex justify-end">
                      <CheckCircle2 size={20} className="text-[#00d26a]" />
                    </span>
                  </div>
                ))}
              </div>

              {/* Bottom Checkout Area */}
              <div className={`${mainBgColor} rounded-2xl p-6 md:p-8 border border-white/10 shadow-inner relative z-10 text-center`}>
                
                <div className={`inline-block bg-[#f8e7a2] ${darkTextColor} text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg mb-4`}>
                  All-Inclusive Access
                </div>
                
                <div className="flex justify-center items-end gap-3 mb-8">
                  <div className="text-5xl font-black text-white">₹{course?.pricing?.live?.discount || "2499"}</div>
                  {course?.pricing?.live?.original > 0 && (
                    <div className="text-xl text-white/40 line-through mb-1">₹{course.pricing.live.original}</div>
                  )}
                </div>

                {/* Final Checkout Button */}
                {accessLevel === 'live' ? (
                  <button onClick={() => navigate('/profile')} className={`w-full ${primaryBgColor} text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 ${primaryHoverColor} transition-colors text-lg shadow-lg`}>
                    <Unlock size={20} /> Go to Dashboard
                  </button>
                ) : (
                  <button 
                    onClick={() => handlePurchase('live')} 
                    className={`w-full ${primaryBgColor} text-white font-bold py-4 px-4 rounded-xl flex flex-wrap justify-center items-center gap-2 ${primaryHoverColor} transition-colors text-lg shadow-lg ${primaryShadowColor} leading-tight active:scale-95`}
                  >
                    <span>Enroll in Live PRO</span> 
                    <ArrowRight size={18} className="shrink-0" />
                  </button>
                )}

              </div>
            </div>
          )}
        </div>
      </section>

      <Accreditations className="bg-gray-50 border-t border-gray-200" />

      <Footer />

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 z-50 md:hidden pb-safe shadow-[0_-20px_40px_rgba(0,0,0,0.15)]">
        {loading ? null : accessLevel === 'live' ? (
          <button onClick={() => navigate('/profile')} className={`w-full ${mainBgColor} text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 shadow-lg`}>
            <Unlock size={18} /> Go to Dashboard
          </button>
        ) : (
          <div className="flex items-center justify-between gap-4">
            
            {/* DYNAMIC PRICE DISPLAY (Forced to Live Price) */}
            <div className={`flex flex-col ${darkTextColor}`}>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">
                {isPricingVisible ? 'Total Price' : 'Starts at'}
              </span>
              <span className="text-2xl font-black leading-none">
                ₹{course?.pricing?.live?.discount || "2499"}
              </span>
            </div>

            {/* DYNAMIC BUTTON ACTION */}
            <button
              onClick={() => {
                if (isPricingVisible) {
                  handlePurchase('live'); 
                } else {
                  scrollToPricing(); 
                }
              }}
              className={`flex-1 ${primaryBgColor} text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg ${primaryShadowColor}`}
            >
              {isPricingVisible ? (
                  <>Checkout <ArrowRight size={16}/></>
              ) : (
                  <>Enroll Now</>
              )}
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default DynamicCoursePage;