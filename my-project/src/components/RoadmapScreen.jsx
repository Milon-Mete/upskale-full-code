import React, { useState, useEffect, useRef } from 'react';
import {
    Play, CheckCircle, Lock, Award, ChevronRight, ChevronLeft,
    BookOpen, Clock, Info, HelpCircle, Flame, Zap
} from 'lucide-react';
import { BASE_URL } from '../config';

/* ─────────────────────────────────────────────────────────────
   BITESIZE COURSE PREVIEW

   Design language: calm dark surface, a single green accent, and a
   numbered lesson timeline. Everything that isn't progress, lessons
   or the certificate is deliberately absent — the page has one job,
   which is getting the learner into lesson one.

     --bg        #0a0a0c   page
     --card      #17171a   resting card
     --line      rgba(255,255,255,0.07)
     --green     #10b981   the only accent
   ───────────────────────────────────────────────────────────── */

const FONT_IMPORTS = `@import url('https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400&display=swap');`;

const GREEN = '#10b981';
const GOLD = '#c9a227';
const CARD = '#17171a';
const LINE = 'rgba(255,255,255,0.07)';

// Dotted rail drawn between the numbered lesson nodes.
const DOTTED_RAIL = 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.20) 0 3px, transparent 3px 9px)';

// Rank thresholds. These sit on LIFETIME xp (every bite-size course the
// learner has ever touched), so they're set roughly one course apart —
// a typical course is worth somewhere around 1,000 XP.
const RANKS = [
    { min: 7500, level: 4, title: 'Master Scholar' },
    { min: 3000, level: 3, title: 'Knowledge Runner' },
    { min: 1000, level: 2, title: 'Skill Explorer' },
    { min: 0, level: 1, title: 'Novice Learner' }
];

const getRank = (xp) => RANKS.find(r => xp >= r.min) || RANKS[RANKS.length - 1];

// ─── CONFETTI ────────────────────────────────────────────────
// Fires once when the course hits 100%. Deliberately restrained:
// brand colours only, and it fades out rather than piling up.
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

        const colors = [GREEN, '#34d399', '#ffffff', GOLD];
        const pieces = Array.from({ length: 70 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 5 + 3,
            h: Math.random() * 3 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            speed: Math.random() * 1.8 + 1.4,
            rotationSpeed: Math.random() * 5 - 2.5,
            swing: Math.random() * 1.4 - 0.7,
            opacity: 1
        }));

        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed > 2600) {
                pieces.forEach(p => { p.opacity -= 0.025; });
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

// ─── STAT CELL ───────────────────────────────────────────────
const Stat = ({ icon: Icon, value, label, tone, divider }) => (
    <div
        className="flex-1 min-w-0 px-3 py-3.5 text-center"
        style={divider ? { borderLeft: `1px solid ${LINE}` } : undefined}
    >
        <div className="flex items-center justify-center gap-1.5 mb-1">
            {Icon && <Icon size={13} style={{ color: tone || 'rgba(255,255,255,0.45)' }} />}
            <span className="text-[16px] font-bold leading-none" style={{ color: tone || '#fff' }}>
                {value}
            </span>
        </div>
        <p className="text-[11px] font-medium text-white/40 truncate">{label}</p>
    </div>
);

// ─── CERTIFICATE THUMBNAIL ───────────────────────────────────
const CertificateThumb = ({ locked = true, size = 'md' }) => {
    const dims = size === 'sm' ? 'w-[64px] h-[46px]' : 'w-[78px] h-[56px]';
    return (
        <div
            className={`${dims} rounded-lg shrink-0 relative overflow-hidden border border-white/10`}
            style={{ background: 'linear-gradient(145deg, #ece0cb, #cdb995)' }}
            aria-hidden="true"
        >
            <div className="absolute inset-0 px-2.5 flex flex-col justify-center gap-[3px]">
                <div className="h-[3px] w-9 rounded-full bg-black/25" />
                <div className="h-[2px] w-11 rounded-full bg-black/15" />
                <div className="h-[2px] w-8 rounded-full bg-black/15" />
            </div>
            <div
                className="absolute bottom-1 right-1 w-[15px] h-[15px] rounded-full flex items-center justify-center"
                style={{ background: '#c9a227' }}
            >
                <Award size={9} className="text-white" />
            </div>
            {locked && (
                <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                    <Lock size={13} className="text-white/85" />
                </div>
            )}
        </div>
    );
};

// ─── MAIN COURSE PREVIEW ─────────────────────────────────────
const RoadmapScreen = ({ course, onStart, onBack, onChapterClick, onModuleClick }) => {
    const [expandedModules, setExpandedModules] = useState({});
    const [progressData, setProgressData] = useState(null);
    const [loadingProgress, setLoadingProgress] = useState(true);
    const [certificateUrl, setCertificateUrl] = useState(null);
    const [showInfo, setShowInfo] = useState(false);
    const [streakData, setStreakData] = useState({ currentStreak: 0, longestStreak: 0, streakAlive: true });
    const [lifetimeXp, setLifetimeXp] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const confettiFiredRef = useRef(false);

    // Certificate URL from localStorage
    useEffect(() => {
        if (!course?._id) return;
        const stored = localStorage.getItem(`certificate_${course._id}`);
        setCertificateUrl(stored || null);
    }, [course?._id]);

    // Log today's activity, then read the streak back from the server so the
    // number on screen is whatever the DB actually holds.
    useEffect(() => {
        const syncStreak = async () => {
            try {
                await fetch(`${BASE_URL}/engagement/streak/log`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                const res = await fetch(`${BASE_URL}/engagement/streak`, { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setStreakData({
                        currentStreak: data.currentStreak || 0,
                        longestStreak: data.longestStreak || 0,
                        streakAlive: data.streakAlive !== false
                    });
                }
            } catch (e) {
                console.log("Streak sync error", e);
            }
        };
        syncStreak();
    }, []);

    // Lifetime XP across every bite-size course — the server does the counting.
    useEffect(() => {
        const fetchXp = async () => {
            try {
                const res = await fetch(`${BASE_URL}/engagement/xp`, { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    if (typeof data.xp === 'number') setLifetimeXp(data.xp);
                }
            } catch (e) {
                console.log("XP fetch error", e);
            }
        };
        fetchXp();
    }, [course?._id]);

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

    // The certificate lives in its own row at the end of the timeline, so it is
    // split out of the numbered lesson list. Prefer the explicit flag, and fall
    // back to "last module" which is how this data has always been shaped.
    const flaggedCertIdx = modules.findIndex(m => m.isCertificateModule === true);
    const certIdx = flaggedCertIdx >= 0 ? flaggedCertIdx : modules.length - 1;
    const certModule = modules.length > 0 ? modules[certIdx] : null;
    const lessonModules = modules.filter((_, i) => i !== certIdx);

    const courseModuleCount = modules.reduce((sum, mod) => sum + (mod.modules?.length || 0), 0);
    const progressModuleIds = new Set((progressData?.progress || []).map(p => p.moduleId?.toString()).filter(Boolean));
    const totalChapters = Math.max(courseModuleCount, progressModuleIds.size);
    const completedChapters = progressData?.stats?.completedModules || 0;
    const courseProgress = totalChapters > 0 ? Math.min(100, Math.round((completedChapters / totalChapters) * 100)) : 0;
    const lessonsRemaining = Math.max(0, totalChapters - completedChapters);

    // Rough runtime estimate: reels run ~1.5 min, quizzes ~0.5 min.
    const totalVideos = modules.reduce((sum, mod) => sum + (mod.modules || []).filter(m => m.type === 'video').length, 0);
    const totalQuizzes = modules.reduce((sum, mod) => sum + (mod.modules || []).filter(m => m.type !== 'video').length, 0);
    const estimatedMinutes = Math.round(totalVideos * 1.5 + totalQuizzes * 0.5);

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

    const moduleIsComplete = (mod) => {
        const chapters = mod.modules || [];
        return chapters.length > 0 && chapters.every(ch => isChapterCompleted(mod._id, ch._id));
    };

    // A module is open once its first chapter is reachable.
    const moduleIsUnlocked = (mod) => {
        const chapters = mod.modules || [];
        if (chapters.length === 0) return true;
        return isChapterUnlocked(mod._id, chapters[0]._id);
    };

    const toggleModule = (id) => {
        setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const allCompleted = totalChapters > 0 && courseProgress >= 100;
    const hasProgress = completedChapters > 0;
    const hasCertificate = allCompleted && !!certificateUrl;

    const rank = getRank(lifetimeXp || 0);

    // Celebrate once, the first time the course reads as finished.
    useEffect(() => {
        if (allCompleted && !confettiFiredRef.current) {
            confettiFiredRef.current = true;
            setShowConfetti(true);
            const t = setTimeout(() => setShowConfetti(false), 3200);
            return () => clearTimeout(t);
        }
    }, [allCompleted]);

    // The first module the learner hasn't finished — gets the accent treatment.
    const activeModuleId = lessonModules.find(mod => !moduleIsComplete(mod))?._id || null;

    const handleMainAction = () => {
        if (hasCertificate) {
            window.open(certificateUrl, '_blank');
        } else {
            onStart();
        }
    };

    const mainActionLabel = hasCertificate
        ? 'View Certificate'
        : hasProgress
            ? 'Continue Learning'
            : 'Start Learning';

    return (
        <div className="rm-root min-h-[100dvh] bg-[#0a0a0c] text-white overflow-x-hidden" role="main" aria-label="Course preview">
            <style>{FONT_IMPORTS}</style>
            <Confetti active={showConfetti} />

            <div className="max-w-2xl mx-auto pb-32">

                {/* ─── HEADER ─── */}
                <header className="sticky top-0 z-30 bg-[#0a0a0c]/90 backdrop-blur-xl">
                    <div className="flex items-start gap-3 px-4 pt-4 pb-3">
                        <button
                            onClick={onBack}
                            className="p-1 -ml-1 mt-0.5 text-white/70 hover:text-white transition-colors shrink-0"
                            aria-label="Go back"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <h1 className="flex-1 min-w-0 text-[19px] leading-[1.3] font-bold text-white tracking-tight">
                            {course?.title || 'Course'}
                        </h1>

                        <button
                            onClick={() => setShowInfo(v => !v)}
                            className={`p-1 mt-0.5 shrink-0 transition-colors ${showInfo ? 'text-emerald-400' : 'text-white/50 hover:text-white'}`}
                            aria-label="About this course"
                            aria-expanded={showInfo}
                        >
                            <Info size={21} />
                        </button>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-3 px-4 pb-3 text-[13px] font-medium text-white/55">
                        <span className="flex items-center gap-1.5">
                            <Clock size={14} className="text-white/40" />
                            {estimatedMinutes} Min
                        </span>
                        <span className="w-px h-3.5 bg-white/15" />
                        <span className="flex items-center gap-1.5">
                            <BookOpen size={14} className="text-white/40" />
                            {lessonModules.length} {lessonModules.length === 1 ? 'Lesson' : 'Lessons'}
                        </span>
                    </div>
                </header>

                {/* ─── COURSE INFO (collapsed by default) ─── */}
                {showInfo && (course?.highlight || course?.description) && (
                    <div className="mx-4 mb-4 rounded-2xl p-4 border" style={{ background: CARD, borderColor: LINE }}>
                        {course?.highlight && (
                            <p className="text-[13px] font-bold text-emerald-400 mb-1.5">{course.highlight}</p>
                        )}
                        {course?.description && (
                            <p className="text-[13px] leading-relaxed text-white/60">{course.description}</p>
                        )}
                    </div>
                )}

                {/* ─── PROGRESS CARD ─── */}
                <div className="px-4 mb-7">
                    {loadingProgress ? (
                        <div className="rounded-2xl p-4 border animate-pulse" style={{ background: CARD, borderColor: LINE }}>
                            <div className="h-3.5 w-28 bg-white/[0.06] rounded-full mb-3.5" />
                            <div className="h-1.5 w-full bg-white/[0.06] rounded-full mb-3.5" />
                            <div className="h-3 w-48 bg-white/[0.06] rounded-full" />
                        </div>
                    ) : (
                        <div className="rounded-2xl p-4 border flex items-center gap-4" style={{ background: CARD, borderColor: LINE }}>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-medium text-white/55 mb-2.5">
                                    <span className="font-black text-emerald-400">{courseProgress}%</span> Completed
                                </p>

                                <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden mb-2.5">
                                    <div
                                        className="h-full rounded-full transition-all duration-700 ease-out"
                                        style={{ width: `${courseProgress}%`, background: GREEN }}
                                        role="progressbar"
                                        aria-valuenow={courseProgress}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-label="Course completion"
                                    />
                                </div>

                                <p className="text-[12px] font-medium text-white/45 truncate">
                                    {allCompleted
                                        ? 'Certificate unlocked'
                                        : `${lessonsRemaining} ${lessonsRemaining === 1 ? 'Lesson' : 'Lessons'} Left To Unlock Certificate`}
                                </p>
                            </div>

                            <CertificateThumb locked={!allCompleted} />
                        </div>
                    )}
                </div>

                {/* ─── STREAK · XP · RANK ─── */}
                {!loadingProgress && (
                    <div className="px-4 mb-7">
                        <div className="rounded-2xl border flex items-stretch" style={{ background: CARD, borderColor: LINE }}>
                            <Stat
                                icon={Flame}
                                tone={streakData.streakAlive ? '#e0a33a' : 'rgba(255,255,255,0.35)'}
                                value={streakData.currentStreak}
                                label="Day streak"
                            />
                            <Stat
                                icon={Zap}
                                tone={GREEN}
                                value={lifetimeXp === null ? '—' : lifetimeXp.toLocaleString()}
                                label="Total XP"
                                divider
                            />
                            <Stat
                                value={`Lvl ${rank.level}`}
                                label={rank.title}
                                divider
                            />
                        </div>
                    </div>
                )}

                {/* ─── LESSON TIMELINE ─── */}
                <div className="px-4" role="navigation" aria-label="Course lessons">
                    {lessonModules.map((mod, modIdx) => {
                        const isExpanded = expandedModules[mod._id];
                        const modChapters = mod.modules || [];
                        const videoCount = modChapters.filter(m => m.type === 'video').length;
                        const quizCount = modChapters.filter(m => m.type !== 'video').length;
                        const isComplete = moduleIsComplete(mod);
                        const isUnlocked = moduleIsUnlocked(mod);
                        const isActive = mod._id === activeModuleId;
                        const isLast = modIdx === lessonModules.length - 1;

                        return (
                            <div key={mod._id} className="relative pl-[52px] pb-3">

                                {/* Dotted rail down to the next node */}
                                {!(isLast && !certModule) && (
                                    <div
                                        className="absolute left-[19px] top-[46px] bottom-0 w-px pointer-events-none"
                                        style={{ background: DOTTED_RAIL }}
                                        aria-hidden="true"
                                    />
                                )}

                                {/* Numbered node */}
                                <div
                                    className={`absolute left-0 top-1.5 w-[39px] h-[39px] rounded-xl border-[1.5px] flex items-center justify-center transition-colors ${
                                        isComplete
                                            ? 'text-black'
                                            : isActive
                                                ? 'text-emerald-400'
                                                : 'text-white/45'
                                    }`}
                                    style={{
                                        background: isComplete ? GREEN : 'transparent',
                                        borderColor: isComplete ? GREEN : isActive ? GREEN : 'rgba(255,255,255,0.16)'
                                    }}
                                >
                                    {isComplete
                                        ? <CheckCircle size={17} strokeWidth={2.5} />
                                        : <span className="text-[14px] font-bold">{modIdx + 1}</span>}
                                </div>

                                {/* Lesson card */}
                                <div
                                    className="rounded-2xl border overflow-hidden transition-colors"
                                    style={{
                                        background: isActive ? 'rgba(16,185,129,0.06)' : CARD,
                                        borderColor: isActive ? 'rgba(16,185,129,0.28)' : LINE
                                    }}
                                >
                                    <button
                                        onClick={() => toggleModule(mod._id)}
                                        className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-white/[0.02] transition-colors"
                                        aria-expanded={!!isExpanded}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`text-[15px] font-bold leading-snug mb-1.5 ${isUnlocked ? 'text-white' : 'text-white/45'}`}>
                                                {mod.title || `Lesson ${modIdx + 1}`}
                                            </h3>

                                            <div className="flex items-center gap-3 text-[12px] font-medium text-white/45">
                                                {videoCount > 0 && (
                                                    <span className="flex items-center gap-1.5">
                                                        <Play size={12} className="fill-white/45 text-white/45" />
                                                        {videoCount} {videoCount === 1 ? 'Video' : 'Videos'}
                                                    </span>
                                                )}
                                                {videoCount > 0 && quizCount > 0 && (
                                                    <span className="w-[3px] h-[3px] rounded-full bg-white/25" />
                                                )}
                                                {quizCount > 0 && (
                                                    <span className="flex items-center gap-1.5">
                                                        <HelpCircle size={12} className="text-white/45" />
                                                        {quizCount} Quiz
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {!isUnlocked && <Lock size={15} className="text-white/30 shrink-0" />}

                                        <ChevronRight
                                            size={19}
                                            className={`text-white/35 shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
                                        />
                                    </button>

                                    {/* Chapters */}
                                    {isExpanded && (
                                        <div className="px-3 pb-3 pt-0.5 space-y-1.5">
                                            {modChapters.length === 0 ? (
                                                <p className="text-[12px] font-medium text-white/30 text-center py-3">
                                                    No lessons available yet
                                                </p>
                                            ) : (
                                                modChapters.map((ch, chIdx) => {
                                                    const chCompleted = isChapterCompleted(mod._id, ch._id);
                                                    const chLocked = !isChapterUnlocked(mod._id, ch._id) && !chCompleted;
                                                    const watched = getChapterProgress(mod._id, ch._id);

                                                    return (
                                                        <button
                                                            key={ch._id || chIdx}
                                                            onClick={() => {
                                                                if (!chLocked && onChapterClick) onChapterClick(mod._id, ch._id);
                                                            }}
                                                            disabled={chLocked}
                                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                                                                chLocked
                                                                    ? 'bg-white/[0.02] cursor-not-allowed'
                                                                    : 'bg-white/[0.04] hover:bg-white/[0.07]'
                                                            }`}
                                                        >
                                                            <div
                                                                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                                                    chCompleted ? 'text-black' : 'bg-white/[0.06] text-white/50'
                                                                }`}
                                                                style={chCompleted ? { background: GREEN } : undefined}
                                                            >
                                                                {chLocked
                                                                    ? <Lock size={12} />
                                                                    : chCompleted
                                                                        ? <CheckCircle size={14} strokeWidth={2.5} />
                                                                        : ch.type === 'video'
                                                                            ? <Play size={12} className="fill-current" />
                                                                            : <HelpCircle size={13} />}
                                                            </div>

                                                            <span className={`flex-1 min-w-0 text-[13px] font-medium truncate ${
                                                                chLocked ? 'text-white/35' : chCompleted ? 'text-white/70' : 'text-white/85'
                                                            }`}>
                                                                {ch.type === 'video' ? (ch.title || `Video ${chIdx + 1}`) : 'Quiz'}
                                                            </span>

                                                            {watched > 0 && !chCompleted && !chLocked && (
                                                                <span className="text-[11px] font-bold text-emerald-400 shrink-0">{watched}%</span>
                                                            )}
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* ─── CERTIFICATE ROW ─── */}
                    {certModule && (
                        <div className="relative pl-[52px]">
                            <div
                                className={`absolute left-0 top-1.5 w-[39px] h-[39px] rounded-xl border-[1.5px] flex items-center justify-center ${
                                    allCompleted ? 'text-black' : 'text-amber-400/70'
                                }`}
                                style={{
                                    background: allCompleted ? '#c9a227' : 'transparent',
                                    borderColor: allCompleted ? '#c9a227' : 'rgba(201,162,39,0.45)'
                                }}
                            >
                                <Award size={17} />
                            </div>

                            <button
                                onClick={() => {
                                    if (hasCertificate) window.open(certificateUrl, '_blank');
                                    else if (allCompleted && onModuleClick) onModuleClick(certModule._id);
                                }}
                                disabled={!allCompleted}
                                className={`w-full rounded-2xl border px-4 py-3.5 flex items-center gap-4 text-left transition-colors ${
                                    allCompleted ? 'hover:bg-white/[0.03]' : 'cursor-not-allowed'
                                }`}
                                style={{
                                    background: 'rgba(201,162,39,0.05)',
                                    borderColor: 'rgba(201,162,39,0.22)'
                                }}
                            >
                                <div className="flex-1 min-w-0">
                                    <h3 className={`text-[15px] font-bold leading-snug mb-1 ${allCompleted ? 'text-white' : 'text-white/70'}`}>
                                        Get Course Certificate
                                    </h3>
                                    <p className="text-[12px] font-medium text-white/45">
                                        {allCompleted
                                            ? (hasCertificate ? 'Tap to view your certificate' : 'Ready to claim')
                                            : `${lessonsRemaining} ${lessonsRemaining === 1 ? 'Lesson' : 'Lessons'} Left To Unlock`}
                                    </p>
                                </div>

                                <CertificateThumb locked={!allCompleted} size="sm" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── STICKY PRIMARY ACTION ─── */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c] to-transparent pt-8">
                <div
                    className="max-w-2xl mx-auto px-4 pb-4"
                    style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
                >
                    <button
                        onClick={handleMainAction}
                        className="w-full py-4 rounded-2xl font-bold text-[15px] text-black flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                        style={{ background: GREEN }}
                        aria-label={mainActionLabel}
                    >
                        {hasCertificate ? <Award size={18} /> : <Play size={16} className="fill-black" />}
                        {mainActionLabel}
                    </button>
                </div>
            </div>

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
