import React, { useState, useEffect, useRef, useCallback, Component } from 'react';
import { useParams, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
    Loader2, Lock, Play, ChevronLeft, CheckCircle, ShieldCheck,
    Heart, Share2, Bookmark, Award, ArrowRight, Star, Check,
    ChevronDown, ChevronUp, Globe, CheckCircle2, MessageCircle, X,
    MonitorUp, Monitor, FastForward, MoreHorizontal, RotateCcw, AlertTriangle, Volume2, XCircle
} from 'lucide-react';
import { BASE_URL } from '../../config';
import FeedbackSection from '../../components/FeedbackSection';
import ReviewsSection from '../../components/ReviewsSection';
import RoadmapScreen from '../../components/RoadmapScreen';

// =====================================================
// SUB-COMPONENT: SHORTS VIDEO PLAYER
// =====================================================
const ShortVideo = ({ video, chapterId, isActive, courseTitle, courseHighlight, courseId, currentUserId, onSwipeLeft, onSwipeRight, onRefreshProgress, moduleNumber, moduleChaptersCount, chapterInModuleIndex }) => {
    const videoRef = useRef(null);
    const [isLiked, setIsLiked] = useState(video.likes?.includes(currentUserId) || false);
    const [likeCount, setLikeCount] = useState(video.totalLikes || video.likes?.length || 0);
    const [isSaved, setIsSaved] = useState(false);
    const [isDescExpanded, setIsDescExpanded] = useState(false);
    const [videoProgress, setVideoProgress] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [quality, setQuality] = useState(() => {
        return localStorage.getItem('vid_quality') || 'auto';
    });
    const [showQualityMenu, setShowQualityMenu] = useState(false);
    const [isPiPActive, setIsPiPActive] = useState(false);
    const [showExtra, setShowExtra] = useState(false);
    const progressIntervalRef = useRef(null);
    const [currentLang, setCurrentLang] = useState('bn');
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [showAutoAdvance, setShowAutoAdvance] = useState(false);
    const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(4);
    const autoAdvanceTimerRef = useRef(null);
    const countdownTimerRef = useRef(null);
    const [showControls, setShowControls] = useState(true);
    const controlsTimerRef = useRef(null);
    const chimeAudioRef = useRef(null);
    const prevActiveRef = useRef(undefined);

    // Subtle chime when a new video module becomes active
    const playModuleChime = () => {
        try {
            if (!chimeAudioRef.current) {
                chimeAudioRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = chimeAudioRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            osc.type = 'sine';
            gain.gain.value = 0.05;
            osc.start();
            osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
            osc.stop(ctx.currentTime + 0.35);
        } catch (e) { /* Audio not supported */ }
    };

    // Play chime when this module becomes active (skip initial mount)
    useEffect(() => {
        if (prevActiveRef.current === false && isActive) {
            playModuleChime();
        }
        prevActiveRef.current = isActive;
    }, [isActive]);

    const resetControlsTimer = useCallback(() => {
        if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
        setShowControls(true);
        controlsTimerRef.current = setTimeout(() => setShowControls(false), 3500);
    }, []);

    useEffect(() => {
        if (isActive) resetControlsTimer();
        return () => { if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current); };
    }, [isActive, resetControlsTimer]);

    const activeVideoSrc = video.videoUrls ? (video.videoUrls[currentLang] || video.videoUrls['bn']) : null;

    // Add ref for interactive progress bar seeking
    const progressBarRef = useRef(null);
    const [isSeeking, setIsSeeking] = useState(false);

    const handleProgressSeek = (e) => {
        if (!videoRef.current || !progressBarRef.current) return;
        const rect = progressBarRef.current.getBoundingClientRect();
        const clientX = e.clientX || (e.touches?.[0]?.clientX ?? 0);
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const newTime = ratio * (videoRef.current.duration || 0);
        videoRef.current.currentTime = newTime;
        setVideoProgress(ratio * 100);
    };

    const handleProgressTouchStart = (e) => {
        setIsSeeking(true);
        e.preventDefault();
        handleProgressSeek(e);
    };

    const handleProgressTouchCancel = () => {
        setIsSeeking(false);
    };

    const handleProgressTouchMove = (e) => {
        if (!isSeeking) return;
        e.preventDefault();
        handleProgressSeek(e);
    };

    const handleProgressTouchEnd = () => {
        setIsSeeking(false);
    };

    useEffect(() => {
        if (isActive && videoRef.current) {
            // Always start from the beginning when navigating back
            videoRef.current.currentTime = 0;
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    // Only log non-source errors
                    if (!e.message?.includes('no supported sources')) {
                        console.log("Auto-play prevented", e);
                    }
                });
            }
        } else if (videoRef.current) {
            videoRef.current.pause();
        }
    }, [isActive, activeVideoSrc]);

    const saveProgress = useCallback(async (position, duration, isComplete = false) => {
        if (!courseId || !video._id || !chapterId || !currentUserId) return;

        localStorage.setItem(`vid_pos_${video._id}`, position.toString());

        const maxRetries = isComplete ? 3 : 1;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const res = await fetch(`${BASE_URL}/engagement/progress/save`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        courseId,
                        chapterId,
                        moduleId: video._id,
                        moduleType: 'video',
                        watchedSeconds: Math.floor(position),
                        totalDuration: Math.floor(duration || 0),
                        lastPosition: position
                    })
                });
                if (res.ok) return;
                if (attempt < maxRetries) {
                    await new Promise(r => setTimeout(r, 1000 * attempt));
                }
            } catch (err) {
                console.log(`Progress save attempt ${attempt}/${maxRetries} failed`, err);
                if (attempt < maxRetries) {
                    await new Promise(r => setTimeout(r, 1000 * attempt));
                }
            }
        }
    }, [courseId, chapterId, video._id, currentUserId]);

    useEffect(() => {
        if (isActive && videoRef.current && currentUserId) {
            progressIntervalRef.current = setInterval(() => {
                const vid = videoRef.current;
                if (vid && !vid.paused) {
                    saveProgress(vid.currentTime, vid.duration);
                }
            }, 5000);
        }
        return () => {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, [isActive, currentUserId, saveProgress]);

    useEffect(() => {
        let viewTimer;
        if (isActive && courseId && video._id && chapterId) {
            viewTimer = setTimeout(() => {
                fetch(`${BASE_URL}/bitesize-courses/content/${courseId}/chapter/${chapterId}/module/${video._id}/view`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                }).catch(err => console.log("View error", err));
            }, 3000);
        }
        return () => clearTimeout(viewTimer);
    }, [isActive, courseId, chapterId, video._id]);

    useEffect(() => {
        const savedVideos = JSON.parse(localStorage.getItem('saved_short_videos') || '[]');
        if (savedVideos.includes(video._id)) setIsSaved(true);
    }, [video._id]);

    const triggerHaptic = (pattern = [15]) => {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            try { navigator.vibrate(pattern); } catch (e) {}
        }
    };

    const handleLike = async () => {
        if (!currentUserId) return alert("Please log in to like videos!");
        triggerHaptic([20]);
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
        try {
            const res = await fetch(`${BASE_URL}/bitesize-courses/content/${courseId}/chapter/${chapterId}/module/${video._id}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                if (data.totalLikes !== undefined) setLikeCount(data.totalLikes);
            }
        } catch (err) {
            setIsLiked(!isLiked);
            setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
        }
    };

    const handleSave = () => {
        triggerHaptic([15]);
        let savedVideos = JSON.parse(localStorage.getItem('saved_short_videos') || '[]');
        if (isSaved) {
            savedVideos = savedVideos.filter(id => id !== video._id);
            setIsSaved(false);
        } else {
            savedVideos.push(video._id);
            setIsSaved(true);
        }
        localStorage.setItem('saved_short_videos', JSON.stringify(savedVideos));
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title: video.title, text: `Watch this lesson from ${courseTitle}`, url: window.location.href });
            } catch (err) { }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied!");
        }
    };

    const touchStartRef = useRef({ x: 0, y: 0 });
    const [swiping, setSwiping] = useState(null);
    const swipeTimeoutRef = useRef(null);
    const longPressTimerRef = useRef(null);
    const isLongPressRef = useRef(false);
    const playbackSpeedRef = useRef(1);

    // Keep playbackSpeedRef in sync with state
    useEffect(() => {
        playbackSpeedRef.current = playbackSpeed;
    }, [playbackSpeed]);

    const handleTouchStart = (e) => {
        touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        
        // Start long-press timer for speed adjustment (500ms hold)
        isLongPressRef.current = false;
        if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
        
        longPressTimerRef.current = setTimeout(() => {
            isLongPressRef.current = true;
            
            // Cycle to next speed
            const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
            const currentSpeed = playbackSpeedRef.current;
            const currentIdx = speeds.indexOf(currentSpeed);
            const nextSpeed = speeds[(currentIdx + 1) % speeds.length];
            
            if (videoRef.current) videoRef.current.playbackRate = nextSpeed;
            setPlaybackSpeed(nextSpeed);
            
            // Show speed flash overlay
            const flash = document.createElement('div');
            flash.className = 'speed-flash';
            flash.innerHTML = `
                <div style="background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); padding: 8px 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 0 30px rgba(0,0,0,0.5);">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="font-size: 11px; color: rgba(255,255,255,0.6); font-weight: 700; letter-spacing: 0.05em;">SPEED</span>
                        <span style="font-size: 18px; color: #10b981; font-weight: 900;">${nextSpeed}x</span>
                    </div>
                </div>
            `;
            flash.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 50; pointer-events: none;';
            const parentEl = videoRef.current?.parentElement;
            if (parentEl) {
                parentEl.appendChild(flash);
                flash.animate([
                    { transform: 'translate(-50%, -50%) scale(0.7)', opacity: 0 },
                    { transform: 'translate(-50%, -50%) scale(1.1)', opacity: 1, offset: 0.15 },
                    { transform: 'translate(-50%, -50%) scale(1)', opacity: 1, offset: 0.5 },
                    { transform: 'translate(-50%, -50%) scale(1)', opacity: 0 }
                ], { duration: 1200, easing: 'ease-out' });
                setTimeout(() => flash.remove(), 1200);
            }
        }, 500);
    };

    const handleTouchEnd = (e) => {
        // Clear long-press timer
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
        
        // If it was a long press, skip swipe processing
        // NOTE: Don't reset isLongPressRef here — onClick needs to consume it
        if (isLongPressRef.current) {
            touchStartRef.current = { x: 0, y: 0 };
            return;
        }
        
        const startX = touchStartRef.current.x;
        const startY = touchStartRef.current.y;
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const deltaX = endX - startX;
        const deltaY = Math.abs(endY - startY);

        if (swipeTimeoutRef.current) clearTimeout(swipeTimeoutRef.current);

        if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > deltaY * 1.5) {
            if (deltaX > 0 && onSwipeRight) {
                setSwiping('right');
                onSwipeRight();
            } else if (deltaX < 0 && onSwipeLeft) {
                setSwiping('left');
                onSwipeLeft();
            }
            swipeTimeoutRef.current = setTimeout(() => setSwiping(null), 300);
        }
        touchStartRef.current = { x: 0, y: 0 };
    };

    useEffect(() => {
        return () => {
            if (swipeTimeoutRef.current) clearTimeout(swipeTimeoutRef.current);
            if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
            if (countdownTimerRef.current) { clearInterval(countdownTimerRef.current); countdownTimerRef.current = null; }
            if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
        };
    }, []);

    const lastTapRef = useRef({ time: 0, x: 0 });
    const handleVideoDoubleTap = (e) => {
        const now = Date.now();
        const touchX = e.clientX || e.touches?.[0]?.clientX || 0;
        const videoWidth = e.currentTarget?.clientWidth || 1;
        
        if (now - lastTapRef.current.time < 300) {
            // Double-tap anywhere → Instagram-style LIKE (with heart burst)
            handleLike();
            const heart = document.createElement('div');
            heart.innerHTML = '<svg width="120" height="120" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1.5" style="filter: drop-shadow(0 0 25px rgba(255,255,255,0.7));"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
            heart.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 50; pointer-events: none;';
            const videoEl = videoRef.current?.parentElement;
            if (videoEl) {
                videoEl.appendChild(heart);
                heart.animate([
                    { transform: 'translate(-50%, -50%) scale(0.2)', opacity: 0 },
                    { transform: 'translate(-50%, -50%) scale(0.6)', opacity: 1, offset: 0.2 },
                    { transform: 'translate(-50%, -50%) scale(1.2)', opacity: 0.7, offset: 0.6 },
                    { transform: 'translate(-50%, -50%) scale(0)', opacity: 0 }
                ], { duration: 800, easing: 'ease-out' });
                setTimeout(() => heart.remove(), 800);
            }
            lastTapRef.current = { time: 0, x: 0 };
        } else {
            lastTapRef.current = { time: now, x: touchX };
        }
    };

    const changeLanguage = (langCode) => {
        if (!video.videoUrls || !video.videoUrls[langCode]) {
            alert("This language is not available yet.");
            return;
        }
        const isPlaying = !videoRef.current.paused;
        setCurrentLang(langCode);
        setShowLangMenu(false);
        setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.currentTime = 0;
                if (isPlaying) videoRef.current.play();
            }
        }, 100);
    };

    return (
        <div className="w-full h-[100dvh] flex-shrink-0 snap-center snap-always relative bg-black overflow-hidden group text-white">
            {swiping === 'left' && (
                <div className="absolute top-0 right-0 bottom-0 w-20 z-30 flex items-center justify-start bg-gradient-to-l from-white/10 to-transparent animate-pulse">
                    <ChevronLeft size={36} className="text-white/70 ml-2" />
                </div>
            )}
            {swiping === 'right' && (
                <div className="absolute top-0 left-0 bottom-0 w-20 z-30 flex items-center justify-end bg-gradient-to-r from-white/10 to-transparent animate-pulse">
                    <ChevronLeft size={36} className="text-white/70 mr-2 rotate-180" />
                </div>
            )}

            {activeVideoSrc ? (
                <video
                    key={activeVideoSrc}
                    ref={videoRef}
                    src={activeVideoSrc}
                    poster={video.thumbnail}
                    className="absolute inset-0 w-full h-full object-cover"
                    playsInline
                    preload="metadata"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onClick={(e) => {
                        // If this click came from a long-press, skip play/pause toggle
                        if (isLongPressRef.current) {
                            isLongPressRef.current = false;
                            return;
                        }
                        if (videoRef.current.paused) videoRef.current.play();
                        else { videoRef.current.pause(); saveProgress(videoRef.current.currentTime, videoRef.current.duration, false); }
                        setShowLangMenu(false); setShowExtra(false); setShowSpeedMenu(false); setShowQualityMenu(false);
                        resetControlsTimer();
                        handleVideoDoubleTap(e);
                    }}
                    onTimeUpdate={(e) => {
                        const vid = e.target;
                        if (vid.duration > 0) setVideoProgress((vid.currentTime / vid.duration) * 100);
                    }}
                    onError={() => {
                        console.log("Video source error - no supported sources");
                    }}
                    onEnded={() => {
                        const finalDuration = videoRef.current?.duration || 0;
                        setVideoProgress(100);
                        saveProgress(finalDuration, finalDuration, true);
                        fetch(`${BASE_URL}/engagement/progress/complete`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ courseId, chapterId, moduleId: video._id, moduleType: 'video' })
                        }).then(() => {
                            if (onRefreshProgress) onRefreshProgress();
                        }).catch(err => console.log("Complete error", err));

                        if (onSwipeLeft) {
                            setShowAutoAdvance(true);
                            setAutoAdvanceCountdown(4);
                            countdownTimerRef.current = setInterval(() => {
                                setAutoAdvanceCountdown(prev => {
                                    if (prev <= 2) { clearInterval(countdownTimerRef.current); countdownTimerRef.current = null; return 0; }
                                    return prev - 1;
                                });
                            }, 1000);
                            autoAdvanceTimerRef.current = setTimeout(() => {
                                setShowAutoAdvance(false);
                                onSwipeLeft();
                            }, 4000);
                        }
                    }}
                    onPlay={() => {
                        resetControlsTimer();
                        fetch(`${BASE_URL}/engagement/streak/log`, {
                            method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include'
                        }).catch(err => console.log("Streak log error", err));
                    }}
                />
            ) : (
                <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center">
                    {video.thumbnail ? (
                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-60" />
                    ) : (
                        <div className="text-gray-500 text-xs font-medium">Video loading...</div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center backdrop-blur-sm">
                            <Play size={28} className="text-emerald-400 ml-1" />
                        </div>
                    </div>
                </div>
            )}

            {/* ── Chapter badge + dot indicator (compact Instagram style) ── */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1">
                {/* Module label */}
                <div className="bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10 shadow-lg">
                    <span className="text-white text-[9px] font-bold">Module {moduleNumber || 1}</span>
                </div>
                {/* Dot indicator — one dot per chapter in this module */}
                {moduleChaptersCount > 0 && (
                    <div className="flex items-center gap-1">
                        {[...Array(moduleChaptersCount)].map((_, i) => (
                            <div
                                key={i}
                                className={`rounded-full transition-all duration-300 ${
                                    i === chapterInModuleIndex
                                        ? 'bg-emerald-400 w-[10px] h-[3px] rounded-full'
                                        : 'bg-white/30 w-[3px] h-[3px]'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Interactive progress bar at BOTTOM (ultra-thin, app-like) ── */}
            <div
                ref={progressBarRef}
                className="absolute bottom-0 left-0 right-0 z-30 group/progress cursor-pointer"
                style={{ height: `${isSeeking ? '16px' : '8px'}` }}
                onClick={handleProgressSeek}
                onTouchStart={handleProgressTouchStart}
                onTouchMove={handleProgressTouchMove}
                onTouchEnd={handleProgressTouchEnd}
                onTouchCancel={handleProgressTouchCancel}
            >
                {/* Ultra-thin progress bar */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[1.5px] bg-white/10 group-hover/progress:h-[2px] transition-all">
                    <div className="h-full bg-emerald-500 transition-all duration-75 shadow-[0_0_4px_rgba(16,185,129,0.4)]" style={{ width: `${videoProgress}%` }} />
                </div>
                {/* Tiny thumb dot (shown when actively seeking) */}
                <div
                    className={`absolute top-1/2 -translate-y-1/2 w-[6px] h-[6px] bg-emerald-400 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.6)] transition-all duration-150 ${isSeeking ? 'opacity-100 scale-100' : 'opacity-0'}`}
                    style={{ left: `${videoProgress}%`, marginLeft: '-3px' }}
                />
            </div>

            {/* ── Gradient overlay (subtle, always present) ── */}
            <div className={`absolute bottom-0 left-0 right-0 transition-all duration-500 pointer-events-none ${showControls 
                ? (isDescExpanded ? 'h-2/3 bg-gradient-to-t from-black/90 via-black/60 to-transparent' : 'h-1/3 bg-gradient-to-t from-black/70 via-black/20 to-transparent') 
                : 'h-[15%] bg-gradient-to-t from-black/40 via-black/5 to-transparent'
            }`}></div>

            {playbackSpeed !== 1 && (
                <div className="absolute top-8 left-2.5 z-30">
                    <div className="bg-black/60 backdrop-blur-sm px-1 py-0.5 rounded-md border border-white/5">
                        <span className="text-white text-[8px] font-bold">{playbackSpeed}x</span>
                    </div>
                </div>
            )}

            {quality !== 'auto' && (
                <div className="absolute top-12 left-2.5 z-30">
                    <div className="bg-black/60 backdrop-blur-sm px-1 py-0.5 rounded-md border border-white/5 shadow-lg">
                        <span className="text-white text-[8px] font-bold">{quality}</span>
                    </div>
                </div>
            )}

            {showAutoAdvance && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 animate-slide-up-fade">
                    <div className="bg-black/80 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 shadow-2xl flex items-center gap-1.5">
                        <div className="flex items-center gap-1.5 pr-1.5 border-r border-white/10">
                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                                <span className="text-white font-bold text-[9px]">{autoAdvanceCountdown}</span>
                            </div>
                            <span className="text-white text-[10px] font-medium whitespace-nowrap">Next</span>
                        </div>
                        <button onClick={(e) => {
                            e.stopPropagation();
                            setShowAutoAdvance(false);
                            if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
                            if (countdownTimerRef.current) { clearInterval(countdownTimerRef.current); countdownTimerRef.current = null; }
                            if (videoRef.current) { videoRef.current.currentTime = 0; videoRef.current.play(); }
                        }} className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 px-2 py-0.5 rounded-lg hover:bg-white/5 transition-all flex items-center gap-1">
                            <RotateCcw size={10} /> Rewatch
                        </button>
                        <button onClick={(e) => {
                            e.stopPropagation();
                            setShowAutoAdvance(false);
                            if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
                            if (countdownTimerRef.current) { clearInterval(countdownTimerRef.current); countdownTimerRef.current = null; }
                        }} className="text-[10px] font-bold text-gray-400 hover:text-white px-2 py-0.5 rounded-lg hover:bg-white/10 transition-all">Cancel</button>
                    </div>
                </div>
            )}

            {/* ── Right side action bar (Instagram-style, ultra compact) ── */}
            {showControls && (
            <div className="absolute right-1.5 bottom-20 flex flex-col items-center gap-1.5 z-20">
                <button onClick={(e) => { e.stopPropagation(); resetControlsTimer(); handleLike(); }} className="flex flex-col items-center gap-[1px] active:scale-75 transition-transform">
                    <div className="bg-black/25 p-1 rounded-full backdrop-blur-sm border border-white/5">
                        <Heart size={15} className={`transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-white fill-transparent"}`} />
                    </div>
                    <span className="text-white text-[7px] font-semibold drop-shadow-md">{likeCount > 0 ? (likeCount > 999 ? `${(likeCount/1000).toFixed(1)}k` : likeCount) : 'Like'}</span>
                </button>
                <button onClick={(e) => { e.stopPropagation(); resetControlsTimer(); window.dispatchEvent(new CustomEvent('openFeedback', { detail: { courseId } })); }} className="flex flex-col items-center gap-[1px] active:scale-75 transition-transform">
                    <div className="bg-black/25 p-1 rounded-full backdrop-blur-sm border border-white/5"><MessageCircle size={14} className="text-white" /></div>
                    <span className="text-white text-[7px] font-semibold drop-shadow-md">Feedback</span>
                </button>

                <div className={`flex flex-col items-center gap-1.5 overflow-hidden transition-all duration-300 ease-in-out ${showExtra ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <button onClick={(e) => { e.stopPropagation(); resetControlsTimer(); handleSave(); }} className="flex flex-col items-center gap-[1px] active:scale-75 transition-transform">
                        <div className="bg-black/25 p-1 rounded-full backdrop-blur-sm border border-white/5">
                            <Bookmark size={13} className={`transition-colors ${isSaved ? "fill-yellow-500 text-yellow-500" : "text-white fill-transparent"}`} />
                        </div>
                        <span className="text-white text-[7px] font-semibold drop-shadow-md">Save</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); resetControlsTimer(); handleShare(); }} className="flex flex-col items-center gap-[1px] active:scale-75 transition-transform">
                        <div className="bg-black/25 p-1 rounded-full backdrop-blur-sm border border-white/5"><Share2 size={13} className="text-white" /></div>
                        <span className="text-white text-[7px] font-semibold drop-shadow-md">Share</span>
                    </button>
                    <div>
                        <button onClick={(e) => { e.stopPropagation(); resetControlsTimer(); setShowSpeedMenu(!showSpeedMenu); setShowQualityMenu(false); }} className="flex flex-col items-center gap-[1px] active:scale-75 transition-transform">
                            <div className={`bg-black/25 p-1 rounded-full backdrop-blur-sm border border-white/5 ${showSpeedMenu ? 'ring-1 ring-emerald-500' : ''}`}><FastForward size={11} className="text-white" /></div>
                            <span className="text-white text-[6px] font-semibold drop-shadow-md">{playbackSpeed}x</span>
                        </button>
                    </div>
                    <button onClick={async (e) => {
                        e.stopPropagation(); resetControlsTimer();
                        try {
                            if (document.pictureInPictureElement) { await document.exitPictureInPicture(); setIsPiPActive(false); }
                            else if (videoRef.current) { await videoRef.current.requestPictureInPicture(); setIsPiPActive(true); }
                        } catch (err) { console.log('PiP not supported', err); }
                    }} className="flex flex-col items-center gap-[1px] active:scale-75 transition-transform">
                        <div className={`bg-black/25 p-1 rounded-full backdrop-blur-sm border border-white/5 ${isPiPActive ? 'ring-1 ring-emerald-500 bg-emerald-500/20' : ''}`}><MonitorUp size={11} className="text-white" /></div>
                        <span className="text-white text-[6px] font-semibold drop-shadow-md">PiP</span>
                    </button>
                    {/* Video Quality Selector */}
                    <div>
                        <button onClick={(e) => { e.stopPropagation(); resetControlsTimer(); setShowQualityMenu(!showQualityMenu); setShowSpeedMenu(false); }} className="flex flex-col items-center gap-[1px] active:scale-75 transition-transform">
                            <div className={`bg-black/25 p-1 rounded-full backdrop-blur-sm border border-white/5 ${showQualityMenu ? 'ring-1 ring-emerald-500' : ''}`}><Monitor size={11} className="text-white" /></div>
                            <span className="text-white text-[6px] font-semibold drop-shadow-md">{quality === 'auto' ? 'Auto' : quality}</span>
                        </button>
                    </div>
                </div>

                {showSpeedMenu && showExtra && (
                    <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-[#121212]/95 backdrop-blur-xl border border-white/10 rounded-lg p-1 shadow-2xl z-30">
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                            <button key={speed} onClick={(e) => { e.stopPropagation(); resetControlsTimer(); if (videoRef.current) videoRef.current.playbackRate = speed; setPlaybackSpeed(speed); setShowSpeedMenu(false); }} className={`w-full px-2 py-1 rounded-md text-[9px] font-bold text-center whitespace-nowrap transition-colors ${playbackSpeed === speed ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>
                                {speed}x
                            </button>
                        ))}
                    </div>
                )}

                {showQualityMenu && showExtra && (
                    <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-[#121212]/95 backdrop-blur-xl border border-white/10 rounded-lg p-1 shadow-2xl z-30">
                        {[
                            { label: 'Auto', value: 'auto', desc: 'Auto' },
                            { label: '1080p', value: '1080p', desc: 'HD' },
                            { label: '720p', value: '720p', desc: 'HD' },
                            { label: '480p', value: '480p', desc: 'SD' },
                            { label: '360p', value: '360p', desc: 'SD' },
                        ].map(item => (
                            <button key={item.value} onClick={(e) => {
                                e.stopPropagation(); resetControlsTimer();
                                setQuality(item.value);
                                setShowQualityMenu(false);
                                localStorage.setItem('vid_quality', item.value);
                            }} className={`w-full px-2 py-1 rounded-md text-[9px] font-bold text-center whitespace-nowrap transition-colors ${quality === item.value ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>
                                <div className="flex items-center justify-center">
                                    <span>{item.label}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                <button onClick={(e) => { e.stopPropagation(); resetControlsTimer(); setShowExtra(!showExtra); if (showExtra) { setShowSpeedMenu(false); setShowQualityMenu(false); } }} className="flex flex-col items-center gap-[1px] active:scale-75 transition-transform">
                    <div className={`p-1 rounded-full backdrop-blur-sm border border-white/5 transition-colors ${showExtra ? 'bg-emerald-600/30 ring-1 ring-emerald-500' : 'bg-black/25'}`}><MoreHorizontal size={13} className="text-white" /></div>
                    <span className="text-white text-[7px] font-semibold drop-shadow-md">{showExtra ? 'Hide' : 'More'}</span>
                </button>
            </div>
            )}

            {/* ── Bottom info area (ultra compact, Instagram-style) ── */}
            {showControls && (
            <div className="absolute bottom-3 left-3 right-12 z-20 flex flex-col items-start">
                <div className="relative mb-1.5">
                    {showLangMenu && (
                        <div className="absolute bottom-full left-0 mb-1 bg-[#121212]/95 backdrop-blur-xl border border-white/10 rounded-lg p-1 flex flex-col gap-0.5 shadow-2xl animate-fade-in-up origin-bottom-left">
                            {['bn', 'en', 'hi'].map(lang => (
                                <button key={lang} onClick={(e) => changeLanguage(lang)} className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors w-full text-left flex items-center gap-1.5 ${currentLang === lang ? 'bg-[#008a45] text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>
                                    {currentLang === lang && <CheckCircle2 size={10} className="text-white" />}
                                    {lang === 'en' ? 'English' : lang === 'hi' ? 'Hindi' : 'Bengali'}
                                </button>
                            ))}
                        </div>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); setShowLangMenu(!showLangMenu); }} className="bg-black/35 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full flex items-center gap-1 hover:bg-black/60 transition-colors">
                        <Globe size={9} className="text-[#00d26a]" />
                        <span className="text-[9px] font-bold uppercase text-white drop-shadow-md">{currentLang === 'en' ? 'ENG' : currentLang === 'hi' ? 'HIN' : 'BEN'}</span>
                        <ChevronDown size={9} className="text-gray-400" />
                    </button>
                </div>

                <div className="flex items-center gap-1.5 mb-1 cursor-pointer">
                    <div className="w-5 h-5 flex items-center justify-center overflow-hidden">
                        <img src="https://res.cloudinary.com/dvcs9x8yp/image/upload/v1775412341/black_white_king_logo_20250815_165948_0000_tepz65.png" alt="UPSKALE Logo" className="w-full h-full object-cover rounded-full" />
                    </div>
                    <img src="https://res.cloudinary.com/dvcs9x8yp/image/upload/v1775412223/20250730_170449_0000_uq4d24.png" alt="UPSKALE Logo" className="h-3.5 w-auto object-contain drop-shadow-[0_0_10px_rgba(0,138,69,0.3)]" />
                </div>

                <h3 className="font-bold text-[12px] leading-snug mb-0.5 drop-shadow-lg">{video.title}</h3>

                <div className="w-full cursor-pointer" onClick={(e) => { e.stopPropagation(); setIsDescExpanded(!isDescExpanded); }}>
                    <p className={`text-[11px] text-gray-200 drop-shadow-md transition-all duration-300 ${isDescExpanded ? 'line-clamp-none bg-black/35 backdrop-blur-sm p-2 rounded-lg border border-white/10 mt-1' : 'line-clamp-1 pr-4'}`}>
                        {video.description || `Module excerpt from ${courseTitle}.`}
                        {!isDescExpanded && <span className="text-white font-bold text-[10px] mt-0.5 inline-block drop-shadow-lg">...more</span>}
                    </p>
                </div>
            </div>
            )}
        </div>
    );
};

// =====================================================
// SUB-COMPONENT: INLINE QUIZ MODULE (Try-Until-Correct)
// =====================================================
const InlineQuizModule = ({ quiz, chapterId, courseId, course, onComplete, relatedCourses, isCertificateModule, onRefreshProgress, moduleNumber, moduleChaptersCount, chapterInModuleIndex }) => {
    const navigate = useNavigate();
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [disabledOptions, setDisabledOptions] = useState({});
    const [selectedOption, setSelectedOption] = useState(null);
    const [feedback, setFeedback] = useState(null); // { correct: true/false, message: '' }
    const [quizComplete, setQuizComplete] = useState(false);
    const [checking, setChecking] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const audioContextRef = useRef(null);

    const questions = quiz.questions || [];
    const currentQ = questions[currentQIndex];

    // Play error sound
    const playErrorSound = () => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = audioContextRef.current;
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            oscillator.frequency.value = 200;
            oscillator.type = 'sawtooth';
            gainNode.gain.value = 0.1;
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            oscillator.stop(ctx.currentTime + 0.4);
        } catch (e) { /* Audio not supported */ }
    };

    // Play success sound
    const playSuccessSound = () => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = audioContextRef.current;
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            oscillator.frequency.value = 523;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.1;
            oscillator.start();
            oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            oscillator.stop(ctx.currentTime + 0.4);
        } catch (e) { /* Audio not supported */ }
    };

    const handleSelectOption = async (option) => {
        if (disabledOptions[option] || checking) return;

        setSelectedOption(option);
        setChecking(true);
        setFeedback(null);

        try {
            const res = await fetch(`${BASE_URL}/bitesize-courses/content/${courseId}/chapter/${chapterId}/module/${quiz._id}/answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ questionId: currentQ._id, selectedOption: option })
            });
            const data = await res.json();

            if (data.correct) {
                playSuccessSound();
                setFeedback({ correct: true, message: '✅ Correct!' });

                // Track progress for this question
                await fetch(`${BASE_URL}/engagement/progress/quiz-answer`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        courseId, chapterId, moduleId: quiz._id,
                        questionId: currentQ._id, correct: true
                    })
                });

                // Don't disable anything — the green styling handles correct display
                setTimeout(() => {
                    if (currentQIndex < questions.length - 1) {
                        setCurrentQIndex(prev => prev + 1);
                        setSelectedOption(null);
                        setFeedback(null);
                        setDisabledOptions({});
                    } else {
                        setQuizComplete(true);
                        // Mark quiz module as complete
                        fetch(`${BASE_URL}/engagement/progress/complete`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ courseId, chapterId, moduleId: quiz._id, moduleType: 'quiz' })
                        }).then(() => {
                            if (onRefreshProgress) onRefreshProgress();
                        }).catch(err => console.log("Quiz complete error", err));
                        
                        // Auto-proceed if not the certificate module
                        if (!isCertificateModule) {
                            setTimeout(() => {
                                if (onComplete) onComplete();
                            }, 1200);
                        }
                    }
                }, 800);

            } else {
                playErrorSound();
                setFeedback({ correct: false, message: '❌ Wrong answer! Try again.' });
                // Disable the wrong option
                setDisabledOptions(prev => ({ ...prev, [option]: true }));

                // Track wrong attempt
                await fetch(`${BASE_URL}/engagement/progress/quiz-answer`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        courseId, chapterId, moduleId: quiz._id,
                        questionId: currentQ._id, correct: false
                    })
                });
            }
        } catch (err) {
            setFeedback({ correct: false, message: 'Connection error. Try again.' });
        } finally {
            setChecking(false);
        }
    };

    // Handle certificate name entry when quiz is complete
    const [showNameModal, setShowNameModal] = useState(false);
    const [certificateName, setCertificateName] = useState('');
    const [result, setResult] = useState(null);
    const userObj = JSON.parse(localStorage.getItem('user') || 'null');
    const defaultName = userObj ? userObj.name : '';

    const handleGetCertificate = () => {
        setCertificateName(defaultName);
        setShowNameModal(true);
    };

    const submitForCertificate = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`${BASE_URL}/bitesize-courses/complete-course/${courseId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ customName: certificateName || defaultName })
            });
            const data = await res.json();
            setResult(data);
            if (data.certificateUrl) {
                localStorage.setItem(`certificate_${courseId}`, data.certificateUrl);
            }
            setShowNameModal(false);
        } catch (err) {
            alert("Failed to get certificate. Check connection.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleShareProgress = async () => {
        const text = `🎉 I completed the "${course.title}" course on UPSKALE! Ready to master more skills. 🚀\n\n${window.location.href}`;
        if (navigator.share) {
            try { await navigator.share({ title: `${course.title} - UPSKALE`, text }); } catch (err) { }
        } else {
            try { await navigator.clipboard.writeText(text); alert("Progress link copied! Share it with friends. 🎉"); } catch (err) { }
        }
    };

    // ── Non-Certificate Quiz: Simple completion (auto-proceeds) ──
    if (!isCertificateModule && quizComplete) {
        return (
            <div className="w-full min-h-[100dvh] flex-shrink-0 snap-center snap-always bg-[#050505] flex items-center justify-center p-6">
                <div className="text-center animate-fade-in-up">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
                        <CheckCircle size={40} className="text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">Quiz Complete! ✅</h2>
                    <p className="text-gray-400 text-sm mb-6">Great job! Moving to next module...</p>
                    <div className="flex justify-center gap-1">
                        {[0,1,2].map(i => (
                            <div key={i} className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ── Certificate Module: Result screens ──
    if (isCertificateModule && quizComplete && result) {
        return (
            <div className="w-full min-h-[100dvh] flex-shrink-0 snap-center snap-always bg-[#050505] overflow-y-auto no-scrollbar">
                <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 text-center">
                    <div className="bg-[#121212] border border-emerald-500/30 p-8 rounded-3xl shadow-2xl shadow-emerald-900/20 max-w-sm w-full">
                        <Award size={80} className="text-yellow-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                        <h2 className="text-3xl font-black text-white mb-2">You Passed! 🎉</h2>
                        <p className="text-gray-400 mb-6">All quizzes completed successfully!</p>
                        <button onClick={() => window.open(result.certificateUrl, '_blank')} className="w-full py-3.5 mb-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-colors shadow-lg shadow-emerald-600/30">
                            View Certificate
                        </button>
                        <button onClick={handleShareProgress} className="w-full py-2.5 mb-6 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-bold rounded-xl transition-colors border border-white/10 flex items-center justify-center gap-2 text-sm">
                            <Share2 size={16} /> Share Progress
                        </button>
                        <div className="border-t border-white/10 pt-6 mt-2 relative">
                            <h3 className="text-lg font-bold text-white mb-2">Continue Learning</h3>
                            <button onClick={() => navigate('/')} className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-black rounded-xl transition-transform active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                                Explore More Courses
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Certificate Module: Certificate Request Screen ──
    if (isCertificateModule && quizComplete && !result) {
        return (
            <div className="w-full min-h-[100dvh] flex-shrink-0 snap-center snap-always bg-[#050505] overflow-y-auto no-scrollbar">
                <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 text-center">
                    <div className="bg-[#121212] border border-emerald-500/30 p-8 rounded-3xl shadow-2xl shadow-emerald-900/20 max-w-sm w-full">
                        <CheckCircle size={64} className="text-emerald-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                        <h2 className="text-2xl font-black text-white mb-2">Course Completed! 🎉</h2>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">You've completed all modules. Get your certificate now!</p>
                        <button onClick={handleGetCertificate} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2">
                            <Award size={20} /> Get Certificate
                        </button>
                    </div>
                </div>

                {showNameModal && (
                    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
                        <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                            <h3 className="text-xl font-black text-white mb-2 text-center">Certificate Name</h3>
                            <p className="text-gray-400 text-sm mb-6 text-center">Enter your full name as you want it on the certificate.</p>
                            <input type="text" value={certificateName} onChange={(e) => setCertificateName(e.target.value)} className="w-full bg-black border border-white/20 text-white rounded-xl p-4 mb-6 focus:outline-none focus:border-emerald-500" placeholder="Enter Full Name" autoFocus />
                            <div className="flex gap-3">
                                <button onClick={() => setShowNameModal(false)} className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl">Cancel</button>
                                <button onClick={submitForCertificate} disabled={!certificateName.trim() || isSubmitting} className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white font-black rounded-xl flex justify-center items-center">
                                    {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'Get Certificate'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (questions.length === 0) {
        return <div className="w-full h-[100dvh] flex-shrink-0 snap-center snap-always bg-[#0a0a0a] flex items-center justify-center text-white">No questions in this quiz.</div>;
    }

    return (
        <div className="w-full h-[100dvh] flex-shrink-0 snap-center snap-always bg-[#050505] flex flex-col p-6 pt-24 pb-12 relative">
            {/* ── Chapter badge + dot indicator (top center) ── */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
                <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10 shadow-lg">
                    <span className="text-white text-[11px] font-bold">Module {moduleNumber || 1}</span>
                </div>
                {moduleChaptersCount > 0 && (
                    <div className="flex items-center gap-1.5">
                        {[...Array(moduleChaptersCount)].map((_, i) => (
                            <div
                                key={i}
                                className={`rounded-full transition-all duration-300 ${
                                    i === chapterInModuleIndex
                                        ? 'bg-yellow-400 w-[14px] h-[5px] rounded-full'
                                        : 'bg-white/30 w-[5px] h-[5px]'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="mb-6 max-w-md mx-auto w-full mt-14">
                <div className="flex justify-between items-end mb-2">
                    <p className="text-yellow-500 font-bold text-xs uppercase tracking-wider">📝 Quiz Module</p>
                    <p className="text-gray-500 font-bold text-xs">{currentQIndex + 1} / {questions.length}</p>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-yellow-500 h-full transition-all duration-300" style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}></div>
                </div>
            </div>

            <div className="flex-1 max-w-md mx-auto w-full flex flex-col">
                <h3 className="text-xl md:text-2xl font-black text-white mb-8 leading-tight">{currentQ.questionText}</h3>

                <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
                    {currentQ.options.map((opt, i) => {
                        const isWrong = disabledOptions[opt];
                        return (
                            <button
                                key={i}
                                onClick={() => handleSelectOption(opt)}
                                disabled={isWrong || checking}
                                className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between ${isWrong
                                    ? 'border-red-500/30 bg-red-500/10 text-red-500/50 line-through cursor-not-allowed'
                                    : selectedOption === opt && feedback
                                        ? feedback.correct
                                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                                            : 'border-red-500 bg-red-500/10 text-red-400'
                                        : 'border-white/5 bg-[#121212] text-gray-300 hover:border-white/20'
                                    }`}
                            >
                                <span className="font-medium text-sm md:text-base">{opt}</span>
                                {isWrong && <XCircle size={18} className="text-red-500/50 shrink-0" />}
                                {selectedOption === opt && feedback?.correct && <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />}
                            </button>
                        );
                    })}
                </div>

                {/* Feedback & Try Again */}
                {feedback && !feedback.correct && (
                    <div className="mt-4 text-center">
                        <p className="text-red-400 font-bold text-sm flex items-center justify-center gap-2 mb-2">
                            <Volume2 size={16} /> {feedback.message}
                        </p>
                        <p className="text-gray-500 text-xs">Pick another option above to continue</p>
                    </div>
                )}

                {feedback && feedback.correct && (
                    <div className="mt-4 text-center">
                        <p className="text-emerald-400 font-bold text-sm">{feedback.message}</p>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake { animation: shake 0.3s ease-in-out; }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-slide-up-fade { animation: fadeInUp 0.4s ease-out; }
            `}</style>
        </div>
    );
};

// =====================================================
// FEEDBACK OVERLAY
// =====================================================
const FeedbackOverlay = ({ courseId, onClose }) => {
    const userObj = JSON.parse(localStorage.getItem('user') || 'null');
    const isAdmin = userObj?.role === 'admin';
    
    return (
        <div className="fixed inset-0 z-[200] flex items-end justify-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-[#0a0a0a] rounded-t-3xl border-t border-white/10 max-h-[85vh] overflow-hidden animate-slide-up">
                <FeedbackSection courseId={courseId} onClose={onClose} />
                {isAdmin && (
                    <div className="border-t border-white/5">
                        <ReviewsSection courseId={courseId} />
                    </div>
                )}
            </div>
            <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } } .animate-slide-up { animation: slideUp 0.3s ease-out; }`}</style>
        </div>
    );
};

// =====================================================
// MAIN PAGE: BiteSizeCoursePage
// =====================================================
const BiteSizeCoursePage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]); // Flattened [{ type, chapterId, data, chapterTitle }]
    const [premiumContentLoaded, setPremiumContentLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [allCourses, setAllCourses] = useState([]);
    const [activeModuleIndex, setActiveModuleIndex] = useState(0);

    const [showRoadmap, setShowRoadmap] = useState(true);
    const [showFeedback, setShowFeedback] = useState(false);
    const [progressData, setProgressData] = useState(null);

    const scrollContainerRef = useRef(null);

    const userObj = JSON.parse(localStorage.getItem('user') || 'null');
    const userId = userObj ? userObj._id : null;
    const isAdmin = userObj?.role === 'admin';

    // Fetch course data
    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const publicRes = await fetch(`${BASE_URL}/bitesize-courses/${slug}`);
                if (!publicRes.ok) return navigate('/');
                const publicData = await publicRes.json();
                setCourse(publicData);

                if (userId) {
                    const premiumRes = await fetch(`${BASE_URL}/bitesize-courses/content/${publicData._id}`, {
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include'
                    });

                    if (premiumRes.ok) {
                        const premiumData = await premiumRes.json();
                        setCourse(premiumData);

                        // Flatten chapters into modules list
                        const flattened = [];
                        if (premiumData.chapters) {
                            premiumData.chapters.forEach(ch => {
                                if (ch.modules && ch.modules.length > 0) {
                                    // Add modules only (no chapter headers — clean player)
                                    ch.modules.forEach(m => {
                                        flattened.push({
                                            type: m.type,
                                            chapterId: ch._id,
                                            chapterTitle: ch.title,
                                            moduleIsCertificate: ch.isCertificateModule || false,
                                            data: m
                                        });
                                    });
                                }
                            });
                        }
                        setModules(flattened);
                        setPremiumContentLoaded(true);
                    } else if (premiumRes.status === 401 || premiumRes.status === 403) {
                        console.warn("Session expired.");
                        localStorage.removeItem('user');
                        window.dispatchEvent(new Event("storage"));
                        window.dispatchEvent(new CustomEvent('trigger-login-modal', { detail: { message: "Your session has expired. Please log in again." } }));
                        return;
                    }

                }
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourseData();
    }, [slug, navigate, userId]);

    // Fetch progress data for unlocking logic
    const [refreshKey, setRefreshKey] = useState(0);
    const refreshProgress = useCallback(() => setRefreshKey(k => k + 1), []);

    useEffect(() => {
        if (!course?._id || !userId) return;
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
            }
        };
        fetchProgress();
    }, [course?._id, userId, refreshKey]);

    // ─── Scroll helpers with guard to prevent oscillation ───
    const isAutoScrolling = useRef(false);

    const scrollToNext = useCallback(() => {
        if (isAutoScrolling.current || modules.length === 0) return;
        const next = Math.min(activeModuleIndex + 1, modules.length - 1);
        if (scrollContainerRef.current && next !== activeModuleIndex) {
            isAutoScrolling.current = true;
            scrollContainerRef.current.scrollTo({ top: next * scrollContainerRef.current.clientHeight, behavior: 'smooth' });
            setTimeout(() => { isAutoScrolling.current = false; }, 600);
        }
    }, [activeModuleIndex, modules.length]);

    const scrollToPrev = useCallback(() => {
        if (isAutoScrolling.current || modules.length === 0) return;
        const prev = Math.max(activeModuleIndex - 1, 0);
        if (scrollContainerRef.current && prev !== activeModuleIndex) {
            isAutoScrolling.current = true;
            scrollContainerRef.current.scrollTo({ top: prev * scrollContainerRef.current.clientHeight, behavior: 'smooth' });
            setTimeout(() => { isAutoScrolling.current = false; }, 600);
        }
    }, [activeModuleIndex, modules.length]);

    const jumpToModule = useCallback((chapterId, moduleId) => {
        const idx = modules.findIndex(m => m.chapterId === chapterId && m.data?._id === moduleId);
        if (idx >= 0) {
            setShowRoadmap(false);
            // Wait for the player scroll container to mount (it's null when roadmap shows)
            setTimeout(() => {
                if (scrollContainerRef.current) {
                    isAutoScrolling.current = true;
                    scrollContainerRef.current.scrollTo({ top: idx * scrollContainerRef.current.clientHeight, behavior: 'instant' });
                    setActiveModuleIndex(idx);
                    setTimeout(() => { isAutoScrolling.current = false; }, 300);
                }
            }, 200);
        }
    }, [modules]);

    // Unlocking logic: module is unlocked if all previous modules are completed
    const getIsModuleUnlocked = useCallback((chapterId, moduleId) => {
        if (!progressData?.progress || !course?.chapters) return true;
        const allModules = [];
        course.chapters.forEach(ch => {
            (ch.modules || []).forEach(m => {
                allModules.push({ chapterId: ch._id, moduleId: m._id });
            });
        });
        const idx = allModules.findIndex(m => m.chapterId === chapterId && m.moduleId === moduleId);
        if (idx <= 0) return true;
        for (let i = 0; i < idx; i++) {
            const m = allModules[i];
            const completed = progressData.progress.some(
                p => p.chapterId === m.chapterId && p.moduleId === m.moduleId && p.completed
            );
            if (!completed) return false;
        }
        return true;
    }, [progressData, course?.chapters]);

    const jumpToChapter = useCallback((chapterId) => {
        // Find the first unlocked module in this chapter
        const chapterModules = modules.filter(m => m.chapterId === chapterId);
        for (const mod of chapterModules) {
            if (mod.data && getIsModuleUnlocked(chapterId, mod.data._id)) {
                jumpToModule(chapterId, mod.data._id);
                return;
            }
        }
        // Fallback: if no unlocked module found, jump to the first module anyway
        if (chapterModules.length > 0 && chapterModules[0].data) {
            jumpToModule(chapterId, chapterModules[0].data._id);
        }
    }, [modules, getIsModuleUnlocked, jumpToModule]);

    // Fetch other courses for related content
    useEffect(() => {
        const fetchAllCourses = async () => {
            try {
                const res = await fetch(`${BASE_URL}/bitesize-courses`);
                if (res.ok) {
                    const data = await res.json();
                    setAllCourses(data.filter(c => c.slug !== slug));
                }
            } catch (err) {
                console.error("Failed to fetch all courses:", err);
            }
        };
        fetchAllCourses();
    }, [slug]);

    // Listen for feedback event
    useEffect(() => {
        const handler = (e) => {
            setShowFeedback(true);
        };
        window.addEventListener('openFeedback', handler);
        return () => window.removeEventListener('openFeedback', handler);
    }, []);

    // Scroll handling with guard to prevent oscillation
    const handleScroll = useCallback((e) => {
        if (isAutoScrolling.current) return;
        const container = e.target;
        const scrollPosition = container.scrollTop;
        const itemHeight = container.clientHeight;
        const currentIndex = Math.round(scrollPosition / itemHeight);

        if (currentIndex !== activeModuleIndex) {
            setActiveModuleIndex(currentIndex);
            if (course?._id) localStorage.setItem(`bitesize_progress_${course._id}`, currentIndex);
        }
    }, [activeModuleIndex, course?._id]);

    // Restore saved progress
    useEffect(() => {
        if (!premiumContentLoaded || !modules.length || !scrollContainerRef.current || !course?._id) return;

        let targetIndex = null;
        try {
            const savedProgress = localStorage.getItem(`bitesize_progress_${course._id}`);
            if (savedProgress) {
                targetIndex = parseInt(savedProgress, 10);
            }
        } catch (e) { /* ignore */ }

        if (targetIndex !== null && targetIndex >= 0 && targetIndex < modules.length) {
            setActiveModuleIndex(targetIndex);
            setTimeout(() => {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTo({
                        top: targetIndex * scrollContainerRef.current.clientHeight,
                        behavior: 'instant'
                    });
                }
            }, 100);
        }
    }, [premiumContentLoaded, modules.length, course?._id]);

    if (loading) {
        return <div className="min-h-[100dvh] bg-black flex items-center justify-center"><Loader2 className="animate-spin text-[#eab308]" size={40} /></div>;
    }
    if (!course) return null;

    // Gatekeeper
    if (!premiumContentLoaded && !isAdmin) {
        return <Navigate to="/pro" state={{ returnTo: location.pathname }} replace />;
    }

    if (showRoadmap) {
        return (
            <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
                <RoadmapScreen
                    course={course}
                    onStart={() => setShowRoadmap(false)}
                    onBack={() => navigate('/')}
                    onChapterClick={jumpToModule}
                    onModuleClick={jumpToChapter}
                />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black z-50 flex justify-center w-full h-[100dvh]">
            <button onClick={() => setShowRoadmap(true)} className="absolute top-6 left-4 md:left-6 z-50 p-2 md:p-3 bg-black/40 backdrop-blur-md rounded-full text-white">
                <ChevronLeft size={24} />
            </button>
            <div className="w-full max-w-md h-full overflow-y-auto no-scrollbar relative bg-black">
                <div ref={scrollContainerRef} className="h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar" onScroll={handleScroll}>
                    {modules.length > 0 ? modules.map((item, index) => {
                        // Compute chapter info for the dot indicator
                        const moduleIdx = course?.chapters?.findIndex(ch => ch._id === item.chapterId);
                        const moduleNumber = moduleIdx !== undefined && moduleIdx >= 0 ? moduleIdx + 1 : 1;
                        const moduleData = moduleIdx >= 0 ? course?.chapters?.[moduleIdx] : null;
                        const moduleChaptersCount = moduleData?.modules?.length || 1;
                        const chIdx = moduleData?.modules?.findIndex(m => m._id === item.data?._id);
                        const chapterInModuleIndex = chIdx !== undefined && chIdx >= 0 ? chIdx : 0;

                        if (item.type === 'video') {
                            const isUnlocked = getIsModuleUnlocked(item.chapterId, item.data._id);
                            if (!isUnlocked) {
                                return (
                                    <div key={item.data._id || `v-${index}`} className="w-full h-[100dvh] flex-shrink-0 snap-center snap-always bg-[#0a0a0a] flex flex-col items-center justify-center p-8">
                                        <div className="w-20 h-20 rounded-full bg-gray-800/50 border border-gray-700/30 flex items-center justify-center mb-6">
                                            <Lock size={36} className="text-gray-600" />
                                        </div>
                                        <h2 className="text-xl font-black text-gray-500 mb-2 text-center">Module Locked</h2>
                                        <p className="text-gray-700 text-sm text-center max-w-xs">
                                            Complete all previous modules to unlock this video.
                                        </p>
                                        <div className="mt-8 flex items-center gap-2">
                                            <div className="h-px w-12 bg-gray-800" />
                                            <span className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">
                                                {item.chapterTitle}
                                            </span>
                                            <div className="h-px w-12 bg-gray-800" />
                                        </div>
                                        <p className="text-gray-700 text-xs mt-4">{item.data.title}</p>
                                    </div>
                                );
                            }
                            return (
                                <ShortVideo
                                    key={item.data._id || `v-${index}`}
                                    video={item.data}
                                    chapterId={item.chapterId}
                                    isActive={index === activeModuleIndex}
                                    courseTitle={course.title}
                                    courseHighlight={course.highlight}
                                    courseId={course._id}
                                    currentUserId={userId}
                                    moduleNumber={moduleNumber}
                                    moduleChaptersCount={moduleChaptersCount}
                                    chapterInModuleIndex={chapterInModuleIndex}
                                    onRefreshProgress={refreshProgress}
                                    onSwipeLeft={scrollToNext}
                                    onSwipeRight={scrollToPrev}
                                />
                            );
                        }

                        if (item.type === 'quiz') {
                            const isUnlocked = getIsModuleUnlocked(item.chapterId, item.data._id);
                            if (!isUnlocked) {
                                return (
                                    <div key={item.data._id || `q-${index}`} className="w-full h-[100dvh] flex-shrink-0 snap-center snap-always bg-[#0a0a0a] flex flex-col items-center justify-center p-8">
                                        <div className="w-20 h-20 rounded-full bg-gray-800/50 border border-gray-700/30 flex items-center justify-center mb-6">
                                            <Lock size={36} className="text-gray-600" />
                                        </div>
                                        <h2 className="text-xl font-black text-gray-500 mb-2 text-center">Quiz Locked</h2>
                                        <p className="text-gray-700 text-sm text-center max-w-xs">
                                            Complete all previous modules first to unlock this quiz.
                                        </p>
                                        <div className="mt-8 flex items-center gap-2">
                                            <div className="h-px w-12 bg-gray-800" />
                                            <span className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">
                                                {item.chapterTitle}
                                            </span>
                                            <div className="h-px w-12 bg-gray-800" />
                                        </div>
                                    </div>
                                );
                            }
                            return (
                                <InlineQuizModule
                                    key={item.data._id || `q-${index}`}
                                    quiz={item.data}
                                    chapterId={item.chapterId}
                                    courseId={course._id}
                                    course={course}
                                    relatedCourses={allCourses}                                     isCertificateModule={item.moduleIsCertificate}
                                    moduleNumber={moduleNumber}
                                    moduleChaptersCount={moduleChaptersCount}
                                    chapterInModuleIndex={chapterInModuleIndex}
                                    onRefreshProgress={refreshProgress}
                                    onComplete={() => {
                                        scrollToNext();
                                    }}
                                />
                            );
                        }
                        return null;
                    }) : (
                        <div className="w-full h-[100dvh] flex items-center justify-center text-gray-500">
                            <p>No content available yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {showFeedback && course && (
                <FeedbackOverlay
                    courseId={course._id}
                    onClose={() => setShowFeedback(false)}
                />
            )}

            <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                .animate-slide-up-fade { animation: slideUpFade 0.4s ease-out; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
            ` }} />
        </div>
    );
};

export default BiteSizeCoursePage;
