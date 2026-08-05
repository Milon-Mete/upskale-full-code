import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    PlayCircle, Clock, ShieldCheck, 
    ArrowRight, Loader2, MonitorPlay, ChevronLeft, CheckCircle2 
} from 'lucide-react';
import { BASE_URL } from '../config';
import { useCart } from '../context/CartContext';

const RecordedCoursesCatalog = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // 🔴 NEW: State to hold the IDs of courses the user already owns
    const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());

    useEffect(() => {
        // 1. Fetch the user's enrollments from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            const enrolledIds = new Set();
            
            // Extract IDs from enrolledCourses
            if (user.enrolledCourses) {
                user.enrolledCourses.forEach(enc => {
                    // Handle cases where item is populated (object) or unpopulated (string ID)
                    const itemId = typeof enc.item === 'object' ? enc.item._id : enc.item;
                    if (itemId) enrolledIds.add(itemId.toString());
                });
            }
            
            // Extract IDs from legacy enrolledCohorts (just in case)
            if (user.enrolledCohorts) {
                user.enrolledCohorts.forEach(enc => {
                    const itemId = typeof enc.item === 'object' ? enc.item._id : enc.item;
                    if (itemId) enrolledIds.add(itemId.toString());
                });
            }
            
            setEnrolledCourseIds(enrolledIds);
        }

        // 2. Fetch the courses
        const fetchAllCourses = async () => {
            try {
                const response = await fetch(`${BASE_URL}/cohorts`);
                const data = await response.json();
                
                const allCourses = data.data || data.cohorts || data;
                
                if (Array.isArray(allCourses)) {
                    // Only keep courses that actually have a recorded pricing tier
                    const recordedOnly = allCourses.filter(course => course.pricing?.recorded);
                    setCourses(recordedOnly);
                } else {
                    setCourses([]);
                }
            } catch (err) {
                console.error("Error loading courses:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllCourses();
    }, []);

    const handleAddToCart = (course) => {
        const cartItem = {
            id: course._id,
            title: course.title,
            plan: 'Self-Paced Recorded',
            planType: 'recorded',
            price: course.pricing?.recorded?.discount || 499,
            originalPrice: course.pricing?.recorded?.original || 999,
            image: course.thumbnail,
            itemModel: 'Cohort',
            features: ["Recorded Content", "Lifetime Access", "Standard Certificate"]
        };

        addToCart(cartItem);
        navigate('/Recart');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="animate-spin text-yellow-500" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-yellow-500/30 pb-24">
            
            {/* Top Nav */}
            <nav className="p-6 md:px-20 max-w-7xl mx-auto flex items-center justify-between border-b border-white/5 mb-12">
                <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/10">
                    <ChevronLeft size={24} />
                </button>
                <div className="font-bold mr-10 tracking-widest text-sm opacity-80 uppercase">
                    <img
                        src="https://res.cloudinary.com/dvcs9x8yp/image/upload/v1775412223/20250730_170449_0000_uq4d24.png"
                        alt="UPSKALE Logo"
                        className="h-6 w-auto object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-[0_0_15px_rgba(0,138,69,0.3)]"
                      />
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6">
                
                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-block px-3 py-1 bg-[#eab308]/10 border border-[#eab308]/20 text-[#eab308] text-xs font-bold uppercase tracking-widest rounded-md mb-6">
                        Self-Paced Masterclasses
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
                        Master new skills <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">at your own pace.</span>
                    </h1>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Get lifetime access to premium recorded modules, real-world projects, and official certification. Study whenever, wherever.
                    </p>
                </div>

                {/* Courses Grid */}
                {courses.length === 0 ? (
                    <div className="text-center text-gray-500 py-20 border border-white/5 rounded-2xl bg-[#121212]">
                        No recorded courses are currently available. Check back soon.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((course) => {
                            // 🔴 NEW: Check if the user already owns this specific course
                            const isEnrolled = enrolledCourseIds.has(course._id.toString());

                            return (
                            <div key={course._id} className="bg-[#121212] border border-white/5 hover:border-white/20 transition-colors rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col group">
                                
                                {/* Thumbnail */}
                                <div className="w-full aspect-video bg-black rounded-xl mb-6 overflow-hidden relative border border-white/10">
                                    <img 
                                        src={course.thumbnail || "/placeholder-course.jpg"} 
                                        alt={course.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-12 h-12 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                                            <PlayCircle className="text-yellow-500" size={24} />
                                        </div>
                                    </div>
                                </div>

                                {/* Title & Features */}
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-white mb-4 line-clamp-2 leading-tight">
                                        {course.title}
                                    </h3>
                                    
                                    <div className="space-y-3 mb-8">
                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                            <MonitorPlay className="text-[#008a45]" size={16} />
                                            <span>Full HD Video Curriculum</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                            <Clock className="text-[#008a45]" size={16} />
                                            <span>Lifetime Access</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                            <ShieldCheck className="text-[#008a45]" size={16} />
                                            <span>Verifiable Certificate</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Pricing & CTA */}
                                <div className="mt-auto pt-6 border-t border-white/10">
                                    <div className="flex items-end justify-between mb-4">
                                        <div>
                                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">One-time payment</div>
                                            <div className="flex items-end gap-2">
                                                <div className="text-3xl font-black text-white">₹{course.pricing?.recorded?.discount || "499"}</div>
                                                {course.pricing?.recorded?.original > 0 && (
                                                    <div className="text-sm text-white/40 line-through mb-1">₹{course.pricing.recorded.original}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 🔴 NEW: Conditional Button Rendering */}
                                    {isEnrolled ? (
                                        <button 
                                            onClick={() => navigate(`/learn/${course._id}`)}
                                            className="w-full py-3 bg-[#1a1a1a] border border-white/10 text-white font-bold rounded-xl hover:bg-white/5 transition-all flex justify-center items-center gap-2 active:scale-95"
                                        >
                                            <CheckCircle2 size={18} className="text-[#00d26a]" /> Go to Course
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleAddToCart(course)}
                                            className="w-full py-3 bg-white text-black font-black rounded-xl hover:bg-gray-200 transition-all flex justify-center items-center gap-2 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                        >
                                            Add to Cart <ArrowRight size={18} />
                                        </button>
                                    )}
                                </div>
                                
                            </div>
                        )})}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecordedCoursesCatalog;