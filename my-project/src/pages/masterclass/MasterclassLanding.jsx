import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, CheckCircle2, Star, User, 
  ArrowRight, Zap, ShieldCheck, Play, Users, 
  Loader2, Trophy, Sparkles, Gift, Layout, 
  ChevronDown, Timer, Video, FileText, 
  GraduationCap, Check, Quote, Globe
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { BASE_URL } from '../../config';

const MasterclassLanding = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);

  // --- DUMMY DATA ---
  const DEFAULT_DATA = {
    _id: "demo_id_123",
    title: "Mastering Digital Product Design: From Zero to Pro",
    tagline: "Join this exclusive 3-hour live workshop to learn the exact framework used by top designers at Google and Meta to build products that users love.",
    bannerImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop", 
    expert: { 
      name: "Sarah Jenkins", 
      designation: "Senior Product Designer @ TechFlow", 
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop", 
      bio: "With over 12 years of experience leading design teams, Sarah has helped 50+ startups scale their products. She was previously a Lead UX Researcher at Adobe." 
    },
    schedule: { 
      startDate: new Date(new Date().setDate(new Date().getDate() + 5)), 
      startTime: "07:00 PM", endTime: "10:00 PM" 
    },
    price: { original: 2999, discounted: 499 },
    whatYouWillLearn: [
      { title: "The UX Mindset", desc: "How to think like a designer and solve complex user problems logically." },
      { title: "Figma Mastery", desc: "Advanced auto-layout, components, and prototyping secrets that save hours." },
      { title: "Design Systems", desc: "Building scalable systems that keep your UI consistent across all devices." },
      { title: "Portfolio Building", desc: "Structuring case studies that actually get you hired by top companies." }
    ],
    whoIsThisFor: [
      { label: "Aspiring Designers", icon: <User /> },
      { label: "Product Managers", icon: <Layout /> },
      { label: "Freelancers", icon: <Zap /> },
      { label: "Entrepreneurs", icon: <Trophy /> }
    ],
    bonuses: [
      { title: "Ultimate UI Kit", desc: "Premium Asset Pack worth $199", icon: <Layout size={24}/> },
      { title: "Interview Cheatsheet", desc: "Top 50 Q&A Guide", icon: <FileText size={24}/> },
      { title: "Session Recording", desc: "Lifetime Access", icon: <Video size={24}/> },
      { title: "Completion Certificate", desc: "Official Badge", icon: <GraduationCap size={24}/> }
    ],
    faqs: [
      { question: "Do I need prior design experience?", answer: "No! This session is designed to take you from fundamentals to advanced concepts." },
      { question: "Will there be a Q&A session?", answer: "Yes, the last 45 minutes are dedicated entirely to answering your specific questions." }
    ],
    reviews: [
      { studentName: "Rahul Verma", rating: 5, comment: "I learned more in these 3 hours than I did in my 6-month college course. Sarah is a genius!" },
      { studentName: "Priya Sharma", rating: 5, comment: "The bonus UI kit alone was worth the price. Highly recommended for anyone serious about design." },
      { studentName: "Amit Patel", rating: 5, comment: "Direct, no-fluff content. I landed my first freelance client 2 days after applying these techniques." }
    ],
    totalSeats: 100,
    enrolledCount: 87
  };

  const [data, setData] = useState(DEFAULT_DATA);

  // 🔴 SILENT BACKGROUND USER REFRESH 
  useEffect(() => {
    const fetchUserProfile = async () => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return;
        
        const localData = JSON.parse(storedUser);
        setUser(localData); // Set instantly for fast UI load

        try {
            // Quietly fetch fresh data from backend to see if they just bought something
            const res = await fetch(`${BASE_URL}/user/${localData._id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include' // Needs cookie!
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${BASE_URL}/masterclasses/${slug}`);
        if (!res.ok) throw new Error("Fetch failed");
        const result = await res.json();
        const apiData = result.masterclassData || result;
        setData(prev => ({
            ...prev, ...apiData,
            expert: { ...prev.expert, ...apiData.expert },
            schedule: { ...prev.schedule, ...apiData.schedule },
            price: { ...prev.price, ...apiData.price },
            whatYouWillLearn: apiData.whatYouWillLearn?.length ? apiData.whatYouWillLearn : prev.whatYouWillLearn,
            whoIsThisFor: apiData.whoIsThisFor?.length ? apiData.whoIsThisFor : prev.whoIsThisFor,
        }));
      } catch (err) { console.log("Using Demo Data"); } 
      finally { setLoading(false); }
    };
    if (slug) fetchData(); else setLoading(false);
  }, [slug]);

  const checkIsPurchased = () => {
    if (!user || !data._id) return false;

    // Admin bypass
    if (user.role === 'admin') return true;

    const allEnrollments = [
      ...(user.enrolledCourses || []),
      ...(user.enrolledCohorts || [])
    ];

    return allEnrollments.some(e => {
      if (!e || !e.item) return false; 
      
      // Handles both unpopulated string IDs and populated objects!
      const itemId = typeof e.item === 'string' ? e.item : e.item._id;
      return itemId.toString() === data._id.toString();
    });
  };
  const isPurchased = checkIsPurchased();

  const handleAuthAction = async () => {
    if (isPurchased) return navigate('/profile');

    // If masterclass is free and user is logged in, perform direct enrollment
    if (data.price?.discounted === 0 && user) {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/masterclasses/create-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
          body: JSON.stringify({ masterclassId: data._id }),
        });
        const resData = await res.json();
        if (res.ok && resData.success) {
          try {
            const freshRes = await fetch(`${BASE_URL}/user/${user._id}`, { credentials: 'include' });
            if (freshRes.ok) {
              const freshUser = await freshRes.json();
              localStorage.setItem('user', JSON.stringify(freshUser));
              setUser(freshUser);
              window.dispatchEvent(new Event("storage"));
            }
          } catch (e) { console.error("User refresh error", e); }
          alert("🎉 Enrolled in Free Masterclass successfully!");
          navigate('/profile');
          return;
        } else {
          alert(resData.message || "Failed to enroll in free masterclass");
        }
      } catch (err) {
        console.error("Free enrollment error", err);
        alert("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    navigate('/masterclasscart', {
      state: { item: { id: data._id, title: data.title, plan: "Live Masterclass", image: data.bannerImage, type: "Masterclass", price: data.price?.discounted || 0, originalPrice: data.price?.original || 0, features: ["Live Session", "Certificate", "Q&A"] } }
    });
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-[#008a45] w-10 h-10"/></div>;

  const [titleMain, titleSub] = data.title.split(":");

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-red-500/30 overflow-x-hidden">
      <Navbar />
      
      {/* CSS for custom animations */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        .glass-card {
            background: rgba(255, 255, 255, 0.02);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .glass-card:hover {
            border-color: rgba(239, 68, 68, 0.3);
            background: rgba(255, 255, 255, 0.04);
        }
      `}</style>

      {/* ================= HERO SECTION ================= */}
      <div className="relative pt-12 pb-12 md:pt-16 md:pb-12 px-6">
        <div className="absolute top-0 inset-x-0 h-[800px] bg-gradient-to-b from-red-900/10 via-[#050505] to-[#050505] pointer-events-none" />
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 lg:gap-16 items-start relative z-10">
            {/* LEFT: Content */}
            <div className="lg:col-span-7 flex flex-col justify-center h-full pt-4">
                <div className="inline-flex w-fit items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 text-xs font-bold uppercase tracking-wider mb-6">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    Live Masterclass
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tight">
                    {titleMain}
                    {titleSub && <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 mt-2">{titleSub}</span>}
                </h1>
                <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-2xl mb-6">
                    {data.tagline}
                </p>
                <div className="border-t border-white/10 pt-8 mt-2">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">What you will master:</p>
                    <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                        {["Advanced Strategies", "Real-world Case Studies", "Live Q&A & Mentorship", "Certificate of Completion"].map((item, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <Check size={16} className="text-red-500 shrink-0" />
                                <span className="text-gray-300 font-medium">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-6 mt-10 text-sm text-gray-500 font-medium">
                    <div className="flex items-center gap-2">
                        <Users size={16} className="text-red-500" />
                        <span>{data.enrolledCount>20?data.enrolledCount:20}+ Enrolled</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-700 rounded-full" />
                    <div className="flex items-center gap-2">
                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                        <span>4.9/5 Rated</span>
                    </div>
                </div>
            </div>

            {/* RIGHT: Pricing Card (Sticky) */}
            <div className="lg:col-span-5">
                <div className="glass-card bg-[#121212] rounded-3xl p-6 md:p-8 shadow-2xl shadow-red-900/10 sticky top-24">
                    <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-6">
                        <img src={data.expert.image} alt={data.expert.name} className="w-14 h-14 rounded-full object-cover border-2 border-red-500/50" />
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Mentored By</p>
                            <h3 className="text-white font-bold text-lg leading-tight">{data.expert.name}</h3>
                            <p className="text-xs text-gray-400">{data.expert.designation}</p>
                        </div>
                    </div>
                    <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3 text-gray-300 bg-white/5 p-3 rounded-xl">
                            <Calendar size={20} className="text-red-500"/>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase">Date</p>
                                <p className="font-bold text-white text-sm">{formatDate(data.schedule.startDate)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300 bg-white/5 p-3 rounded-xl">
                            <Clock size={20} className="text-red-500"/>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase">Time</p>
                                <p className="font-bold text-white text-sm">{data.schedule.startTime} - {data.schedule.endTime}</p>
                            </div>
                        </div>
                    </div>
                    {!isPurchased ? (
                        <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 mb-6 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                              {data.price?.discounted === 0 ? "FREE ACCESS" : "LIMITED OFFER"}
                            </div>
                            {data.price?.discounted === 0 ? (
                                <div className="flex flex-col items-center justify-center py-2">
                                    <span className="text-5xl font-black text-green-400">FREE</span>
                                    <p className="text-xs text-gray-400 mt-1 font-medium">100% Free Live Registration</p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-gray-500 text-sm line-through mb-1">Total Value: ₹{data.price?.original}</p>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-4xl font-black text-white">₹{data.price?.discounted}</span>
                                    </div>
                                    <p className="text-xs text-red-400 mt-2 font-medium flex items-center justify-center gap-1">
                                        <Timer size={12} /> Prices increase in 24 hours
                                    </p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 mb-6 flex items-center gap-3">
                            <CheckCircle2 className="text-green-500" size={24}/>
                            <div>
                                <p className="font-bold text-green-500">Seat Confirmed</p>
                                <p className="text-xs text-green-400">Check dashboard for details</p>
                            </div>
                        </div>
                    )}
                    <button 
                        onClick={handleAuthAction}
                        className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]
                        ${isPurchased ? 'bg-white text-black hover:bg-gray-200' : 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:shadow-red-500/25'}`}
                    >
                        {isPurchased ? "Go to Profile" : (data.price?.discounted === 0 ? "Enroll For Free" : "Secure Your Spot")}
                        <ArrowRight size={20} />
                    </button>
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                        <ShieldCheck size={12}/> 100% Satisfaction Guarantee
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* ================= 2. TRUST MARQUEE ================= */}
      <div className="border-y border-white/5 bg-[#080808] py-8 overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 w-20 md:w-40 bg-gradient-to-r from-[#050505] to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-20 md:w-40 bg-gradient-to-l from-[#050505] to-transparent z-10" />
          
          <div className="flex animate-scroll whitespace-nowrap gap-16 md:gap-32 items-center">
             {[...Array(4)].map((_, loopI) => (
               <React.Fragment key={loopI}>
                   {[
                      { l: "GRADUATES", v: "5000+" }, { l: "RATING", v: "4.9/5" }, 
                      { l: "DURATION", v: "3 HRS" }, { l: "ACTIONABLE", v: "100%" },
                      { l: "MENTOR", v: "EX-GOOGLE" }, { l: "SUPPORT", v: "LIFETIME" }
                   ].map((stat, i) => (
                      <div key={i} className="flex flex-col items-start min-w-[120px]">
                          <span className="text-3xl md:text-4xl font-black text-white/90">{stat.v}</span>
                          <span className="text-[10px] text-red-500 uppercase tracking-[0.2em] font-bold">{stat.l}</span>
                      </div>
                   ))}
               </React.Fragment>
             ))}
          </div>
      </div>

      {/* ================= 3. WHO IS THIS FOR (NEW GRID LAYOUT) ================= */}
      <div className="py-24 bg-[#050505] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                  <span className="text-red-500 font-bold tracking-widest text-xs uppercase mb-2 block">Target Audience</span>
                  <h2 className="text-3xl md:text-5xl font-black text-white">Is This Masterclass For You?</h2>
              </div>
              
              <div className="grid md:grid-cols-4 gap-6">
                  {data.whoIsThisFor.map((item, i) => (
                      <div key={i} className="group bg-[#121212] border border-white/5 hover:border-red-500/50 p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150"></div>
                          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white mb-6 group-hover:bg-red-500 transition-colors relative z-10">
                              {item.icon || <User />}
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2 relative z-10">{item.label || item}</h3>
                          <p className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors relative z-10">
                              Perfect for professionals looking to level up their skills instantly.
                          </p>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* ================= 4. CINEMATIC MENTOR SECTION ================= */}
      <div className="py-24 bg-[#0a0a0a] border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                  {/* Left: Image Stack */}
                  <div className="relative">
                      <div className="absolute inset-0 bg-red-600 blur-[100px] opacity-20"></div>
                      <div className="relative z-10 rounded-3xl overflow-hidden border border-white/10 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700">
                          <img src={data.expert.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.expert.name)}&background=1f1f1f&color=fff`} alt={data.expert.name} className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-8">
                               <p className="text-white font-bold text-lg">{data.expert.name}</p>
                               <p className="text-red-500 text-sm font-bold uppercase">{data.expert.designation}</p>
                          </div>
                      </div>
                  </div>

                  {/* Right: Bio Content */}
                  <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-wider mb-6">
                          <Star size={12} className="text-yellow-500" fill="currentColor"/>
                          Top Rated Instructor
                      </div>
                      <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">
                          Learn from the <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Industry Best.</span>
                      </h2>
                      <div className="space-y-6 text-lg text-gray-400 leading-relaxed">
                          <p>"{data.expert.bio}"</p>
                          <p>She has previously worked with Fortune 500 companies and has mentored over 5,000 students globally.</p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-8 mt-12 border-t border-white/10 pt-8">
                          {[
                              { label: "Experience", val: "12+ Yrs" },
                              { label: "Students", val: "5k+" },
                              { label: "Rating", val: "4.9/5" },
                          ].map((stat, i) => (
                              <div key={i}>
                                  <h4 className="text-3xl font-black text-white">{stat.val}</h4>
                                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{stat.label}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* ================= 5. CURRICULUM ================= */}
      <div className="py-24 bg-[#050505]">
          <div className="max-w-4xl mx-auto px-6">
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Masterclass Curriculum</h2>
                  <p className="text-gray-400 max-w-xl mx-auto">A structured, intense 3-hour deep dive designed to take you from beginner to pro.</p>
              </div>

              <div className="space-y-8 relative">
                  <div className="absolute left-[27px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-red-600 via-red-900/50 to-transparent hidden md:block"></div>

                  {data.whatYouWillLearn.map((item, i) => (
                      <div key={i} className="relative flex flex-col md:flex-row gap-8 group">
                          <div className="flex-shrink-0 z-10">
                              <div className="w-14 h-14 rounded-full bg-[#121212] border border-white/10 flex items-center justify-center text-xl font-black text-gray-500 group-hover:text-white group-hover:bg-red-600 group-hover:border-red-600 transition-all duration-300 shadow-xl">
                                  {i + 1}
                              </div>
                          </div>
                          <div className="flex-grow bg-[#121212] border border-white/5 p-8 rounded-3xl hover:border-red-500/30 transition-all duration-300 hover:bg-white/[0.02]">
                              <h3 className="text-2xl font-bold text-white mb-3">
                                  {typeof item === 'string' ? item : item.title}
                              </h3>
                              <p className="text-gray-400 leading-relaxed">
                                  {typeof item === 'string' ? "Master the fundamentals and advanced tactics." : item.desc}
                              </p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* ================= 6. BONUSES ================= */}
      <div className="py-24 bg-[#080808] border-y border-white/5">
          <div className="max-w-6xl mx-auto px-6">
               <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                  <div>
                      <h2 className="text-3xl md:text-5xl font-black text-white mb-2">Free Bonuses</h2>
                      <p className="text-gray-400">Premium assets included with your ticket.</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-full font-bold text-sm">
                      Total Value: ₹10,000+
                  </div>
               </div>

               <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-gradient-to-br from-[#121212] to-black border border-white/10 p-10 rounded-[2rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-red-600/20 transition-all"></div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white mb-8 border border-white/10">
                                {typeof data.bonuses[0] === 'string' ? <Layout size={32}/> : data.bonuses[0].icon}
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-4">
                                {typeof data.bonuses[0] === 'string' ? data.bonuses[0] : data.bonuses[0].title}
                            </h3>
                            <p className="text-gray-400 text-lg max-w-md">
                                {typeof data.bonuses[0] !== 'string' && data.bonuses[0].desc}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        {data.bonuses.slice(1, 3).map((bonus, i) => (
                            <div key={i} className="flex-1 bg-[#121212] border border-white/10 p-8 rounded-[2rem] hover:border-red-500/30 transition-all flex flex-col justify-center group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-red-500 group-hover:scale-110 transition-transform">
                                        {typeof bonus === 'string' ? <Gift/> : bonus.icon}
                                    </div>
                                    <ArrowRight size={20} className="text-gray-600 -rotate-45 group-hover:rotate-0 group-hover:text-white transition-all"/>
                                </div>
                                <h4 className="text-xl font-bold text-white">
                                    {typeof bonus === 'string' ? bonus : bonus.title}
                                </h4>
                            </div>
                        ))}
                    </div>
               </div>
          </div>
      </div>

      {/* ================= 7. REVIEWS ================= */}
      <div className="py-24 bg-[#050505]">
          <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-3xl md:text-5xl font-black text-center text-white mb-16">What Students Say</h2>
              <div className="grid md:grid-cols-3 gap-6">
                  {data.reviews.map((review, i) => (
                      <div key={i} className="bg-[#121212] border border-white/5 p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
                          <div className="flex gap-1 text-yellow-500 mb-6">
                              {[...Array(5)].map((_,i)=><Star key={i} size={16} fill="currentColor"/>)}
                          </div>
                          <p className="text-gray-300 text-lg leading-relaxed mb-8">"{review.comment}"</p>
                          <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center font-bold text-white">
                                  {review.studentName.charAt(0)}
                              </div>
                              <div>
                                  <p className="font-bold text-white">{review.studentName}</p>
                                  <p className="text-xs text-gray-500">Verified Student</p>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* ================= 8. FAQ ================= */}
      <div className="py-24 bg-[#080808] border-t border-white/5">
          <div className="max-w-3xl mx-auto px-6">
              <h2 className="text-3xl font-black text-center text-white mb-12">Frequently Asked Questions</h2>
              <div className="space-y-4">
                  {data.faqs.map((faq, i) => (
                      <div key={i} className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden transition-all hover:border-white/10">
                          <button 
                              onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                              className="w-full p-6 flex items-center justify-between text-left"
                          >
                              <span className="font-bold text-white text-lg">{faq.question}</span>
                              <ChevronDown size={20} className={`text-gray-500 transition-transform duration-300 ${activeFaq === i ? 'rotate-180' : ''}`}/>
                          </button>
                          <div className={`px-6 text-gray-400 leading-relaxed overflow-hidden transition-all duration-300 ${activeFaq === i ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                              {faq.answer}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* ================= 9. FINAL CTA ================= */}
      <div className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-red-600/5"></div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Ready to Master {data.title.split(":")[0]}?</h2>
              <p className="text-xl text-gray-400 mb-10">Join {data.enrolledCount}+ students. Prices increase soon.</p>
              
              <div className="bg-[#121212] border border-white/10 p-8 rounded-3xl inline-block w-full max-w-md shadow-2xl">
                  <div className="flex items-baseline justify-center gap-3 mb-2">
                      {data.price?.discounted === 0 ? (
                          <span className="text-5xl font-black text-green-400">FREE</span>
                      ) : (
                          <>
                              <span className="text-5xl font-black text-white">₹{data.price?.discounted}</span>
                              <span className="text-xl text-gray-500 line-through">₹{data.price?.original}</span>
                          </>
                      )}
                  </div>
                  <p className="text-red-500 text-sm font-bold mb-8">
                    {data.price?.discounted === 0 ? "100% Free Enrollment • Lifetime Access" : "One-time payment • Lifetime access"}
                  </p>
                  
                  <button 
                      onClick={handleAuthAction}
                      className={`w-full py-5 rounded-xl font-black text-xl flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] transition-transform
                      ${isPurchased ? 'bg-white text-black hover:bg-gray-200' : 'bg-red-600 text-white hover:bg-red-500'}`}
                  >
                      {isPurchased ? "Go to Profile" : (data.price?.discounted === 0 ? "Enroll For Free Now" : "Secure Your Spot Now")}
                      <ArrowRight size={24} />
                  </button>
                  <p className="text-xs text-gray-500 mt-4">100% Money-back guarantee if not satisfied.</p>
              </div>
          </div>
      </div>

      {/* ================= STICKY MOBILE CTA ================= */}
      <div className="fixed bottom-0 left-0 w-full bg-[#050505]/90 backdrop-blur-xl border-t border-white/10 p-4 z-50 md:hidden pb-safe">
        <div className="flex items-center justify-between gap-4">
            {!isPurchased ? (
                <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Total</p>
                    <div className="flex items-baseline gap-2">
                        {data.price?.discounted === 0 ? (
                            <span className="text-xl font-black text-green-400">FREE</span>
                        ) : (
                            <>
                                <span className="text-xl font-black text-white">₹{data.price?.discounted}</span>
                                <span className="text-xs text-gray-500 line-through">₹{data.price?.original}</span>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-green-500 font-bold text-sm flex items-center gap-2">
                    <CheckCircle2 size={16}/> Access Granted
                </div>
            )}
            <button 
                onClick={handleAuthAction}
                className={`flex-1 py-3 rounded-xl font-bold text-sm shadow-lg ${isPurchased ? 'bg-gray-800 text-white' : 'bg-red-600 text-white'}`}
            >
                {isPurchased ? "Profile" : (data.price?.discounted === 0 ? "Enroll Free" : "Book Now")}
            </button>
        </div>
      </div>
      
      <div className="h-20 md:hidden"></div>
      <Footer/>
    </div>
  );
};

export default MasterclassLanding;