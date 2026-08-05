import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock, X, ArrowRight } from 'lucide-react';
import { BASE_URL } from '../config';

const ContinueWatching = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dismissed, setDismissed] = useState(false);
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));

    useEffect(() => {
        const fetchContinueWatching = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`${BASE_URL}/engagement/progress/recent/continue`, {
                    credentials: 'include'
                });
                const data = await res.json();
                if (data.success) {
                    setCourses(data.courses || []);
                }
            } catch (err) {
                console.error("Failed to fetch continue watching", err);
            } finally {
                setLoading(false);
            }
        };

        fetchContinueWatching();
    }, []);

    // Listen for user login/logout
    useEffect(() => {
        const checkUser = () => {
            setUser(JSON.parse(localStorage.getItem('user') || 'null'));
        };
        window.addEventListener('storage', checkUser);
        return () => window.removeEventListener('storage', checkUser);
    }, []);

    if (loading) return null;
    if (!user || courses.length === 0 || dismissed) return null;

    // Only show the most recent course
    const course = courses[0];

    return (
        <div className="fixed bottom-24 md:bottom-8 left-3 md:left-8 z-[150] max-w-[150px] md:max-w-[320px] w-full animate-slide-up-fade">
            <div className="relative bg-[#121212]/95 backdrop-blur-xl border border-white/10 rounded-lg md:rounded-2xl shadow-2xl shadow-black/50 overflow-hidden hover:border-emerald-500/40 transition-all duration-300 group">
                
                {/* Close Button */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDismissed(true);
                    }}
                    className="absolute top-0.5 md:top-2 right-0.5 md:right-2 z-10 w-3 h-3 md:w-6 md:h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-red-500/80 transition-colors"
                >
                    <X size={6} className="md:hidden text-white" />
                    <X size={12} className="hidden md:block text-white" />
                </button>

                {/* Content */}
                <Link
                    to={`/bitesize/${course.courseSlug}`}
                    className="flex flex-col md:flex-row items-center gap-0.5 md:gap-3 p-1 md:p-3"
                >
                    {/* ── MOBILE VERTICAL LAYOUT (hidden on md+) ── */}
                    <div className="w-full md:hidden flex flex-col items-center">
                        {/* Square Thumbnail */}
                        <div className="w-full aspect-square rounded-sm overflow-hidden relative">
                            <img
                                src={course.courseImage}
                                alt={course.courseTitle}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Play size={7} className="text-white fill-white drop-shadow-lg" />
                            </div>
                        </div>
                        
                        {/* Progress Bar under image */}
                        <div className="w-full h-[1.5px] bg-white/10 overflow-hidden -mt-[1.5px] relative z-10">
                            <div
                                className="h-full bg-emerald-500 transition-all duration-500"
                                style={{ width: `${course.progressPercent || 0}%` }}
                            />
                        </div>

                        {/* Compact info under progress bar */}
                        <div className="w-full text-center mt-0.5">
                            <h3 className="text-white font-bold text-[12px] leading-tight line-clamp-1">
                                {course.courseTitle} <span className='text-[10px] text-green-300'>{course.courseHighlight}</span> <span className="text-gray-400 text-[9px] ml-03">
                                {course.completedVideos}/{course.totalVideos}
                            </span>
                            </h3>
                           
                        </div>
                    </div>

                    {/* ── DESKTOP HORIZONTAL LAYOUT (hidden on mobile) ── */}
                    <div className="hidden md:flex items-center gap-3 w-full">
                        {/* Mini Thumbnail */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 relative">
                            <img
                                src={course.courseImage}
                                alt={course.courseTitle}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Play size={14} className="text-white fill-white drop-shadow-lg" />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <Clock size={10} className="text-emerald-500 flex-shrink-0" />
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Continue</span>
                            </div>
                            <h3 className="text-white font-bold text-xs leading-tight line-clamp-1 group-hover:text-emerald-400 transition-colors">
                                {course.courseTitle} <span className='text-[10px] text-green-300'>{course.courseHighlight}</span>
                            </h3>
                            <p className="text-gray-500 text-[10px] mt-0.5">
                                {course.completedVideos}/{course.totalVideos} videos
                            </p>

                            {/* Mini Progress Bar */}
                            <div className="mt-1.5 h-1 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                    style={{ width: `${course.progressPercent || 0}%` }}
                                />
                            </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                            <ArrowRight size={12} className="text-gray-400 group-hover:text-emerald-400 transition-colors" />
                        </div>
                    </div>
                </Link>
            </div>

            <style>{`
                @keyframes slideUpFade {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-slide-up-fade {
                    animation: slideUpFade 0.4s ease-out;
                }
            `}</style>
        </div>
    );
};

export default ContinueWatching;
