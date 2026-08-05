import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Play, CheckCircle, Lock, Video, CheckSquare, Award,
    ChevronDown, BookOpen, ChevronLeft, Layers, Compass, Flag, MapPin,
    Sparkles, Mountain, RefreshCw, Search, ArrowUp, Clock, Flame, Zap, Trophy, X, Shield, Star
} from 'lucide-react';
import { BASE_URL } from '../config';

/* ─────────────────────────────────────────────────────────────
   SATOSHI FONT & GYANN-E GAMIFIED ULTIMATE UI SYSTEM
   
   Color Palette (Preserved & Refined):
     --bg          #050505   (Deep slate ground)
     --panel       #121212   (Elevated panel background)
     --card        #18181b   (Sleek card surface)
     --emerald     #10b981   (Primary accent / active progress)
     --amber       #f59e0b   (Flame streak / XP / Leaderboard)
     --blue        #3b82f6   (Reels / Video indicators)
     --white       #ffffff   (High hierarchy text)

   Typography:
     Primary Font: 'Satoshi', sans-serif (Fontshare CDN)
   ───────────────────────────────────────────────────────────── */

const FONT_IMPORTS = `@import url('https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400&display=swap');`;

// ─── CONFETTI CELEBRATION ENGINE ─────────────────────────────
const Confetti = ({ active }) => {
    const canvasRef = useRef(null);
    const animRef = useRef(null);

    useEffect(() => {
        if (!active) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const colors = ['#10b981', '#34d399', '#f59e0b', '#ffffff', '#059669', '#3b82f6'];
        const pieces = Array.from({ length: 140 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 8 + 4,
            h: Math.random() * 5 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            speed: Math.random() * 2.6 + 1.8,
            rotationSpeed: Math.random() * 8 - 4,
            swing: Math.random() * 2 - 1,
            opacity: 1
        }));

        let startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed > 4000) {
                pieces.forEach(p => p.opacity -= 0.02);
                if (pieces.every(p => p.opacity <= 0)) return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            pieces.forEach(p => {
                if (p.opacity <= 0) return;
                p.y += p.speed;
                p.x += Math.sin(p.y * 0.02) * p.swing;
                p.rotation += p.rotationSpeed;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.globalAlpha = Math.max(0, p.opacity);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();
            });

            animRef.current = requestAnimationFrame(animate);
        };

        animate();
        return () => {
            window.removeEventListener('resize', resize);
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, [active]);

    return active ? (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="fixed inset-0 pointer-events-none z-[100]"
            style={{ width: '100vw', height: '100vh' }}
        />
    ) : null;
};

// ─── CIRCULAR PROGRESS BADGE ──────────────────────────────────
const CircularProgress = ({ progress = 0, size = 52, strokeWidth = 4, label = 'Progress' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <svg
            width={size}
            height={size}
            className="transform -rotate-90"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={label}
        >
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={strokeWidth}
                fill="none"
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#10b981"
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-1000 ease-out"
            />
        </svg>
    );
};

