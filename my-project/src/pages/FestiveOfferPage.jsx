import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Clock, ShieldCheck, ArrowRight, Loader2, ChevronLeft,
    CheckCircle2, Gift, Timer
} from 'lucide-react';
import { BASE_URL } from '../config';
import { FESTIVE_OFFER_END, isFestiveLive } from '../festive';
import DiwaliSky from '../components/DiwaliSky';
import '../festive.css';

// Festive Bundle: the 3 recorded courses, matched by slug prefix so a
// re-seeded slug (with a new timestamp suffix) still resolves.
const BUNDLE_SLUGS = [
    'ms-excel-with-generative-ai',   // MS Excel
    'gen-ai-tools-mastery',           // AI Tools
    'power-bi-data-visualization'    // MS Power BI
];
// Names shown on this page. The database titles describe the live cohorts
// ("3 Month Live Power BI Cohort"), but this bundle sells the recorded versions.
const BUNDLE_TITLES = [
    'MS Excel with Generative AI',
    'Gen AI Tools Mastery',
    'Power BI Data Visualization'
];
const BUNDLE_PRICE = 199;

const loadScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const useCountdown = (target) => {
    const calc = () => {
        const diff = Math.max(0, target.getTime() - Date.now());
        return {
            days: Math.floor(diff / 86400000),
            hours: Math.floor(diff / 3600000) % 24,
            mins: Math.floor(diff / 60000) % 60,
            secs: Math.floor(diff / 1000) % 60
        };
    };
    const [time, setTime] = useState(calc);
    useEffect(() => {
        const id = setInterval(() => setTime(calc()), 1000);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return time;
};

const pad = (n) => String(n).padStart(2, '0');

const Lantern = ({ className, delay }) => (
    <svg viewBox="0 0 48 120" aria-hidden="true" className={`festive-lantern absolute top-0 ${className}`} style={{ animationDelay: delay }}>
        <line x1="24" y1="0" x2="24" y2="34" stroke="#fbbf24" strokeWidth="1.5" />
        <rect x="16" y="32" width="16" height="5" rx="2" fill="#fbbf24" />
        <path d="M24 37c14 0 20 11 20 21S38 79 24 79 4 68 4 58s6-21 20-21z" fill="#ea580c" />
        <path d="M24 37c6 0 9 11 9 21s-3 21-9 21-9-11-9-21 3-21 9-21z" fill="#fde047" opacity="0.75" />
        <rect x="16" y="78" width="16" height="4" rx="2" fill="#fbbf24" />
        <path d="M19 82v24M24 82v30M29 82v24" stroke="#f97316" strokeWidth="1.5" />
    </svg>
);

const Diya = ({ delay }) => (
    <svg viewBox="0 0 44 40" aria-hidden="true" className="festive-diya w-9 h-8 md:w-11 md:h-10">
        <path className="festive-flame" style={{ '--delay': delay }} d="M22 2c5 7 7 10 7 14a7 7 0 0 1-14 0c0-4 2-7 7-14z" fill="#fde047" />
        <path className="festive-flame" style={{ '--delay': delay }} d="M22 10c2.5 3.5 3.5 5 3.5 7a3.5 3.5 0 0 1-7 0c0-2 1-3.5 3.5-7z" fill="#f97316" />
        <path d="M2 24h40c-1 9-9 14-20 14S3 33 2 24z" fill="#c2410c" />
        <path d="M2 24h40l-1 3H3z" fill="#fbbf24" />
    </svg>
);

const FestiveOfferPage = () => {
    const navigate = useNavigate();
    const countdown = useCountdown(FESTIVE_OFFER_END);
    // Bhai Dooj window: Rs 199 live until 31 Dec 2026 23:59 IST. When expired, the
    // page shows "offer ended" copy and the CTAs route home instead of checkout.
    const isOfferLive = isFestiveLive();

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [paying, setPaying] = useState(false);
    const [enrolledIds, setEnrolledIds] = useState(new Set());
    const [purchased, setPurchased] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                const ids = new Set();
                (user.enrolledCourses || []).forEach((enc) => {
                    const itemId = typeof enc.item === 'object' ? enc.item?._id : enc.item;
                    if (itemId) ids.add(itemId.toString());
                });
                setEnrolledIds(ids);
            } catch { /* ignore malformed local state */ }
        }

        const fetchBundle = async () => {
            try {
                const response = await fetch(`${BASE_URL}/cohorts`);
                const data = await response.json();
                const all = data.data || data.cohorts || data;
                if (!Array.isArray(all)) throw new Error('Bad catalogue response');

                const picked = BUNDLE_SLUGS
                    .map((prefix) => all.find((c) => (c.slug || '').startsWith(prefix)))
                    .filter(Boolean);

                if (picked.length !== 3) throw new Error('Bundle courses not all available');
                setCourses(picked);
            } catch (err) {
                console.error('Error loading festive bundle:', err);
                setLoadError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchBundle();
    }, []);

    const getUser = () => {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    };

    const authHeaders = () => {
        const token = localStorage.getItem('token');
        return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    };

    const priceOf = (course) => course.pricing?.recorded?.discount ?? 199;
    const mrpOf = (course) => course.pricing?.recorded?.original ?? 999;

    const totalMrp = courses.reduce((sum, c) => sum + mrpOf(c), 0);
    const ownsAll = courses.length === 3 && courses.every((c) => enrolledIds.has(c._id.toString()));

    // LoginPage/ProfilePage only honour sessionStorage 'redirectAfterLogin'
    // (router state is ignored), so set it before sending the user to /login.
    // 'festiveCheckoutPending' lets the page resume checkout automatically
    // when the user lands back here after Google sign-in.
    const sendToLogin = () => {
        sessionStorage.setItem('redirectAfterLogin', '/festive-offer');
        sessionStorage.setItem('festiveCheckoutPending', String(Date.now()));
        navigate('/login');
    };

    const restoreHelp = (paymentId) =>
        `Your payment is safe, but we could not confirm it just now. Open your Profile, tap "Paid but courses missing?" and enter this payment id: ${paymentId}`;

    const handleBuy = async () => {
        const user = getUser();
        if (!user) {
            sendToLogin();
            return;
        }
        if (paying || courses.length !== 3) return;
        setPaying(true);

        try {
            const items = courses.map((course) => ({
                itemId: course._id,
                itemModel: 'Cohort',
                planType: 'recorded',
                paymentType: 'full',
                isPart2Payment: false
            }));

            const orderRes = await fetch(`${BASE_URL}/cohorts/create-order`, {
                method: 'POST',
                headers: authHeaders(),
                credentials: 'include',
                body: JSON.stringify({ items })
            });
            const data = await orderRes.json();

            if (!orderRes.ok || !data.success) {
                if (orderRes.status === 401 || orderRes.status === 403) {
                    alert('Your session has expired. Please log in again.');
                    sendToLogin();
                } else {
                    alert(data.message || 'Could not start the payment. Please try again.');
                }
                setPaying(false);
                return;
            }

            const ok = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
            if (!ok) {
                alert('Razorpay could not load. Check your internet connection.');
                setPaying(false);
                return;
            }

            const rzp = new window.Razorpay({
                key: data.key_id,
                amount: data.amount * 100,
                currency: 'INR',
                name: 'UPSKALE',
                description: 'Bhai Dooj Offer: 3-Course Recorded Bundle',
                order_id: data.order_id,
                handler: async (response) => {
                    try {
                        const verifyRes = await fetch(`${BASE_URL}/cohorts/verify-payment`, {
                            method: 'POST',
                            headers: authHeaders(),
                            credentials: 'include',
                            body: JSON.stringify(response)
                        });
                        const verify = await verifyRes.json();
                        if (verify.success) {
                            setPurchased(true);
                        } else {
                            alert(restoreHelp(response.razorpay_payment_id));
                        }
                    } catch {
                        alert(restoreHelp(response.razorpay_payment_id));
                    } finally {
                        setPaying(false);
                    }
                },
                modal: {
                    ondismiss: () => setPaying(false)
                },
                prefill: { name: user.name, email: user.email, contact: user.phone },
                theme: { color: '#008a45' }
            });
            rzp.on('payment.failed', (resp) => {
                alert(`Payment Failed: ${resp.error.description}`);
                setPaying(false);
            });
            rzp.open();
        } catch (err) {
            console.error('Festive checkout error:', err);
            alert('Something went wrong while starting the payment. Please try again.');
            setPaying(false);
        }
    };

    // Auto-resume: user clicked Buy, got sent to Google login, and is now
    // back on this page signed in. Re-open checkout once, automatically.
    const autoResumedRef = useRef(false);
    useEffect(() => {
        if (autoResumedRef.current) return;
        if (loading || courses.length !== 3 || ownsAll || !isOfferLive) return;
        const pendingAt = parseInt(sessionStorage.getItem('festiveCheckoutPending') || '0', 10);
        if (!pendingAt || Date.now() - pendingAt > 15 * 60 * 1000) return;
        if (!getUser()) return;
        autoResumedRef.current = true;
        sessionStorage.removeItem('festiveCheckoutPending');
        handleBuy();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, courses, ownsAll, isOfferLive]);

    const buyButtonContent = paying
        ? <><Loader2 size={20} className="animate-spin" /> Processing…</>
        : <>Buy Now @ ₹{BUNDLE_PRICE} <ArrowRight size={20} /></>;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="animate-spin text-yellow-500" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-yellow-500/30 pb-40 relative overflow-x-clip">
            <style>{`
                @keyframes shine-sweep {
                    0% { transform: translateX(-150%) skewX(-20deg); }
                    55%, 100% { transform: translateX(250%) skewX(-20deg); }
                }
                .shine-btn { position: relative; overflow: hidden; }
                .shine-btn::after {
                    content: '';
                    position: absolute;
                    top: 0; bottom: 0;
                    width: 45%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent);
                    animation: shine-sweep 2.2s ease-in-out infinite;
                }
            `}</style>

            {/* Festive glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-yellow-500 opacity-[0.07] blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-600 opacity-[0.05] blur-[150px] rounded-full" />
            </div>

            {isOfferLive && <DiwaliSky celebrate={purchased ? 1 : 0} className={purchased ? 'z-[70]' : 'z-[1]'} />}

            {isOfferLive && (
                <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none z-[2] overflow-hidden">
                    <Lantern className="left-[20%] w-7 md:left-[22%] md:w-12" delay="0s" />
                    <Lantern className="right-[32%] w-7 md:right-[22%] md:w-12" delay="-1.3s" />
                </div>
            )}

            {/* Top Nav */}
            <nav className="relative z-10 p-4 md:p-6 md:px-20 max-w-7xl mx-auto flex items-center justify-between border-b border-white/5">
                <button onClick={() => navigate(-1)} aria-label="Go back" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/10">
                    <ChevronLeft size={24} />
                </button>
                <div className="font-bold tracking-widest text-sm opacity-80 uppercase">
                    <img
                        src="https://res.cloudinary.com/dvcs9x8yp/image/upload/v1775412223/20250730_170449_0000_uq4d24.png"
                        alt="UPSKALE Logo"
                        className="h-6 w-auto object-contain"
                    />
                </div>
            </nav>

            <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6">
                {/* Bhai Dooj badge */}
                <div className="pt-4 md:pt-8 flex justify-center festive-rise">
                    <span className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-black font-black text-xs md:text-sm uppercase tracking-[0.2em] px-5 py-2 rounded-full shadow-[0_0_30px_rgba(234,179,8,0.45)]">
                        {isOfferLive ? 'Bhai Dooj Special · Ends 31 Dec' : 'Bhai Dooj Offer Ended'}
                    </span>
                </div>

                <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start pt-4 md:pt-8">
                    {/* Hero poster: its printed BUY NOW works like the real button */}
                    <div className="mb-6 lg:mb-0 lg:sticky lg:top-6 festive-rise" style={{ '--delay': '100ms' }}>
                        <button
                            type="button"
                            onClick={isOfferLive && !ownsAll && !loadError ? handleBuy : undefined}
                            aria-label={`Buy the Bhai Dooj bundle for ₹${BUNDLE_PRICE}`}
                            className="festive-frame max-w-[540px] mx-auto active:scale-[0.99] transition-transform"
                        >
                            <img
                                src="/festive-hero.png"
                                width="1086"
                                height="1448"
                                fetchPriority="high"
                                alt="Bhai Dooj Offer: Data Analyst Beginner Pack. 3 recorded courses, AI Tools, Microsoft Excel and Microsoft Power BI. Now only ₹199."
                            />
                        </button>
                        {isOfferLive && (
                            <div className="flex justify-center gap-5 md:gap-7 mt-5">
                                {['0ms', '-300ms', '-600ms', '-150ms', '-450ms'].map((delay) => <Diya key={delay} delay={delay} />)}
                            </div>
                        )}
                    </div>

                    {loadError ? (
                        <div className="text-center text-gray-400 py-16 px-4 border border-white/5 rounded-2xl bg-[#121212]">
                            <Gift size={36} className="mx-auto mb-4 text-yellow-500" />
                            <p className="font-semibold text-white mb-2">The festive bundle is being prepared.</p>
                            <p className="text-sm">Please check back in a little while, or browse all recorded courses from the home page.</p>
                        </div>
                    ) : (
                        <div className="max-w-2xl mx-auto w-full">
                            {isOfferLive && (
                                <div className="text-center lg:text-left mb-6 festive-rise" style={{ '--delay': '200ms' }}>
                                    <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
                                        3 courses. One Bhai Dooj price.
                                    </h1>
                                    <p className="mt-3 flex items-end justify-center lg:justify-start gap-3">
                                        <span className="festive-strike text-lg md:text-xl text-white/50 font-bold">₹{totalMrp || 2997}</span>
                                        <span className="festive-slam text-5xl md:text-6xl font-black leading-none text-yellow-400 drop-shadow-[0_0_24px_rgba(234,179,8,0.55)]">₹{BUNDLE_PRICE}</span>
                                    </p>
                                </div>
                            )}

                            {/* What's inside: compact rows */}
                            <div className="space-y-3">
                                {courses.map((course, index) => (
                                    <div
                                        key={course._id}
                                        className="festive-rise flex items-center gap-3 md:gap-4 bg-[#121212]/90 border border-white/5 rounded-2xl p-3 md:p-3.5"
                                        style={{ '--delay': `${300 + index * 120}ms` }}
                                    >
                                        <img
                                            src={course.thumbnail || '/placeholder-course.jpg'}
                                            alt={BUNDLE_TITLES[index]}
                                            className="w-20 h-14 object-cover rounded-lg border border-white/10 shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-white leading-snug line-clamp-2">{BUNDLE_TITLES[index]}</h3>
                                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                                                <Clock size={12} className="text-[#008a45] shrink-0" />
                                                Recorded · {Array.isArray(course.course) ? course.course.length : 0} modules · Certificate
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            {isOfferLive ? (
                                                <div className="text-[11px] font-black uppercase tracking-wide text-[#00d26a]">Included</div>
                                            ) : (
                                                <div className="font-black text-white">₹{priceOf(course)}</div>
                                            )}
                                            <div className="text-xs text-white/40 line-through">₹{mrpOf(course)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* One-line price + in-page CTA */}
                            <div className="mt-6 bg-[#121212]/90 border border-yellow-500/25 rounded-2xl p-5 text-center festive-rise" style={{ '--delay': '700ms' }}>
                                <p className="text-sm text-gray-400 mb-4">
                                    {isOfferLive ? (
                                        <>All 3 courses worth <span className="line-through">₹{totalMrp || 2997}</span> · Bhai Dooj bundle discount applied at checkout</>
                                    ) : (
                                        <>The Rs 199 Bhai Dooj offer ended on 31 Dec — the 3 recorded courses are still available at their regular prices</>
                                    )}
                                </p>
                                {ownsAll ? (
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="w-full py-4 bg-[#1a1a1a] border border-white/10 text-white font-bold rounded-xl hover:bg-white/5 transition-all flex justify-center items-center gap-2 active:scale-95"
                                    >
                                        <CheckCircle2 size={20} className="text-[#00d26a]" /> You own all 3 courses · Open Profile
                                    </button>
                                ) : isOfferLive ? (
                                    <button
                                        onClick={handleBuy}
                                        disabled={paying}
                                        className="shine-btn festive-ring w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-black text-lg rounded-xl hover:brightness-110 transition-all flex justify-center items-center gap-2 active:scale-95 disabled:opacity-60"
                                    >
                                        {buyButtonContent}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => navigate('/')}
                                        className="w-full py-4 bg-[#1a1a1a] border border-white/10 text-white font-bold rounded-xl hover:bg-white/5 transition-all flex justify-center items-center gap-2 active:scale-95"
                                    >
                                        Browse all courses <ArrowRight size={20} />
                                    </button>
                                )}
                                <p className="text-xs text-gray-500 mt-3.5 flex items-center justify-center gap-1.5">
                                    <ShieldCheck size={14} className="text-[#008a45] shrink-0" /> Secure payment by Razorpay · Instant access after payment
                                </p>
                            </div>

                            {/* FAQ: short */}
                            <div className="space-y-3 mt-6 mb-6">
                                {[
                                    { q: 'When do I get access?', a: 'Instantly after payment. All 3 courses appear in your Profile, with lifetime access.' },
                                    { q: 'Will I get certificates?', a: 'Yes, a verifiable certificate for each course on completion.' },
                                    { q: 'Which language?', a: 'Bengali + English, beginner friendly. Watch anytime on phone or laptop.' }
                                ].map((item) => (
                                    <div key={item.q} className="bg-[#121212]/90 border border-white/5 rounded-2xl p-4">
                                        <p className="font-bold text-white mb-1">{item.q}</p>
                                        <p className="text-sm text-gray-400 leading-relaxed">{item.a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sticky bottom offer bar: price + countdown + shine CTA */}
            {/* Hidden once the Bhai Dooj window ends (31 Dec 2026) */}
            {isOfferLive && !loadError && (
                <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d0d0d]/95 backdrop-blur border-t-2 border-yellow-500/60 shadow-[0_-10px_40px_rgba(0,0,0,0.7)] pb-[env(safe-area-inset-bottom)]">
                    {!ownsAll && (
                        <div className="md:hidden flex items-center justify-center gap-1.5 pt-2 text-[11px] font-bold uppercase tracking-wider text-red-400">
                            <Timer size={13} /> Offer ends in
                            <span className="text-white tabular-nums normal-case">
                                {countdown.days > 0 && `${countdown.days}d `}{pad(countdown.hours)}h {pad(countdown.mins)}m <span key={countdown.secs} className="festive-tick">{pad(countdown.secs)}s</span>
                            </span>
                        </div>
                    )}
                    <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5 md:py-3 flex items-center justify-between gap-3 md:gap-6">
                        <div className="shrink-0">
                            <div className="flex items-end gap-1.5">
                                <span className="text-2xl md:text-3xl font-black leading-none">₹{BUNDLE_PRICE}</span>
                                <span className="text-xs md:text-sm text-white/40 line-through mb-0.5">₹{totalMrp || 2997}</span>
                            </div>
                            <div className="text-[10px] text-[#eab308] uppercase tracking-wider font-bold mt-1">3 courses · Bhai Dooj Offer</div>
                        </div>

                        {!ownsAll && (
                            <div className="hidden md:flex flex-col items-center shrink-0">
                                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-400 mb-1.5">
                                    <Timer size={13} /> Bhai Dooj offer ends in
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {[
                                        { v: countdown.days, l: 'Days' },
                                        { v: countdown.hours, l: 'Hrs' },
                                        { v: countdown.mins, l: 'Min' },
                                        { v: countdown.secs, l: 'Sec' }
                                    ].map((u, i) => (
                                        <React.Fragment key={u.l}>
                                            <div className="flex flex-col items-center">
                                                <span className="bg-[#1c1c1c] border border-white/10 rounded-md px-2 py-1 text-base font-black tabular-nums leading-none min-w-[40px] text-center overflow-hidden">
                                                    <span key={u.v} className="festive-tick">{pad(u.v)}</span>
                                                </span>
                                                <span className="text-[9px] text-gray-500 uppercase mt-1 font-bold">{u.l}</span>
                                            </div>
                                            {i < 3 && <span className="font-black text-gray-600 -mt-3.5">:</span>}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        )}

                        {ownsAll ? (
                            <button
                                onClick={() => navigate('/profile')}
                                className="px-5 md:px-8 py-3 md:py-3.5 bg-[#1a1a1a] border border-white/15 text-white font-black rounded-xl active:scale-95 transition-all flex items-center gap-2"
                            >
                                <CheckCircle2 size={18} className="text-[#00d26a]" /> Open Profile
                            </button>
                        ) : (
                            <button
                                onClick={handleBuy}
                                disabled={paying}
                                className="shine-btn festive-ring flex-1 md:flex-none justify-center px-5 md:px-8 py-3 md:py-3.5 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-black text-sm md:text-base rounded-xl active:scale-95 transition-all disabled:opacity-60 flex items-center gap-2 whitespace-nowrap"
                            >
                                {buyButtonContent}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Thank-you card after a successful payment */}
            {purchased && (
                <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-5">
                    <div className="festive-pop w-full max-w-sm bg-[#121212] border border-yellow-500/40 rounded-3xl p-7 text-center shadow-[0_0_60px_rgba(234,179,8,0.3)]">
                        <div className="flex justify-center mb-3"><Diya delay="0ms" /></div>
                        <h2 className="text-2xl font-black">Happy Bhai Dooj!</h2>
                        <p className="text-gray-300 mt-2 mb-6">All 3 courses are now yours. Open your Profile to start learning.</p>
                        <button
                            onClick={() => navigate('/profile')}
                            className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-black rounded-xl active:scale-95 transition-all flex justify-center items-center gap-2"
                        >
                            Start Learning <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FestiveOfferPage;
