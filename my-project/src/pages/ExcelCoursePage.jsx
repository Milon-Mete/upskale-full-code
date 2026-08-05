import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, PlayCircle, Calendar, Globe, 
  BarChart3, ChevronRight, Star, 
  Clock, ShieldCheck, ArrowRight, ArrowLeft, Users, MapPin,
  Database, Layout, GitMerge, FileSpreadsheet, Zap, Video, MonitorPlay,
  Award, Briefcase, Coins, TrendingUp, FileJson, Bot, Table2, Sigma,
  Loader2, Lock, Unlock 
} from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { BASE_URL } from '../config';

// API Config
const API_BASE_URL = `${BASE_URL}`; 

const ExcelCoursePage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeModule, setActiveModule] = useState(null);
  
  // --- STATE ---
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // The slug for this specific page
  const COURSE_SLUG = "excel-mastery-with-ai-tools";

  // --- 2. LOAD USER FROM LOCAL STORAGE ---
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // --- 3. FETCH COURSE DATA ---
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/courses/${COURSE_SLUG}`);
        
        if (!response.ok) throw new Error('Failed to fetch course data');
        
        const data = await response.json();
        setCourse(data.courseData); 
      } catch (err) {
        console.error("Error loading course:", err);
        setError("Could not load details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();

    const handleScrollNav = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScrollNav);
    return () => window.removeEventListener('scroll', handleScrollNav);
  }, []);


  // --- 4. CHECK ACCESS LEVEL (Replaces simple isOwned check) ---
  const getAccessLevel = () => {
    if (!user || !user.enrolledCourses || !course) return null;

    // Find the specific enrollment for this course
    const enrollment = user.enrolledCourses.find(e => {
        const itemId = typeof e.item === 'string' ? e.item : e.item._id;
        return itemId === course._id;
    });

    if (!enrollment) return null; // User doesn't own it
    
    // Return the plan type: 'recorded', 'live', or 'masterclass'
    return enrollment.planType || 'recorded'; 
  };

  const accessLevel = getAccessLevel(); 


  // --- 5. HANDLE BUY / ACTION ---
  const handlePurchase = (planType) => {
    // A. Not Logged In -> Go to Login
    

    // B. Logic: Go to Cart
    if (!course) return;

    const price = planType === 'live' ? course.pricing.live : course.pricing.recorded;
    
    navigate('/cart', { 
      state: { 
        item: {
          id: course._id, 
          title: course.title,
          plan: planType === 'live' ? 'Live + AI Cohort' : 'Self-Paced',
          
          // 👇👇👇 CRITICAL FIX: Send plan type to Cart 👇👇👇
          planType: planType, 
          // ------------------------------------------------

          price: price,
          originalPrice: price * 1.5,
          image: course.thumbnail,
          itemModel: 'Course', 
          features: planType === 'live' 
            ? ["Live Mentorship", "Verified Certificate", "Job Assistance"]
            : ["Recorded Content", "Lifetime Access"]
        }
      } 
    });
  };

  const scrollToPricing = () => {
    document.getElementById('pricing-section').scrollIntoView({ behavior: 'smooth' });
  };

  // --- SLIDER LOGIC ---
  const sliderRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const index = Math.round(sliderRef.current.scrollLeft / sliderRef.current.clientWidth);
    setActiveSlide(index);
  };

  // --- SYLLABUS DATA ---
  const syllabus = [
    { title: "C.H-1: Intro & Basics", color: "from-green-500 to-emerald-600", shadow: "shadow-green-500/20", items: ["Tabs & Menus Overview", "Understanding Interface", "Workbook Basics"], icon: Layout },
    { title: "C.H-2: Basic Functions", color: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/20", items: ["Auto Fill & Cell Movement", "Insert Rows/Columns", "Find, Replace & Number Formats"], icon: FileSpreadsheet },
    { title: "C.H-3: Core Calculations", color: "from-teal-500 to-cyan-600", shadow: "shadow-teal-500/20", items: ["Sum, Subtract, Multiply, Divide", "Average, Min/Max", "Count Functions"], icon: Sigma },
    { title: "C.H-4: Advanced Functions", color: "from-cyan-500 to-blue-600", shadow: "shadow-cyan-500/20", items: ["SumIf, CountIf, If Conditions", "VLOOKUP & HLOOKUP", "Concatenate Function"], icon: GitMerge },
    { title: "C.H-5: Mid-Term Assessment", color: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/20", items: ["Practical Exam (40 Marks)", "Theoretical Exam (10 Marks)", "Performance Review"], icon: CheckCircle2 },
    { title: "C.H-6: Data Cleaning", color: "from-indigo-500 to-violet-600", shadow: "shadow-indigo-500/20", items: ["Conditional Formatting", "Remove Duplicates", "Advanced Sorting & Filtering"], icon: Database },
    { title: "C.H-7: Big Data Stats", color: "from-violet-500 to-fuchsia-600", shadow: "shadow-violet-500/20", items: ["Mean, Median, Mode", "Standard Deviation", "Statistical Analysis"], icon: BarChart3 },
    { title: "C.H-8: Pivots & Slicers", color: "from-fuchsia-500 to-pink-600", shadow: "shadow-fuchsia-500/20", items: ["Summarize Large Datasets", "Pivot Table Mastery", "Interactive Slicers"], icon: Table2 },
    { title: "C.H-9: Creating Dashboards", color: "from-pink-500 to-rose-600", shadow: "shadow-pink-500/20", items: ["Production & Output Metrics", "Histograms & Line Graphs", "Visual Elements & Storytelling"], icon: MonitorPlay },
    { title: "C.H-10: Financial Analysis", color: "from-rose-500 to-orange-600", shadow: "shadow-rose-500/20", items: ["ARR (Accounting Rate of Return)", "Payback Period Calculation", "Investment Decisions"], icon: Coins },
    { title: "C.H-11: AI & Google Sheets", color: "from-orange-500 to-amber-600", shadow: "shadow-orange-500/20", items: ["ChatGPT Integration in Excel", "AI for Formulas", "Google Sheets Essentials"], icon: Bot },
    { title: "C.H-12: Final Assessment", color: "from-amber-500 to-yellow-600", shadow: "shadow-amber-500/20", items: ["Final Revision", "Comprehensive Exam", "Certification"], icon: Award }
  ];

  const testimonials = [
    { name: "Rohit Malhotra", role: "Operations Manager @ Amazon", image: "https://randomuser.me/api/portraits/men/75.jpg", story: "I used to spend 4 hours daily on reports. After learning Macros and ChatGPT for Excel, I finish the same work in 15 minutes." },
    { name: "Anjali Gupta", role: "Financial Analyst @ HDFC", image: "https://randomuser.me/api/portraits/women/65.jpg", story: "The VLOOKUP and Pivot Table modules were explained so simply. I finally understand how to handle large datasets without crashing my sheet." },
    { name: "Vikram Singh", role: "Business Owner", image: "https://randomuser.me/api/portraits/men/32.jpg", story: "The dashboarding section helped me visualize my sales data. Now I can actually see where my business is growing." },
  ];

  const TestimonialCard = ({ t }) => (
    <div className="bg-[#121212] h-full rounded-2xl p-6 md:p-8 border border-white/5 hover:border-[#008a45]/50 transition-all duration-300 group hover:-translate-y-2 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-4 mb-6">
          <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-transparent group-hover:border-[#008a45] transition-colors" />
          <div>
            <h4 className="font-bold text-white text-lg leading-tight">{t.name}</h4>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{t.role}</p>
          </div>
        </div>
        <div className="flex text-[#008a45] gap-1 mb-4">
          {[1,2,3,4,5].map(star => <Star key={star} size={14} fill="currentColor" />)}
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">"{t.story}"</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-gray-100 selection:bg-[#008a45] selection:text-white overflow-x-hidden">
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#008a45] opacity-[0.08] blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-green-600 opacity-[0.05] blur-[120px] rounded-full" />
      </div>

      <Navbar/>
      
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-10 pb-24 px-6 max-w-7xl mx-auto z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
            
            <div className="space-y-8 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#008a45]/10 border border-[#008a45]/20 text-[#008a45] text-xs font-bold uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-[#008a45] animate-ping" />
                    New AI Modules Added
                </div>

                <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#008a45] via-green-400 to-teal-400 animate-gradient-x">
                        {loading ? "Loading..." : course ? course.title.split(' with')[0] : "Excel Mastery"}
                    </span> <br />
                    with Generative AI 
                </h1>
                
                <p className="text-gray-400 text-lg md:text-xl max-w-lg leading-relaxed border-l-2 border-white/10 pl-6">
                    {course?.description || "Supercharge your spreadsheets. Learn to use AI formula bots, automated data cleaning, and build dashboards that impress."}
                </p>
                
                {/* --- STATUS BAR: UPDATED LOGIC --- */}
                {loading ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="animate-spin" size={20} /> Loading course details...
                  </div>
                ) : accessLevel ? (
                  // --- SHOW THIS IF PURCHASED (ANY PLAN) ---
                  <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-xl flex items-center gap-4 max-w-md">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                      <Unlock size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-green-400 font-bold">
                        {accessLevel === 'live' ? 'Live Cohort Active' : 'Recorded Access Active'}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {accessLevel === 'live' ? 'You have full access to live classes.' : 'Upgrade to Live for mentorship.'}
                      </p>
                    </div>
                    <button 
                      onClick={() => navigate('/profile')}
                      className="ml-auto bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-600 transition-colors"
                    >
                      Profile
                    </button>
                  </div>
                ) : (
                  // --- SHOW THIS IF NOT PURCHASED ---
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <button 
                          onClick={scrollToPricing}
                          className="relative overflow-hidden bg-[#008a45] text-white px-8 py-4 rounded-xl font-bold text-lg group transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(0,138,69,0.4)]"
                      >
                          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                          <span className="relative flex items-center gap-2">Start Learning <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></span>
                      </button>
                      <button className="flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg text-white border border-white/10 hover:bg-white/5 hover:border-white/30 transition-all group">
                          <PlayCircle size={20} className="group-hover:text-[#008a45] transition-colors" />
                          Watch Demo
                      </button>
                  </div>
                )}
            </div>

            {/* Right Visual */}
            <div className="relative group perspective-1000 hidden md:block">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#008a45] to-green-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl transform transition-transform duration-500 hover:rotate-y-2 hover:rotate-x-2">
                    <img 
                        src={course?.thumbnail || "https://res.cloudinary.com/dvcs9x8yp/image/upload/v1770749468/EXCEL_WITH_AI_aqwtoe.png"}
                        alt="Excel with AI" 
                        className="w-full h-auto opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform border border-white/20 shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:bg-[#008a45] group-hover:border-[#008a45]">
                            <PlayCircle size={36} className="text-white fill-white/20" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- PRICING PLANS SECTION --- */}
      <section id="pricing-section" className="py-24 px-6 relative bg-[#050505]">
          <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-black mb-6">Choose Your Plan</h2>
                  <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                      Start small with recordings or go big with our AI-powered live mentorship.
                  </p>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                   <Loader2 className="animate-spin text-[#008a45]" size={40} />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    
                    {/* PLAN 1: RECORDED */}
                    <div className="relative bg-[#121212] border border-white/10 rounded-3xl p-8 flex flex-col hover:border-blue-500/50 transition-all duration-500 group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Video size={120} />
                        </div>
                        
                        <div className="relative z-10 flex flex-col h-full">
                            <h3 className="text-blue-400 font-bold uppercase tracking-widest text-sm mb-2">Self-Paced</h3>
                            <div className="text-5xl font-black text-white mb-6">
                              ₹{course?.pricing?.recorded || "499"} 
                              <span className="text-lg font-medium text-gray-500 line-through ml-2">₹999</span>
                            </div>
                            
                            <p className="text-gray-400 mb-8 min-h-[60px]">
                                Master the basics of Excel and Data Cleaning at your own pace with our HD library.
                            </p>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-gray-300">
                                    <CheckCircle2 className="text-blue-500 shrink-0" size={20} />
                                    <span>20+ Hours Recorded Content</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-300">
                                    <CheckCircle2 className="text-blue-500 shrink-0" size={20} />
                                    <span>Lifetime Access</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-300">
                                    <CheckCircle2 className="text-blue-500 shrink-0" size={20} />
                                    <span>Standard Certificate</span>
                                </li>
                            </ul>

                            {/* --- CONDITIONAL BUTTON 1 (Recorded) --- */}
                            {accessLevel === 'recorded' || accessLevel === 'live' ? (
                               <button 
                                 onClick={() => navigate('/profile')}
                                 className="w-full py-4 rounded-xl bg-blue-500/10 border border-blue-500 text-blue-400 font-bold hover:bg-blue-500 hover:text-white transition-all mt-auto flex items-center justify-center gap-2"
                               >
                                 <Unlock size={18} /> Access Course
                               </button>
                            ) : (
                               <button 
                                  onClick={() => handlePurchase('recorded')}
                                  className="w-full py-4 rounded-xl border border-blue-500 text-blue-400 font-bold hover:bg-blue-500 hover:text-white transition-all mt-auto"
                               >
                                  Buy Recorded Course
                               </button>
                            )}
                        </div>
                    </div>

                    {/* PLAN 2: LIVE (PREMIUM) */}
                    <div className="relative bg-gradient-to-b from-[#1a1a1a] to-black border border-[#008a45] rounded-3xl p-8 flex flex-col transform md:-translate-y-4 shadow-[0_0_40px_rgba(0,138,69,0.15)]">
                        <div className="absolute top-0 right-0 w-full h-full bg-[#008a45]/5 animate-pulse rounded-3xl pointer-events-none"></div>
                        
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#008a45] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                            Recommended
                        </div>

                        <div className="relative z-10 flex flex-col h-full">
                            <h3 className="text-[#008a45] font-bold uppercase tracking-widest text-sm mb-2">Live + AI Cohort</h3>
                            <div className="text-5xl font-black text-white mb-6">
                              ₹{course?.pricing?.live || "2499"} 
                              <span className="text-lg font-medium text-gray-500 line-through ml-2">₹3999</span>
                            </div>
                            
                            <p className="text-gray-300 mb-8 min-h-[60px]">
                                Learn directly from experts. Includes Advanced Dashboarding, ChatGPT integration, and Resume Review.
                            </p>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-white">
                                    <CheckCircle2 className="text-[#008a45] shrink-0" size={20} />
                                    <span className="font-bold">Includes Recording + Lifetime Access</span>
                                </li>
                                <li className="flex items-center gap-3 text-white">
                                    <CheckCircle2 className="text-[#008a45] shrink-0" size={20} />
                                    <span>Live Classes on AI & Dashboards</span>
                                </li>
                                <li className="flex items-center gap-3 text-white">
                                    <CheckCircle2 className="text-[#008a45] shrink-0" size={20} />
                                    <span>Verified "AI in Excel" Certificate</span>
                                </li>
                            </ul>

                            {/* --- CONDITIONAL BUTTON 2 (Live) --- */}
                            {accessLevel === 'live' ? (
                               // A. ALREADY LIVE
                               <button 
                                 onClick={() => navigate('/profile')}
                                 className="w-full py-4 rounded-xl bg-green-500/20 text-green-400 font-bold border border-green-500 hover:bg-green-500 hover:text-white transition-all shadow-lg mt-auto flex items-center justify-center gap-2"
                               >
                                 <Unlock size={18} /> Go to Profile
                               </button>
                            ) : accessLevel === 'recorded' ? (
                               // B. RECORDED -> UPGRADE
                               <button 
                                  onClick={() => handlePurchase('live')}
                                  className="w-full py-4 rounded-xl bg-[#008a45] text-white font-bold hover:bg-[#007038] transition-all shadow-lg hover:shadow-[#008a45]/40 mt-auto flex items-center justify-center gap-2"
                               >
                                  Upgrade to Live <Zap size={18} fill="currentColor" />
                               </button>
                            ) : (
                               // C. NOT PURCHASED
                               <button 
                                  onClick={() => handlePurchase('live')}
                                  className="w-full py-4 rounded-xl bg-[#008a45] text-white font-bold hover:bg-[#007038] transition-all shadow-lg hover:shadow-[#008a45]/40 mt-auto flex items-center justify-center gap-2"
                               >
                                  Enroll in Live Cohort <Zap size={18} fill="currentColor" />
                               </button>
                            )}
                        </div>
                    </div>
                </div>
              )}
          </div>
      </section>

      {/* --- SYLLABUS SECTION (Unchanged) --- */}
      <section className="py-24 bg-[#080808] relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-black mb-6">Course Syllabus</h2>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                    A comprehensive curriculum covering everything from VLOOKUP to AI-driven analysis.
                </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {syllabus.map((mod, idx) => {
                    const Icon = mod.icon;
                    return (
                        <div 
                            key={idx}
                            onMouseEnter={() => setActiveModule(idx)}
                            onMouseLeave={() => setActiveModule(null)}
                            className={`group relative bg-[#121212] border border-white/5 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${activeModule === idx ? mod.shadow : ''}`}
                        >
                            <div className={`absolute inset-0 border-2 border-transparent rounded-2xl transition-colors duration-300 ${activeModule === idx ? 'border-white/10' : ''}`} />
                            
                            <div className="p-6 relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${mod.color} transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg`}>
                                        <Icon size={24} className="text-white" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 bg-white/5 px-2 py-1 rounded group-hover:text-white group-hover:bg-white/10 transition-colors">
                                        Module 0{idx+1}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                                    {mod.title}
                                </h3>
                            </div>
                            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            <div className="p-6 pt-4">
                                <ul className="space-y-3">
                                    {mod.items.map((item, i) => (
                                        <li key={i} className="text-sm text-gray-400 flex items-start gap-3 group-hover:text-gray-300 transition-colors">
                                            <div className={`mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-700 group-hover:bg-gradient-to-br ${mod.color} transition-all duration-500`} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </section>

      {/* --- TESTIMONIALS SLIDER SECTION (Unchanged) --- */}
      <section className="py-24 px-6 relative bg-[#050505] border-t border-white/5">
        <div className="max-w-7xl mx-auto relative z-10">
             <div className="text-center mb-16">
                 <h2 className="text-3xl md:text-5xl font-black mb-6">Student Success Stories</h2>
                 <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                    See how mastering Excel is helping professionals save time and get promoted.
                 </p>
             </div>

             {/* Desktop */}
             <div className="hidden md:grid md:grid-cols-3 gap-8">
                {testimonials.map((t, i) => <TestimonialCard key={i} t={t} />)}
             </div>

             {/* Mobile */}
             <div className="md:hidden">
                 <div ref={sliderRef} onScroll={handleScroll} className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8 px-2 -mx-2">
                    {testimonials.map((t, i) => (
                        <div key={i} className="min-w-[85vw] snap-center">
                            <TestimonialCard t={t} />
                        </div>
                    ))}
                 </div>
                 <div className="flex justify-center gap-2 mt-4">
                    {testimonials.map((_, i) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${activeSlide === i ? 'w-6 bg-[#008a45]' : 'w-1.5 bg-white/20'}`} />
                    ))}
                 </div>
             </div>
        </div>
      </section>

      {/* --- UPSKALE ADVANTAGE (Unchanged) --- */}
      <section className="py-24 relative overflow-hidden bg-[#080808] border-t border-white/5">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-5xl font-black mb-6">The <span className="text-[#008a45]">UPSKALE</span> Advantage</h2>
                  <p className="text-gray-400 max-w-2xl mx-auto text-lg">We go beyond formulas. We teach you how to think in data.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-20">
                  <div className="bg-[#111] border border-white/10 rounded-2xl p-8 hover:border-[#008a45]/50 transition-all duration-300 group hover:-translate-y-2">
                      <div className="w-14 h-14 bg-[#008a45]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#008a45] transition-colors">
                          <Bot className="text-[#008a45] group-hover:text-white" size={28} />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">AI-Powered Learning</h3>
                      <p className="text-gray-400 text-sm leading-relaxed mb-6">Don't memorize formulas. Learn to use ChatGPT to write complex Excel macros and clean data in seconds.</p>
                  </div>
                  <div className="bg-[#111] border border-white/10 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300 group hover:-translate-y-2">
                      <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-colors">
                          <TrendingUp className="text-blue-500 group-hover:text-white" size={28} />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">Business Case Studies</h3>
                      <p className="text-gray-400 text-sm leading-relaxed mb-6">Work on real sales data, financial models, and inventory sheets used by top companies.</p>
                  </div>
                  <div className="bg-[#111] border border-white/10 rounded-2xl p-8 hover:border-yellow-500/50 transition-all duration-300 group hover:-translate-y-2">
                      <div className="w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-yellow-500 transition-colors">
                          <Award className="text-yellow-500 group-hover:text-white" size={28} />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">Certified & Recognized</h3>
                      <p className="text-gray-400 text-sm leading-relaxed mb-6">Get a certificate that proves you can handle advanced data tasks, not just basic data entry.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* --- FINAL CTA BANNER --- */}
      <div className="bg-[#050505] pt-10 pb-32 px-6">
        <div className="max-w-7xl mx-auto relative group overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-r from-[#008a45] to-green-800 transition-all duration-1000 group-hover:scale-105"></div>
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>

            <div className="relative z-10 p-12 md:p-24 text-center">
                <h2 className="text-3xl md:text-6xl font-black text-white mb-8 tracking-tight">
                    Stop working hard. Start working smart.
                </h2>
                {!accessLevel && (
                  <button 
                      onClick={scrollToPricing}
                      className="bg-black text-white px-12 py-5 rounded-2xl font-bold text-lg hover:bg-gray-900 transition-all hover:-translate-y-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-3 mx-auto"
                  >
                      Enroll Now <ArrowRight />
                  </button>
                )}
            </div>
        </div>
      </div>
      <Footer/>
      
      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur-lg border-t border-white/10 p-4 z-50 md:hidden pb-safe">
        {loading ? null : accessLevel ? (
           // --- MOBILE: PURCHASED STATE ---
           <button onClick={() => navigate('/profile')} className="w-full bg-green-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2">
             <Unlock size={18} /> Go to Profile
           </button>
        ) : (
          // --- MOBILE: BUY STATE ---
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Starts at</span>
              <span className="text-2xl font-black text-white">₹{course?.pricing?.recorded}</span>
            </div>
            <button 
              onClick={scrollToPricing}
              className="flex-1 bg-[#008a45] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 active:scale-95 transition-transform"
            >
              View Plans
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default ExcelCoursePage;