// ─── GYANN-E LEADERBOARD MODAL SUB-COMPONENT ─────────────────
const LeaderboardModal = ({ isOpen, onClose, currentStreak, userXp }) => {
    if (!isOpen) return null;

    // Simulated top learners list + user ranking
    const mockLeaderboard = [
        { rank: 1, name: "Aarav Sharma", xp: 2450, streak: 14, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120" },
        { rank: 2, name: "Priyanjali Sen", xp: 1980, streak: 11, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120" },
        { rank: 3, name: "Rahul Mukherjee", xp: 1720, streak: 9, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120" },
        { rank: 4, name: "You (Learner)", xp: userXp || 450, streak: currentStreak || 1, avatar: "https://res.cloudinary.com/dvcs9x8yp/image/upload/v1775412341/black_white_king_logo_20250815_165948_0000_tepz65.png", isUser: true },
        { rank: 5, name: "Sneha Kapur", xp: 420, streak: 4, avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120" },
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="bg-[#121212] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white/40 hover:text-white rounded-full bg-white/5 transition-colors">
                    <X size={18} />
                </button>

                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                        <Trophy size={22} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-white">Skill Leaderboard</h2>
                        <p className="text-xs font-bold text-white/50">Top Micro-Learners This Week</p>
                    </div>
                </div>

                <div className="space-y-2.5 max-h-[60vh] overflow-y-auto no-scrollbar">
                    {mockLeaderboard.map((item) => (
                        <div key={item.rank} className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                            item.isUser ? 'bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20' : 'bg-white/[0.03] border-white/5'
                        }`}>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-black w-6 text-center ${
                                    item.rank === 1 ? 'text-amber-400' : item.rank === 2 ? 'text-gray-300' : item.rank === 3 ? 'text-amber-600' : 'text-white/40'
                                }`}>
                                    #{item.rank}
                                </span>
                                <img src={item.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-white/10" />
                                <div>
                                    <p className={`text-xs font-bold ${item.isUser ? 'text-emerald-400 font-extrabold' : 'text-white'}`}>{item.name}</p>
                                    <p className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                                        <Flame size={10} className="fill-amber-400" /> {item.streak} Day Streak
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-black text-emerald-400">{item.xp} XP</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─── MAIN ROADMAP COMPONENT ──────────────────────────────
const RoadmapScreen = ({ course, onStart, onBack, onChapterClick, onModuleClick }) => {
    const [expandedModules, setExpandedModules] = useState({});
    const [progressData, setProgressData] = useState(null);
    const [loadingProgress, setLoadingProgress] = useState(true);
    const [certificateUrl, setCertificateUrl] = useState(null);
    const [isSticky, setIsSticky] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [animatingModules, setAnimatingModules] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [scrollProgress, setScrollProgress] = useState(0);
    const [showJumpButton, setShowJumpButton] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    
    // Daily Streak state
    const [streakData, setStreakData] = useState({ currentStreak: 1, longestStreak: 1, streakAlive: true });

    const buttonSentinelRef = useRef(null);
    const moduleRefs = useRef({});
    const searchInputRef = useRef(null);
    const confettiTriggeredRef = useRef(false);
    const autoScrolledRef = useRef(false);

    // Sticky detection for mobile action bar
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const sentinel = buttonSentinelRef.current;
        if (!sentinel) return;
        const observer = new IntersectionObserver(
            ([entry]) => setIsSticky(!entry.isIntersecting),
            { threshold: 0, rootMargin: '0px 0px -60px 0px' }
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, []);

    // Certificate URL from localStorage
    useEffect(() => {
        if (!course?._id) return;
        const stored = localStorage.getItem(`certificate_${course._id}`);
        setCertificateUrl(stored || null);
    }, [course?._id]);

    // Fetch user streak data & log streak
    useEffect(() => {
        const handleStreak = async () => {
            try {
                // Log activity
                await fetch(`${BASE_URL}/engagement/streak/log`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                // Fetch streak info
                const res = await fetch(`${BASE_URL}/engagement/streak`, { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setStreakData({
                        currentStreak: data.currentStreak || 1,
                        longestStreak: data.longestStreak || 1,
                        streakAlive: data.streakAlive !== false
                    });
                }
            } catch (e) {
                console.log("Streak fetch error", e);
            }
        };
        handleStreak();
    }, []);

    // Fetch user progress
    useEffect(() => {
        if (!course?._id) return;
        const fetchProgress = async () => {
            try {
                const res = await fetch(`${BASE_URL}/engagement/progress/${course._id}`, {
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    setProgressData(data);
                }
            } catch (err) {
                console.log("Progress fetch error", err);
            } finally {
                setLoadingProgress(false);
            }
        };
        fetchProgress();
    }, [course?._id]);

    const modules = course?.chapters || [];

    // Search filtering
    const filteredModules = useMemo(() => {
        if (!searchQuery.trim()) return modules;
        const q = searchQuery.toLowerCase();
        return modules.filter(mod => {
            const modMatch = mod.title?.toLowerCase().includes(q);
            const chapterMatch = (mod.modules || []).some(ch =>
                ch.title?.toLowerCase().includes(q)
            );
            return modMatch || chapterMatch;
        });
    }, [modules, searchQuery]);

    const courseModuleCount = modules.reduce((sum, mod) => sum + (mod.modules?.length || 0), 0);
    const progressModuleIds = new Set((progressData?.progress || []).map(p => p.moduleId?.toString()).filter(Boolean));
    const totalChapters = Math.max(courseModuleCount, progressModuleIds.size);
    const completedChapters = progressData?.stats?.completedModules || 0;
    const courseProgress = totalChapters > 0 ? Math.min(100, Math.round((completedChapters / totalChapters) * 100)) : 0;

    // Gamified XP Calculation
    const completedVideosCount = progressData?.stats?.completedModules ? Math.max(0, completedChapters - (progressData?.stats?.quizModules || 0)) : 0;
    const completedQuizzesCount = progressData?.stats?.quizModules || 0;
    const userXp = (completedVideosCount * 50) + (completedQuizzesCount * 100) + (courseProgress === 100 ? 250 : 0);

    // Level Badge Title
    const getUserLevel = (xp) => {
        if (xp >= 1500) return { level: 4, title: 'MASTER SCHOLAR', badge: '🏆' };
        if (xp >= 750) return { level: 3, title: 'KNOWLEDGE RUNNER', badge: '⚡' };
        if (xp >= 250) return { level: 2, title: 'SKILL EXPLORER', badge: '🚀' };
        return { level: 1, title: 'NOVICE LEARNER', badge: '🌱' };
    };

    const userLevel = getUserLevel(userXp);

    // Flat list for checking unlocking order
    const allChaptersFlat = [];
    modules.forEach(mod => {
        (mod.modules || []).forEach(m => {
            allChaptersFlat.push({ moduleId: mod._id, chapterId: m._id });
        });
    });

    const isChapterCompleted = (moduleId, chapterId) => {
        if (!progressData?.progress) return false;
        return progressData.progress.some(
            p => p.chapterId === moduleId && p.moduleId === chapterId && p.completed
        );
    };

    const isChapterUnlocked = (moduleId, chapterId) => {
        const idx = allChaptersFlat.findIndex(m => m.moduleId === moduleId && m.chapterId === chapterId);
        if (idx <= 0) return true;
        for (let i = 0; i < idx; i++) {
            const m = allChaptersFlat[i];
            if (!isChapterCompleted(m.moduleId, m.chapterId)) return false;
        }
        return true;
    };

    const getChapterProgress = (moduleId, chapterId) => {
        if (!progressData?.progress) return 0;
        const p = progressData.progress.find(
            p => p.chapterId === moduleId && p.moduleId === chapterId
        );
        if (!p || !p.totalDuration) return 0;
        return Math.round((p.watchedSeconds / p.totalDuration) * 100);
    };

    const toggleModule = (id) => {
        setExpandedModules(prev => {
            const next = { ...prev, [id]: !prev[id] };
            if (next[id]) {
                setAnimatingModules(prev => new Set([...prev, id]));
                setTimeout(() => {
                    const el = moduleRefs.current[id];
                    if (el) {
                        const rect = el.getBoundingClientRect();
                        if (rect.top < 0 || rect.bottom > window.innerHeight) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }
                }, 100);
                setTimeout(() => setAnimatingModules(prev => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                }), 500);
            }
            return next;
        });
    };

    // Auto-expand first module
    useEffect(() => {
        if (modules.length > 0) {
            const timer = setTimeout(() => {
                setExpandedModules({ [modules[0]._id]: true });
                setAnimatingModules(new Set([modules[0]._id]));
                setTimeout(() => {
                    setAnimatingModules(prev => {
                        const next = new Set(prev);
                        next.delete(modules[0]._id);
                        return next;
                    });
                }, 500);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [modules]);

    // Auto-scroll to current module
    useEffect(() => {
        if (!modules.length || !progressData || autoScrolledRef.current) return;

        const findCurrentModule = () => {
            if (!progressData?.progress?.length) return modules[0]._id;
            const sorted = [...progressData.progress].sort(
                (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
            );
            const latestChapterId = sorted[0]?.chapterId;
            if (!latestChapterId) return modules[0]._id;

            const modIdx = modules.findIndex(m => m._id === latestChapterId);
            if (modIdx >= 0) {
                const mod = modules[modIdx];
                const modChapters = mod.modules || [];
                const allDone = modChapters.every(ch => isChapterCompleted(mod._id, ch._id));
                if (allDone && modIdx < modules.length - 1) {
                    return modules[modIdx + 1]._id;
                }
                return mod._id;
            }
            return modules[0]._id;
        };

        const targetId = findCurrentModule();

        setTimeout(() => {
            const el = moduleRefs.current[targetId];
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                autoScrolledRef.current = true;
            }
        }, 600);
    }, [modules, progressData]);

    // Track scroll progress
    useEffect(() => {
        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
            const scrollable = scrollHeight - clientHeight;
            const progress = scrollable > 0 ? Math.min(100, Math.round((scrollTop / scrollable) * 100)) : 0;
            setScrollProgress(progress);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Show jump button
    useEffect(() => {
        const handleScroll = () => {
            const firstModuleId = modules[0]?._id;
            if (!firstModuleId) return;
            const firstModEl = moduleRefs.current[firstModuleId];
            if (!firstModEl) return;
            const rect = firstModEl.getBoundingClientRect();
            setShowJumpButton(rect.top < -100);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [modules]);

    // Trigger confetti on 100% completion
    useEffect(() => {
        if (courseProgress >= 100 && !confettiTriggeredRef.current) {
            confettiTriggeredRef.current = true;
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
        }
    }, [courseProgress]);

    const allCompleted = courseProgress >= 100;
    const hasProgress = completedChapters > 0;
    const hasCertificate = allCompleted && !!certificateUrl;

    const handleMainAction = () => {
        if (hasCertificate) {
            window.open(certificateUrl, '_blank');
        } else {
            onStart();
        }
    };

    return (
        <div className="rm-root min-h-[100dvh] bg-[#050505] text-white selection:bg-emerald-500 selection:text-black overflow-x-hidden" role="main" aria-label="Course roadmap">
            <style>{FONT_IMPORTS}</style>
            <Confetti active={showConfetti} />
            
            <LeaderboardModal
                isOpen={showLeaderboard}
                onClose={() => setShowLeaderboard(false)}
                currentStreak={streakData.currentStreak}
                userXp={userXp}
            />

            {/* ─── BACKGROUND AMBIENT GLOW ─── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.05] blur-[120px]"
                    style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)' }} />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.04] blur-[100px]"
                    style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
            </div>

            {/* ─── HEADER BAR (GYANN-E STREAK & XP WIDGETS) ─── */}
            <div className="relative z-10">
                <div className="flex items-center justify-between p-4 lg:px-8 lg:py-5 max-w-7xl mx-auto">
                    <button
                        onClick={onBack}
                        className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 group"
                        aria-label="Go back"
                    >
                        <ChevronLeft size={18} className="text-white/80 group-hover:text-white transition-colors" />
                        <span className="hidden sm:inline text-xs font-semibold text-white/70 group-hover:text-white transition-colors pr-1">Back</span>
                    </button>

                    {/* Streak & XP Badges Row */}
                    <div className="flex items-center gap-2">
                        {/* Daily Flame Streak Widget */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-extrabold text-xs shadow-lg shadow-amber-500/10">
                            <Flame size={14} className="fill-amber-400 animate-bounce" />
                            <span>{streakData.currentStreak} DAY STREAK</span>
                        </div>

                        {/* XP Counter Widget */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-xs">
                            <Zap size={14} className="fill-emerald-400" />
                            <span>{userXp} XP</span>
                        </div>

                        {/* Leaderboard Button */}
                        <button
                            onClick={() => setShowLeaderboard(true)}
                            className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-amber-400 transition-all hover:scale-105 active:scale-95"
                            title="View Leaderboard"
                        >
                            <Trophy size={16} />
                        </button>
                    </div>
                </div>

                <div className="lg:max-w-7xl lg:mx-auto lg:px-8 lg:flex lg:gap-10 lg:items-start">

                    {/* ─── LEFT SIDEBAR: HERO & OVERVIEW ─── */}
                    <div className="lg:w-[400px] lg:shrink-0 lg:sticky lg:top-8">
                        <div className="px-5 pb-6 lg:px-0 lg:pb-4">

                            {/* Hero Card */}
                            <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 mb-5 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                                <div className="flex items-start gap-4 mb-4">
                                    {course?.image && (
                                        <div className="relative shrink-0">
                                            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl overflow-hidden ring-1 ring-white/20 shadow-xl">
                                                <img src={course.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-[#050505] border border-emerald-500/40 rounded-xl flex items-center justify-center shadow-lg">
                                                <MapPin size={12} className="text-emerald-400" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                                            <Sparkles size={10} />
                                            <span>{course?.tag || 'MICRO-COURSE'}</span>
                                        </div>
                                        <h1 className="text-xl lg:text-2xl font-black text-white leading-tight tracking-tight mb-1">{course?.title}</h1>
                                        <p className="text-emerald-400 text-xs font-bold italic">{course?.highlight}</p>
                                    </div>
                                </div>

                                {/* User Level Badge */}
                                <div className="mb-3 px-3 py-2 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                                    <span className="text-[10px] font-extrabold text-white/50 uppercase">CURRENT RANK</span>
                                    <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                                        <span>{userLevel.badge}</span> LVL {userLevel.level} • {userLevel.title}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10">
                                    <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 px-3 py-2 rounded-xl">
                                        <Layers size={14} className="text-emerald-400" />
                                        <span className="text-xs font-bold text-white/80">{modules.length} STAGES</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 px-3 py-2 rounded-xl">
                                        <BookOpen size={14} className="text-emerald-400" />
                                        <span className="text-xs font-bold text-white/80">{totalChapters} MARKERS</span>
                                    </div>
                                </div>
                            </div>

                            {/* ─── CURRENT AT CARD (GYANN-E FOCUS) ─── */}
                            {(() => {
                                if (!progressData?.progress || progressData.progress.length === 0 || modules.length === 0) return null;

                                const sortedProgress = [...progressData.progress].sort((a, b) =>
                                    new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
                                );

                                const recentProgressItem = sortedProgress[0];
                                if (!recentProgressItem?.chapterId) return null;

                                const mostRecentModuleId = recentProgressItem.chapterId;
                                const currentMod = modules.find(m => m._id === mostRecentModuleId);
                                if (!currentMod) return null;

                                const modChapters = currentMod.modules || [];
                                const completedInMod = modChapters.filter(m => isChapterCompleted(currentMod._id, m._id)).length;
                                const modTotal = modChapters.length;
                                const modProgress = modTotal > 0 ? Math.round((completedInMod / modTotal) * 100) : 0;
                                const isModComplete = modTotal > 0 && completedInMod === modTotal;

                                const nextChapter = modChapters.find(m =>
                                    !isChapterCompleted(currentMod._id, m._id) &&
                                    isChapterUnlocked(currentMod._id, m._id)
                                );

                                const handleContinue = () => {
                                    if (nextChapter && onChapterClick) {
                                        onChapterClick(currentMod._id, nextChapter._id);
                                    } else if (onModuleClick) {
                                        onModuleClick(currentMod._id);
                                    }
                                };

                                const isCertMod = currentMod.isCertificateModule;
                                const moduleNumber = modules.findIndex(m => m._id === mostRecentModuleId) + 1;

                                return (
                                    <>
                                        <div className="bg-[#121212] border border-emerald-500/30 rounded-3xl p-6 mb-4 shadow-2xl relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-300 to-transparent" />

                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                                    <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
                                                        {isModComplete ? 'Last Checkpoint' : 'Continue Learning'}
                                                    </span>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                                    {isModComplete ? (
                                                        <CheckCircle size={18} />
                                                    ) : isCertMod ? (
                                                        <Award size={18} />
                                                    ) : (
                                                        <Play size={16} className="fill-emerald-400 ml-0.5" />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <span className="text-[10px] font-black text-white/50 uppercase tracking-widest block mb-1">
                                                    STAGE {String(moduleNumber).padStart(2, '0')}
                                                </span>
                                                <h3 className="text-lg font-black text-white leading-tight group-hover:text-emerald-400 transition-colors">
                                                    {currentMod.title || 'Module'}
                                                </h3>
                                            </div>

                                            {/* Progress bar */}
                                            <div className="mb-5">
                                                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                                                    <span className="text-white/60">{completedInMod}/{modTotal} Completed</span>
                                                    <span className="text-emerald-400 font-extrabold">{modProgress}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out"
                                                        style={{ width: `${modProgress}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleContinue}
                                                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] shadow-lg shadow-emerald-500/20"
                                                aria-label={`Continue ${currentMod.title || 'module'}`}
                                            >
                                                <Play size={14} className="fill-black" />
                                                {isModComplete ? 'Review Module' : 'Resume Lesson'}
                                            </button>
                                        </div>

                                        {/* Horizontal Waypoints Bar */}
                                        {modChapters.length > 0 && (
                                            <div className="mb-5">
                                                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                                                    {modChapters.map((ch, chIdx) => {
                                                        const isCompleted = isChapterCompleted(currentMod._id, ch._id);
                                                        const isLocked = !isChapterUnlocked(currentMod._id, ch._id) && !isCompleted;
                                                        const vidProgress = ch.type === 'video' ? getChapterProgress(currentMod._id, ch._id) : 0;

                                                        const handleChapterClick = () => {
                                                            if (!isLocked && onChapterClick) {
                                                                onChapterClick(currentMod._id, ch._id);
                                                            }
                                                        };

                                                        return (
                                                            <button
                                                                key={ch._id || chIdx}
                                                                onClick={handleChapterClick}
                                                                disabled={isLocked}
                                                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                                                                    isLocked
                                                                        ? 'bg-white/[0.02] text-white/30 border border-white/5 cursor-not-allowed'
                                                                        : isCompleted
                                                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                                                                            : ch.type === 'video'
                                                                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20'
                                                                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                                                                }`}
                                                            >
                                                                {isLocked ? <Lock size={12} /> : isCompleted ? <CheckCircle size={12} /> : ch.type === 'video' ? <Video size={12} /> : <CheckSquare size={12} />}
                                                                <span>{ch.type === 'video' ? `V${chIdx + 1}` : `Q${chIdx + 1}`}</span>
                                                                {vidProgress > 0 && !isCompleted && (
                                                                    <span className="text-[10px] text-emerald-400 font-bold">{vidProgress}%</span>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}

                            {/* Overall Progress Card */}
                            {loadingProgress ? (
                                <div className="bg-[#121212] border border-white/10 rounded-3xl p-5 mb-4 animate-pulse">
                                    <div className="h-4 w-32 bg-white/5 rounded-full mb-3" />
                                    <div className="h-10 w-full bg-white/5 rounded-xl" />
                                </div>
                            ) : (
                                <div className="bg-[#121212] border border-white/10 rounded-3xl p-5 mb-4 shadow-xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Overall Progress</span>
                                        <span className="text-sm font-black text-emerald-400">{courseProgress}%</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <CircularProgress progress={courseProgress} size={52} strokeWidth={4} label="Course completion" />
                                        <div className="flex-1 min-w-0">
                                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-2">
                                                <div
                                                    className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                                                    style={{ width: `${courseProgress}%` }}
                                                />
                                            </div>
                                            <p className="text-[11px] font-bold text-white/50 flex justify-between">
                                                <span>{completedChapters}/{totalChapters} Markers Passed</span>
                                                {allCompleted && <span className="text-emerald-400 font-black">Completed!</span>}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-2.5 mb-5">
                                <div className="bg-[#121212] border border-white/10 rounded-2xl p-3 text-center">
                                    <Video size={16} className="text-blue-400 mx-auto mb-1" />
                                    <p className="text-sm font-black text-white">{progressData?.stats?.videoModules || 0}</p>
                                    <p className="text-[9px] font-bold text-white/40 uppercase">Reels</p>
                                </div>
                                <div className="bg-[#121212] border border-white/10 rounded-2xl p-3 text-center">
                                    <CheckSquare size={16} className="text-amber-400 mx-auto mb-1" />
                                    <p className="text-sm font-black text-white">{progressData?.stats?.quizModules || 0}</p>
                                    <p className="text-[9px] font-bold text-white/40 uppercase">Quizzes</p>
                                </div>
                                <div className="bg-[#121212] border border-white/10 rounded-2xl p-3 text-center">
                                    <Flag size={16} className="text-emerald-400 mx-auto mb-1" />
                                    <p className="text-sm font-black text-white">{completedChapters}</p>
                                    <p className="text-[9px] font-bold text-white/40 uppercase">Logged</p>
                                </div>
                            </div>

                            <div ref={buttonSentinelRef} className="h-1" />

                            {/* Primary Action Button */}
                            <button
                                onClick={handleMainAction}
                                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] shadow-xl ${
                                    hasCertificate
                                        ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                                        : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                                } ${isSticky ? 'lg:opacity-100 opacity-0 pointer-events-none' : 'opacity-100'}`}
                                aria-label={hasCertificate ? 'View certificate' : allCompleted ? 'Continue learning' : hasProgress ? 'Continue learning' : 'Start learning'}
                            >
                                {hasCertificate ? (
                                    <><Award size={18} /> View Certificate</>
                                ) : allCompleted ? (
                                    <><Sparkles size={18} /> Continue Learning</>
                                ) : hasProgress ? (
                                    <><Play size={18} className="fill-black" /> Resume Skill Path</>
                                ) : (
                                    <><Compass size={18} /> Start Skill Path</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* ─── RIGHT COLUMN: GYANN-E SKILL PATH TIMELINE ─── */}
                    <div className="flex-1 min-w-0 relative" role="navigation" aria-label="Course learning path">

                        {/* Search & Header */}
                        <div className="px-5 lg:px-0 mb-6 space-y-3">
                            <div className="relative">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search modules & chapters…"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#121212] border border-white/10 focus:border-emerald-500/50 rounded-2xl py-3 pl-11 pr-10 text-xs font-semibold text-white placeholder:text-white/30 focus:outline-none transition-all"
                                    aria-label="Search modules and chapters"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => { setSearchQuery(''); searchInputRef.current?.focus(); }}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* Scroll progress bar */}
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 transition-all duration-150"
                                    style={{ width: `${scrollProgress}%` }}
                                />
                            </div>
                        </div>

                        {/* Search Empty State */}
                        {searchQuery && filteredModules.length === 0 && (
                            <div className="text-center py-16 px-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3 text-white/40">
                                    <Search size={20} />
                                </div>
                                <p className="text-sm font-bold text-white/70">No results found for "{searchQuery}"</p>
                            </div>
                        )}

                        {/* ─── VERTICAL GYANN-E NODE TIMELINE ─── */}
                        <div className="px-4 lg:px-0 pb-12 relative">
                            {/* Vertical connecting line */}
                            <div className="absolute left-[27px] lg:left-[27px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-emerald-500/40 via-emerald-500/20 to-white/5 pointer-events-none" />

                            {filteredModules.map((mod, modIdx) => {
                                const isExpanded = expandedModules[mod._id];
                                const modChapters = mod.modules || [];
                                const completedInModule = modChapters.filter(m => isChapterCompleted(mod._id, m._id)).length;
                                const videoCount = modChapters.filter(m => m.type === 'video').length;
                                const quizCount = modChapters.filter(m => m.type === 'quiz').length;
                                const isCertModule = modIdx === filteredModules.length - 1 && filteredModules.length > 0;
                                const isAllComplete = modChapters.length > 0 && completedInModule === modChapters.length;
                                const modProgress = modChapters.length > 0 ? Math.round((completedInModule / modChapters.length) * 100) : 0;
                                const isAnimating = animatingModules.has(mod._id);

                                return (
                                    <div
                                        key={mod._id}
                                        ref={el => { moduleRefs.current[mod._id] = el; }}
                                        className="relative pl-14 mb-5 group"
                                    >
                                        {/* Milestone Node Badge */}
                                        <div className="absolute left-3 top-4 z-10 -translate-x-1/2">
                                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-xl ${
                                                isAllComplete
                                                    ? 'bg-emerald-500 border-emerald-400 text-black shadow-emerald-500/30 scale-105'
                                                    : completedInModule > 0
                                                        ? 'bg-[#121212] border-emerald-400 text-emerald-400 ring-4 ring-emerald-500/10'
                                                        : isCertModule
                                                            ? 'bg-[#121212] border-amber-400 text-amber-400'
                                                            : 'bg-[#121212] border-white/20 text-white/40'
                                            }`}>
                                                {isAllComplete ? (
                                                    <CheckCircle size={14} strokeWidth={3} />
                                                ) : isCertModule ? (
                                                    <Award size={14} />
                                                ) : (
                                                    <span className="text-xs font-black">{modIdx + 1}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Module Card */}
                                        <div className={`bg-[#121212] border rounded-3xl overflow-hidden transition-all duration-300 ${
                                            isCertModule
                                                ? 'border-amber-500/30 hover:border-amber-500/50'
                                                : isAllComplete
                                                    ? 'border-emerald-500/30 hover:border-emerald-500/50'
                                                    : 'border-white/10 hover:border-white/20'
                                        } ${isExpanded ? 'shadow-2xl' : ''}`}>

                                            {/* Module Header Row */}
                                            <div className="flex items-center justify-between">
                                                <button
                                                    onClick={() => { if (onModuleClick) onModuleClick(mod._id); }}
                                                    className="flex-1 p-5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors text-left"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                                                STAGE {String(modIdx + 1).padStart(2, '0')}
                                                            </span>
                                                            {isCertModule && (
                                                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                                                                    <Award size={10} /> FINAL CERTIFICATE
                                                                </span>
                                                            )}
                                                            {isAllComplete && !isCertModule && (
                                                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                                    COMPLETED
                                                                </span>
                                                            )}
                                                        </div>

                                                        <h3 className="text-base lg:text-lg font-black text-white leading-tight">
                                                            {isCertModule ? 'Certificate Module' : (mod.title || 'Module')}
                                                        </h3>

                                                        <div className="flex items-center gap-3 mt-1.5 text-[11px] font-bold text-white/40">
                                                            <span>
                                                                {isCertModule
                                                                    ? `${modChapters.length} Quiz`
                                                                    : `${videoCount > 0 ? `${videoCount} Reels` : ''}${videoCount > 0 && quizCount > 0 ? ' • ' : ''}${quizCount > 0 ? `${quizCount} Quizzes` : ''}`
                                                                }
                                                            </span>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock size={11} />
                                                                {Math.round(videoCount * 1.5 + quizCount * 0.5)} min
                                                            </span>
                                                        </div>
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={() => toggleModule(mod._id)}
                                                    className="p-5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors"
                                                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                                                >
                                                    <span className="text-xs font-extrabold text-emerald-400">{modProgress}%</span>
                                                    <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-emerald-400 bg-emerald-500/10' : ''}`}>
                                                        <ChevronDown size={16} />
                                                    </div>
                                                </button>
                                            </div>

                                            {/* Chapters List */}
                                            {isExpanded && (
                                                <div className="border-t border-white/10 p-3 bg-black/20 space-y-2">
                                                    {modChapters.length === 0 ? (
                                                        <p className="text-xs font-bold text-white/30 text-center py-3 uppercase">No lessons available</p>
                                                    ) : (
                                                        modChapters.map((ch, chIdx) => {
                                                            const isCompleted = isChapterCompleted(mod._id, ch._id);
                                                            const isLocked = !isChapterUnlocked(mod._id, ch._id) && !isCompleted;
                                                            const vidProgress = getChapterProgress(mod._id, ch._id);

                                                            const handleChapterClick = () => {
                                                                if (!isLocked && onChapterClick) {
                                                                    onChapterClick(mod._id, ch._id);
                                                                }
                                                            };

                                                            return (
                                                                <div
                                                                    key={ch._id || chIdx}
                                                                    onClick={handleChapterClick}
                                                                    className={`flex items-center gap-3.5 p-3 rounded-2xl transition-all cursor-pointer ${
                                                                        isCompleted
                                                                            ? 'bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20'
                                                                            : isLocked
                                                                                ? 'bg-white/[0.02] border border-white/5 opacity-50 cursor-not-allowed'
                                                                                : 'bg-white/[0.04] border border-white/10 hover:bg-white/[0.08]'
                                                                    }`}
                                                                >
                                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                                                                        isLocked
                                                                            ? 'bg-white/5 text-white/30'
                                                                            : isCompleted
                                                                                ? 'bg-emerald-500 text-black'
                                                                                : ch.type === 'video'
                                                                                    ? 'bg-blue-500/20 text-blue-400'
                                                                                    : 'bg-amber-500/20 text-amber-400'
                                                                    }`}>
                                                                        {isLocked ? <Lock size={14} /> : isCompleted ? <CheckCircle size={16} strokeWidth={2.5} /> : ch.type === 'video' ? <Video size={16} /> : <CheckSquare size={16} />}
                                                                    </div>

                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2 mb-0.5">
                                                                            <p className={`text-xs font-bold truncate ${isCompleted ? 'text-emerald-400' : isLocked ? 'text-white/40' : 'text-white'}`}>
                                                                                {ch.type === 'video' ? ch.title : 'Quiz Module'}
                                                                            </p>
                                                                        </div>
                                                                        <p className="text-[10px] font-bold text-white/40">
                                                                            {isLocked ? (
                                                                                'Complete previous marker to unlock'
                                                                            ) : (
                                                                                <span>
                                                                                    {ch.type === 'video' ? 'Reel Video' : 'Interactive Check'}
                                                                                    {vidProgress > 0 && !isCompleted && (
                                                                                        <span className="ml-2 text-emerald-400">• {vidProgress}% Watched</span>
                                                                                    )}
                                                                                </span>
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Floating Jump to Current Button */}
                        {showJumpButton && !searchQuery && (
                            <button
                                onClick={() => {
                                    if (!modules.length) return;
                                    let targetId = modules[0]._id;
                                    for (const mod of modules) {
                                        const modChapters = mod.modules || [];
                                        const allDone = modChapters.every(ch => isChapterCompleted(mod._id, ch._id));
                                        if (!allDone) {
                                            targetId = mod._id;
                                            break;
                                        }
                                    }
                                    const el = moduleRefs.current[targetId];
                                    if (el) {
                                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }
                                }}
                                className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-[#121212] border border-emerald-500/40 text-emerald-400 shadow-2xl hover:scale-110 active:scale-95 transition-all"
                                aria-label="Jump to current module"
                            >
                                <ArrowUp size={20} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile Bottom Action Bar */}
                <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
                    isSticky ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
                }`}>
                    <div className="bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent pt-6 pb-4 px-4">
                        <button
                            onClick={handleMainAction}
                            className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-emerald-500 text-black shadow-xl shadow-emerald-500/20 active:scale-95 transition-transform"
                        >
                            {hasCertificate ? (
                                <><Award size={18} /> View Certificate</>
                            ) : allCompleted ? (
                                <><Sparkles size={18} /> Continue Learning</>
                            ) : hasProgress ? (
                                <><Play size={18} className="fill-black" /> Resume Skill Path</>
                            ) : (
                                <><Compass size={18} /> Start Skill Path</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Custom CSS overrides for Satoshi Font */}
            <style>{`
                .rm-root, .rm-root * {
                    font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default RoadmapScreen;