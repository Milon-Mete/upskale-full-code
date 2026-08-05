import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, PlayCircle, Calendar, Globe, 
  BarChart3, ChevronRight, Star, 
  Clock, ShieldCheck, ArrowRight, ArrowLeft, Users, MapPin,
  Database, Layout, GitMerge, FileSpreadsheet, Zap, Video, MonitorPlay,
  Award, Briefcase, Coins, TrendingUp, FileJson, Loader2, Unlock, Lock
} from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { BASE_URL } from '../config';

// API Config
const API_BASE_URL = `${BASE_URL}`; 

const PowerBICoursePage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeModule, setActiveModule] = useState(null);

  // --- STATE ---
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null); // User State

  // The slug matches your database entry
  const COURSE_SLUG = "power-bi-data-visualization";

  // --- 1. LOAD USER FROM LOCAL STORAGE ---
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // --- 2. FETCH COURSE DATA ---
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
        setError("Could not load latest pricing. Please check connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();

    // Scroll Logic
    const handleScrollNav = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScrollNav);
    return () => window.removeEventListener('scroll', handleScrollNav);
  }, []);

  // --- 3. CHECK ACCESS LEVEL (The Tiered Logic) ---
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

  const accessLevel = getAccessLevel(); // 'recorded', 'live', or null

  // --- 4. HANDLE BUY / ACTION ---
  const handlePurchase = (planType) => {
    // A. Not Logged In -> Go to Login
   

    // B. Logic: Go to Cart
    if (!course) return;

    const price = planType === 'live' ? course.pricing.live : course.pricing.recorded;
    
    navigate('/cart', { 
      state: { 
        item: {
          id: course._id, // MongoDB ID
          title: course.title,
          plan: planType === 'live' ? 'Live Cohort' : 'Self-Paced',
          planType: planType, // <--- CRITICAL: Send plan type to backend
          price: price,
          originalPrice: planType === 'live' ? price * 1.5 : price * 2,
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

  // --- STATIC DATA ---
  const testimonials = [
    { name: "Puja Das", role: "Data Analyst @ Infosys", image: "https://res.cloudinary.com/dvcs9x8yp/image/upload/v1770750326/Copilot_20260211_003423_l950ue.png", story: "The dashboard tracking kept me motivated. Bite-sized lessons made it easy to learn daily." },
    { name: "Amit Patel", role: "DevOps Engineer @ Wipro", image: "https://res.cloudinary.com/dvcs9x8yp/image/upload/v1770750327/Copilot_20260211_003509_xillrk.png", story: "Real projects and GitHub reviews made it feel like a real job, not just a course." },
    { name: "Sneha Roy", role: "Designer @ Accenture", image: "https://res.cloudinary.com/dvcs9x8yp/image/upload/v1770750326/Copilot_20260211_003303_k1ejvj.png", story: "I built my entire portfolio here. The design critiques were brutally honest and helpful." },
  ];

  const syllabus = [
    { title: "Basics & Interface", color: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/20", items: ["Power BI Ecosystem", "Interface Walkthrough", "Importing Data Sources"], icon: Layout },
    { title: "Power Query: Cleaning", color: "from-indigo-500 to-violet-600", shadow: "shadow-indigo-500/20", items: ["Data Profiling", "Removing Errors", "Column Quality Checks"], icon: Database },
    { title: "Advanced Transformations", color: "from-violet-500 to-fuchsia-600", shadow: "shadow-violet-500/20", items: ["Append vs Merge", "Unpivoting Data", "M Language Basics"], icon: GitMerge },
    { title: "Data Modeling", color: "from-fuchsia-500 to-pink-600", shadow: "shadow-fuchsia-500/20", items: ["Table Relationships", "Cardinality (1-to-*)", "Star Schema Design"], icon: Database },
    { title: "Mini Project", color: "from-pink-500 to-rose-600", shadow: "shadow-pink-500/20", items: ["Live Knowledge Check", "Hands-on Practice", "Mentor Review"], icon: Star },
    { title: "Visuals & Design", color: "from-rose-500 to-orange-600", shadow: "shadow-rose-500/20", items: ["Choosing Right Charts", "Color Theory", "Dashboard Layouts"], icon: BarChart3 },
    { title: "Slicers & Interactions", color: "from-orange-500 to-amber-600", shadow: "shadow-orange-500/20", items: ["Sync Slicers", "Edit Interactions", "Drill-through Features"], icon: PlayCircle },
    { title: "Maps & Custom Cols", color: "from-amber-500 to-yellow-600", shadow: "shadow-amber-500/20", items: ["Geospatial Data", "Conditional Columns", "Custom Formatting"], icon: MapPin },
    { title: "DAX Basics", color: "from-emerald-500 to-green-600", shadow: "shadow-emerald-500/20", items: ["Calculated Measures", "SUM / COUNT / AVG", "Time Intelligence Intro"], icon: FileSpreadsheet },
    { title: "Final Capstone", color: "from-teal-500 to-cyan-600", shadow: "shadow-teal-500/20", items: ["End-to-End Project", "Portfolio Creation", "Final Assessment"], icon: ShieldCheck }
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
      <Navbar/>
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#008a45] opacity-[0.08] blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[10%] right-[-5%] w-[400px] h-[400px] bg-blue-600 opacity-[0.05] blur-[120px] rounded-full" />
      </div>

      

      {/* --- HERO SECTION --- */}
      <section className="relative pt-10 pb-24 px-6 max-w-7xl mx-auto z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#008a45]/10 border border-[#008a45]/20 text-[#008a45] text-xs font-bold uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-[#008a45] animate-ping" />
                    Admissions Open
                </div>

                <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight">
                    Accelerate your <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#008a45] via-green-400 to-teal-400 animate-gradient-x">
                       {loading ? "Analytics Career" : course?.title.split('&')[0] || "Analytics Career"}
                    </span>
                </h1>
                
                <p className="text-gray-400 text-lg md:text-xl max-w-lg leading-relaxed border-l-2 border-white/10 pl-6">
                    {course?.description || "Choose between Self-Paced Learning or our Premium Live Cohort. Master Power BI today."}
                </p>
                
                {/* Stats */}
                <div className="flex flex-wrap gap-8 py-6">
                  {[
                    { label: "Hands-on Projects", val: "5+", icon: Briefcase },
                    { label: "Hours of Content", val: "20h+", icon: Clock },
                    { label: "Downloadable Resources", val: "10+", icon: FileJson }
                  ].map((stat, idx) => (
                    <div key={idx} className="group cursor-default">
                      <div className="flex items-center gap-2 mb-1">
                        <stat.icon size={16} className="text-[#008a45] group-hover:rotate-12 transition-transform duration-300" />
                        <div className="text-3xl font-black text-white group-hover:text-[#008a45] transition-colors">{stat.val}</div>
                      </div>
                      <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* PURCHASE STATUS / CTA */}
                {loading ? (
                    <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="animate-spin" size={20} /> Loading course details...
                    </div>
                ) : accessLevel ? (
                    // --- SHOW IF OWNED (Recorded OR Live) ---
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
                    // --- SHOW IF NOT PURCHASED ---
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button 
                            onClick={scrollToPricing}
                            className="relative overflow-hidden bg-[#008a45] text-white px-8 py-4 rounded-xl font-bold text-lg group transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(0,138,69,0.4)]"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <span className="relative flex items-center gap-2">View Plans <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></span>
                        </button>
                        <button className="flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg text-white border border-white/10 hover:bg-white/5 hover:border-white/30 transition-all group">
                            <PlayCircle size={20} className="group-hover:text-[#008a45] transition-colors" />
                            Watch Demo
                        </button>
                    </div>
                )}
            </div>

            {/* Right Visual - Floating Card */}
            <div className="relative group perspective-1000 hidden md:block">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#008a45] to-teal-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl transform transition-transform duration-500 hover:rotate-y-2 hover:rotate-x-2">
                    <img 
                        src={course?.thumbnail || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"} 
                        alt="profile" 
                        className="w-full h-auto opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
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
                  <h2 className="text-4xl md:text-5xl font-black mb-6">Choose Your Learning Path</h2>
                  <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                      Whether you prefer self-paced learning or live mentorship, we have the perfect plan for you.
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
                              <p className="text-gray-400 mb-8 min-h-[60px]">Perfect for independent learners who want to master Power BI at their own speed.</p>
                              <ul className="space-y-4 mb-8">
                                  {["Full Course Recorded Videos", "Lifetime Access", "Self-Paced Assignments", "Course Completion Certificate"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-300">
                                        <CheckCircle2 className="text-blue-500 shrink-0" size={20} /><span>{item}</span>
                                    </li>
                                  ))}
                              </ul>
                              
                              {/* --- BUTTON LOGIC FOR RECORDED --- */}
                              {accessLevel === 'recorded' || accessLevel === 'live' ? (
                                  <button onClick={() => navigate('/profile')} className="w-full py-4 rounded-xl bg-blue-500/10 border border-blue-500 text-blue-400 font-bold hover:bg-blue-500 hover:text-white transition-all mt-auto flex items-center justify-center gap-2">
                                      <Unlock size={18} /> Access Course
                                  </button>
                              ) : (
                                  <button onClick={() => handlePurchase('recorded')} className="w-full py-4 rounded-xl border border-blue-500 text-blue-400 font-bold hover:bg-blue-500 hover:text-white transition-all mt-auto">
                                      Buy Recorded Course
                                  </button>
                              )}
                          </div>
                      </div>

                      {/* PLAN 2: LIVE */}
                      <div className="relative bg-gradient-to-b from-[#1a1a1a] to-black border border-[#008a45] rounded-3xl p-8 flex flex-col transform md:-translate-y-4 shadow-[0_0_40px_rgba(0,138,69,0.15)]">
                          <div className="absolute top-0 right-0 w-full h-full bg-[#008a45]/5 animate-pulse rounded-3xl pointer-events-none"></div>
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#008a45] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">Most Popular</div>
                          <div className="relative z-10 flex flex-col h-full">
                              <h3 className="text-[#008a45] font-bold uppercase tracking-widest text-sm mb-2">Live Cohort</h3>
                              <div className="text-5xl font-black text-white mb-6">
                                  ₹{course?.pricing?.live || "3999"} 
                                  <span className="text-lg font-medium text-gray-500 line-through ml-2">₹{4999}</span>
                              </div>
                              <p className="text-gray-300 mb-8 min-h-[60px]">The ultimate experience with live mentorship, doubt clearing, and career guidance.</p>
                              <ul className="space-y-4 mb-8">
                                  {["Everything in Recorded Plan", "Live Interactive Classes", "1-on-1 Doubt Clearing", "Verified Professional Certificate"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-white">
                                        <CheckCircle2 className="text-[#008a45] shrink-0" size={20} /><span className={i===0?"font-bold":""}>{item}</span>
                                    </li>
                                  ))}
                              </ul>

                              {/* --- BUTTON LOGIC FOR LIVE --- */}
                              {accessLevel === 'live' ? (
                                  // A. HAS LIVE -> ACCESS
                                  <button onClick={() => navigate('/profile')} className="w-full py-4 rounded-xl bg-green-500/20 text-green-400 font-bold border border-green-500 hover:bg-green-500 hover:text-white transition-all shadow-lg mt-auto flex items-center justify-center gap-2">
                                      <Unlock size={18} /> Go to Profile
                                  </button>
                              ) : accessLevel === 'recorded' ? (
                                  // B. HAS RECORDED -> UPGRADE
                                  <button onClick={() => handlePurchase('live')} className="w-full py-4 rounded-xl bg-[#008a45] text-white font-bold hover:bg-[#007038] transition-all shadow-lg hover:shadow-[#008a45]/40 mt-auto flex items-center justify-center gap-2">
                                      Upgrade to Live <Zap size={18} fill="currentColor" />
                                  </button>
                              ) : (
                                  // C. HAS NOTHING -> BUY
                                  <button onClick={() => handlePurchase('live')} className="w-full py-4 rounded-xl bg-[#008a45] text-white font-bold hover:bg-[#007038] transition-all shadow-lg hover:shadow-[#008a45]/40 mt-auto flex items-center justify-center gap-2">
                                      Enroll in Live Cohort <Zap size={18} fill="currentColor" />
                                  </button>
                              )}
                          </div>
                      </div>
                  </div>
              )}
          </div>
      </section>

      {/* --- SYLLABUS SECTION --- */}
      <section className="py-24 bg-[#080808] relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-black mb-6">Course Syllabus</h2>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                    A structured 10-class journey designed to take you from <span className="text-white font-bold">Raw Data</span> to <span className="text-[#008a45] font-bold">Expert Storytelling</span>.
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
                                        Class 0{idx+1}
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

      {/* --- TESTIMONIALS SLIDER SECTION --- */}
      <section className="py-24 px-6 relative bg-[#050505] border-t border-white/5">
        <div className="max-w-7xl mx-auto relative z-10">
             <div className="text-center mb-16">
                 <h2 className="text-3xl md:text-5xl font-black mb-6">From Learning to <span className="text-[#008a45]">Earning</span></h2>
                 <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                    See how our students are transforming their careers and landing top tech jobs.
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

      {/* --- THE UPSKALE ADVANTAGE --- */}
      <section className="py-24 relative overflow-hidden bg-[#080808] border-t border-white/5">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-5xl font-black mb-6">The <span className="text-[#008a45]">UPSKALE</span> Advantage</h2>
                  <p className="text-gray-400 max-w-2xl mx-auto text-lg">We don't just teach tools; we build careers. Here's why 15,000+ learners trust us.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-20">
                  <div className="bg-[#111] border border-white/10 rounded-2xl p-8 hover:border-[#008a45]/50 transition-all duration-300 group hover:-translate-y-2">
                      <div className="w-14 h-14 bg-[#008a45]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#008a45] transition-colors">
                          <MonitorPlay className="text-[#008a45] group-hover:text-white" size={28} />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">Live Interactive Classes</h3>
                      <p className="text-gray-400 text-sm leading-relaxed mb-6">Don't just watch—participate. Join cohort-based learning with industry experts, ask questions in real-time, and network with peers.</p>
                  </div>

                  <div className="bg-[#111] border border-white/10 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300 group hover:-translate-y-2">
                      <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-colors">
                          <TrendingUp className="text-blue-500 group-hover:text-white" size={28} />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">Real World Projects</h3>
                      <p className="text-gray-400 text-sm leading-relaxed mb-6">Theory gets you nowhere. Work on actual business problems from Swiggy, Uber, and Amazon every week.</p>
                  </div>

                  <div className="bg-[#111] border border-white/10 rounded-2xl p-8 hover:border-yellow-500/50 transition-all duration-300 group hover:-translate-y-2">
                      <div className="w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-yellow-500 transition-colors">
                          <Award className="text-yellow-500 group-hover:text-white" size={28} />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">Affordable & Recognized</h3>
                      <p className="text-gray-400 text-sm leading-relaxed mb-6">Transition to your dream career without breaking the bank. Get a verified certificate upon completion.</p>
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
                    Start your journey today
                </h2>
                {!accessLevel && (
                    <button 
                        onClick={scrollToPricing}
                        className="bg-black text-white px-12 py-5 rounded-2xl font-bold text-lg hover:bg-gray-900 transition-all hover:-translate-y-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-3 mx-auto"
                    >
                        Choose Your Plan <ChevronRight />
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
           <button onClick={() => navigate('/profile')} className="w-full bg-green-500 text-white font-bold py-3.5 rounded-xl">Go to Profile</button>
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

export default PowerBICoursePage;