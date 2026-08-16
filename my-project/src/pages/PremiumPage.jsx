import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Check, Crown, AlertCircle, ArrowRight, Loader2, 
    Lock, ChevronRight, BarChart3, FileSpreadsheet, 
    Bot, Presentation, MessageSquare, Sparkles, Globe, CheckCircle2 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { BASE_URL } from '../config';
import MobileBottomNav from '../components/MobileBottomNav';


import { useAuth } from '../context/AuthContext';

const IconMap = {
    FileSpreadsheet: FileSpreadsheet,
    Presentation: Presentation,
    Bot: Bot,
    BarChart3: BarChart3,
    MessageSquare: MessageSquare
};

const PremiumPage = () => {
    const navigate = useNavigate();
    const { openLoginModal } = useAuth();
    const sliderRef = useRef(null);
    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activePlan, setActivePlan] = useState(null);
    const [daysRemaining, setDaysRemaining] = useState(0);
    
    const [courses, setCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');

        if (!storedUser) {
            setLoading(false);
            return;
        }

        try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);

            const sub = parsedUser.biteSizeSubscription;
            
            if (sub && sub.status === 'active') {
                setActivePlan(sub);

                const expiryDate = new Date(sub.expiresAt);
                const today = new Date();
                const diffTime = expiryDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                setDaysRemaining(diffDays > 0 ? diffDays : 0);
            }
        } catch (error) {
            console.error("Error parsing user data:", error);
        } finally {
            setLoading(false);
        }
    }, [navigate]);


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
                setCoursesLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const formatDate = (dateValue) => {
        if (!dateValue) return "N/A";
        const d = new Date(dateValue);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const scrollToCourses = () => {
        document.getElementById('premium-courses-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
                <Loader2 className="animate-spin text-[#008a45]" size={48} />
            </div>
        );
    }

    const hasAccess = !!activePlan && daysRemaining > 0;
    
    // 🔴 FIXED: Calculate display dates and price based on plan type
    const validTill = activePlan ? new Date(activePlan.expiresAt) : null;
    let validFrom = null;
    let displayPrice = "0.0";
    let planName = "Pro Plan";

    if (activePlan) {
        validFrom = new Date(activePlan.expiresAt);
        if (activePlan.planType === 'trial') {
            validFrom.setDate(validFrom.getDate() - 3);
            displayPrice = "1.00";
            planName = "3-Day Trial";
        } else if (activePlan.planType === 'monthly') {
            validFrom.setDate(validFrom.getDate() - 30);
            displayPrice = "99.00";
            planName = "Monthly Plan";
        } else if (activePlan.planType === 'yearly') {
            validFrom.setDate(validFrom.getDate() - 365);
            displayPrice = "599.00";
            planName = "Yearly Plan";
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-24 md:pb-12 overflow-x-hidden relative">
            <Navbar />
            
            {/* Desktop Ambient Glow */}
            <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-yellow-600/10 to-transparent blur-[120px] pointer-events-none z-0" />

            {/* ========================================== */}
            {/* TOP SECTION: SUBSCRIPTION DETAILS OR PITCH */}
            {/* ========================================== */}
            <div className="max-w-md md:max-w-5xl lg:max-w-6xl mx-auto px-4 pt-8 md:pt-16 mb-16 relative z-10">
                
                {hasAccess ? (
                    /* 🔴 CASE 1: USER IS SUBSCRIBED */
                    <div className="animate-fade-in-up grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
                        
                        {/* Left Side: Branding & Features */}
                        <div className="text-center md:text-left">
                            <p className="text-gray-400 text-sm mb-2 font-medium uppercase tracking-widest">Subscription Status</p>
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                                <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-400">
                                    UPSKALE
                                </h1>
                                <span className="bg-gradient-to-r from-yellow-600 to-amber-500 text-black px-3 py-1 rounded-lg text-sm md:text-base font-black tracking-wider shadow-[0_0_15px_rgba(217,119,6,0.4)]">
                                    PRO
                                </span>
                            </div>

                            {daysRemaining <= 5 && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center justify-center md:justify-start gap-3 mb-8 text-sm font-bold w-full md:w-fit">
                                    <AlertCircle size={20} />
                                    Your subscription expires in {daysRemaining} days.
                                </div>
                            )}

                            <div className="hidden md:block mt-8">
                                <h3 className="text-lg font-bold mb-5 text-white">Your Current Plan Includes:</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5 w-fit">
                                        <div className="bg-[#008a45]/20 p-2 rounded-lg"><Check size={18} className="text-[#00d26a]" /></div>
                                        <span className="text-gray-200 font-medium pr-4">Unlimited Bite-Sized Courses</span>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5 w-fit">
                                        <div className="bg-[#008a45]/20 p-2 rounded-lg"><Check size={18} className="text-[#00d26a]" /></div>
                                        <span className="text-gray-200 font-medium pr-4">Ad-Free Learning Experience</span>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5 w-fit">
                                        <div className="bg-[#008a45]/20 p-2 rounded-lg"><Check size={18} className="text-[#00d26a]" /></div>
                                        <span className="text-gray-200 font-medium pr-4">Premium AI Tools Access</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: The Receipt/Details Card */}
                        <div className="bg-gradient-to-b from-[#151515] to-[#0a0a0a] rounded-[2rem] p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-3xl pointer-events-none" />
                            
                            <h2 className="text-center md:text-left text-xl font-black mb-6 flex items-center justify-center md:justify-start gap-2">
                                <FileSpreadsheet className="text-gray-400" size={20} /> Plan Details
                            </h2>

                            <div className="space-y-5 text-sm md:text-base font-medium">
                                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                    <span className="text-gray-400">Subscription type</span>
                                    <span className="text-white bg-white/5 px-3 py-1 rounded-md border border-white/10">{planName}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                    <span className="text-gray-400">Current status</span>
                                    <span className="text-[#00d26a] font-black flex items-center gap-1 bg-[#008a45]/10 px-3 py-1 rounded-md border border-[#008a45]/30">
                                        <span className="w-2 h-2 rounded-full bg-[#00d26a] animate-pulse"/> Active
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                    <span className="text-gray-400">Valid from</span>
                                    <span className="text-white font-mono">{formatDate(validFrom)}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                    <span className="text-gray-400">Valid till</span>
                                    <span className="text-white font-mono">{formatDate(validTill)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-gray-400">Amount Paid</span>
                                    <span className="text-2xl font-black text-white">₹{displayPrice}</span>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Only Features List (Hidden on desktop) */}
                        <div className="md:hidden mt-8">
                            <h3 className="text-center text-lg font-bold mb-4">Your Current Plan Includes</h3>
                            <div className="space-y-4 px-2">
                                <div className="flex items-center gap-3"><Check size={20} className="text-[#008a45]" /><span className="text-gray-300 text-sm font-medium">Unlimited Bite-Sized Courses</span></div>
                                <div className="flex items-center gap-3"><Check size={20} className="text-[#008a45]" /><span className="text-gray-300 text-sm font-medium">Ad-Free Learning Experience</span></div>
                                <div className="flex items-center gap-3"><Check size={20} className="text-[#008a45]" /><span className="text-gray-300 text-sm font-medium">Premium AI Tools Access</span></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    
                    /* 🔴 CASE 2: USER IS NOT SUBSCRIBED */
                    <div className="animate-fade-in-up grid md:grid-cols-2 gap-10 md:gap-16 items-center pt-6 md:pt-10">
                        
                        {/* Left Side: The Main Pitch */}
                        <div className="text-center md:text-left">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-yellow-500/20 to-amber-600/10 rounded-[2rem] flex items-center justify-center mx-auto md:mx-0 mb-6 md:mb-8 border border-yellow-500/20 shadow-[0_0_30px_rgba(217,119,6,0.15)] rotate-3">
                                <Crown size={40} className="text-yellow-500 -rotate-3" />
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
                                Upgrade to <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-300">PRO</span>
                            </h1>
                            <p className="text-gray-400 text-base md:text-lg mb-8 max-w-md mx-auto md:mx-0">
                                You currently do not have an active subscription. Unlock unrestricted access to bite-sized premium learning today.
                            </p>

                            <button 
                                onClick={scrollToCourses}
                                className="w-full md:w-fit px-8 py-4 md:py-5 bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 text-black font-black rounded-xl md:rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_0_30px_rgba(217,119,6,0.3)] text-lg"
                            >
                                Explore Premium Vault <ArrowRight size={20} />
                            </button>
                        </div>

                        {/* Right Side: The Value Proposition Card */}
                        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-[2rem] p-8 md:p-10 border border-white/5 relative overflow-hidden group hover:border-yellow-500/30 transition-colors">
                            <div className="absolute -right-20 -top-20 w-64 h-64 bg-yellow-500/10 blur-[80px] pointer-events-none group-hover:bg-yellow-500/20 transition-colors" />
                            
                            <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                                <Sparkles className="text-yellow-500" /> Why go PRO?
                            </h3>
                            
                            <ul className="space-y-6 relative z-10">
                                <li className="flex items-start gap-4 text-gray-300 md:text-lg">
                                    <div className="bg-[#008a45]/20 p-1.5 rounded-md mt-0.5"><Check size={18} className="text-[#00d26a]" /></div>
                                    <div>
                                        <span className="font-bold text-white block mb-1">Unrestricted Access</span>
                                        <span className="text-sm text-gray-400">Unlock all premium restricted courses instantly.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4 text-gray-300 md:text-lg">
                                    <div className="bg-[#008a45]/20 p-1.5 rounded-md mt-0.5"><Check size={18} className="text-[#00d26a]" /></div>
                                    <div>
                                        <span className="font-bold text-white block mb-1">Official Certification</span>
                                        <span className="text-sm text-gray-400">Earn verifiable certificates to boost your resume.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4 text-gray-300 md:text-lg">
                                    <div className="bg-[#008a45]/20 p-1.5 rounded-md mt-0.5"><Check size={18} className="text-[#00d26a]" /></div>
                                    <div>
                                        <span className="font-bold text-white block mb-1">Accelerated Learning</span>
                                        <span className="text-sm text-gray-400">Master hard skills with structured 60-second lessons.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {/* ========================================== */}
            {/* BOTTOM SECTION: BITE SIZED COURSES SLIDER */}
            {/* ========================================== */}
            <div id="premium-courses-section" className="w-full relative border-t border-white/5 pt-12 md:pt-20 bg-[#050505]">
                
                <div className="relative z-10 flex justify-between items-end px-6 mb-10 max-w-[1400px] mx-auto">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="text-yellow-500" size={16} />
                            <span className="text-yellow-500 font-bold text-xs uppercase tracking-[0.2em]">Premium Vault</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none">
                            Available <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-300">Bite-Sized Courses</span>
                        </h2>
                    </div>
                </div>

                {coursesLoading ? (
                    <div className="flex justify-center items-center py-20 relative z-10">
                        <Loader2 className="animate-spin text-yellow-500" size={32} />
                    </div>
                ) : (
                    <div 
                        ref={sliderRef}
                        className="flex overflow-x-auto gap-5 px-6 pb-12 no-scrollbar snap-x snap-mandatory touch-pan-x touch-pan-y max-w-[1400px] mx-auto relative z-10"
                        style={{ WebkitOverflowScrolling: 'touch' }} 
                    >
                        {courses.toReversed().map((course) => {
                            const CurrentIcon = IconMap[course.iconName] || MessageSquare;

                            return (
                                <Link 
                                    to={course.isLocked ? "#" : `/bitesize/${course.slug}`} 
                                    key={course._id} 
                                    className={`
                                        flex-shrink-0 w-[85%] sm:w-[320px] lg:w-[320px] snap-center transform-gpu
                                        h-[450px] relative rounded-[2rem] overflow-hidden border border-white/5 flex flex-col group 
                                        transition-all duration-300 md:duration-500 md:hover:-translate-y-2 md:hover:shadow-2xl ${course.glowColor}
                                        ${course.isLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}
                                    `}
                                    onClick={(e) => course.isLocked && e.preventDefault()}
                                >
                                    
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-90 md:opacity-80 md:group-hover:opacity-100 md:group-hover:from-black transition-all duration-500 z-10" />
                                    
                                    <div className="relative z-20 p-6 flex flex-col h-full justify-between">
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

                                            {!course.isLocked && !hasAccess && (
                                                <div className="mt-4 opacity-100 transition-opacity w-full">
                                                    <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-2">
                                                        <Globe size={10}/> Global Access Plans
                                                    </div>
                                                    
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center justify-between bg-gradient-to-r from-[#eab308]/10 to-transparent border border-[#eab308]/20 rounded-md px-2.5 py-1.5 backdrop-blur-sm">
                                                            <span className="text-[10px] text-[#eab308] font-black uppercase tracking-wider">3-Day Trial</span>
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="text-white font-black text-sm">₹1</span>
                                                                <span className="text-[9px] text-[#eab308]/80 font-medium">only</span>
                                                            </div>
                                                        </div>
                                                        
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

                                            {!course.isLocked && hasAccess && (
                                                <div className="mt-4 opacity-100 transition-opacity w-full">
                                                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg backdrop-blur-sm w-max">
                                                        <CheckCircle2 size={16} className="text-emerald-400" />
                                                        <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Pro Access Active</span>
                                                    </div>
                                                </div>
                                            )}

                                            {!course.isLocked && (
                                                <div className="hidden md:block h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-500 overflow-hidden mt-0 group-hover:mt-4">
                                                    <span className="text-xs font-bold text-white flex items-center gap-2">
                                                        {hasAccess ? "Continue Learning" : "Start Learning"} <ChevronRight size={14} />
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

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
            </div>
                  <MobileBottomNav />
            

            <style dangerouslySetInnerHTML={{ __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div>
        
    );
};

export default PremiumPage;