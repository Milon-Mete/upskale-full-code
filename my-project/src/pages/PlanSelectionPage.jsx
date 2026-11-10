import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Award, CalendarDays, CircleCheck, Loader2, ShieldCheck, Smartphone, Sparkles, X } from 'lucide-react';
import { BASE_URL } from '../config';
import LoginModal from '../components/LoginModal';
import '../swipes.css';
import { SWIPES_PRICE, SWIPES_LAUNCH_END, swipesMonths } from '../swipes';

// Swipes Pro is on sale. Set to false to show "Opening soon" and stop checkout.
const SALES_OPEN = true;

const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const rupees = (amount) => `₹${amount.toLocaleString('en-IN')}`;
const pad = (n) => String(n).padStart(2, '0');

const authHeaders = () => {
    const token = localStorage.getItem('token');
    return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};

const timeLeft = (target) => {
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor(diff / 3600000) % 24,
        mins: Math.floor(diff / 60000) % 60,
        secs: Math.floor(diff / 1000) % 60
    };
};

const useCountdown = (target) => {
    const [left, setLeft] = useState(() => timeLeft(target));
    useEffect(() => {
        const id = setInterval(() => setLeft(timeLeft(target)), 1000);
        return () => clearInterval(id);
    }, [target]);
    return left;
};

const BULBS = ['#ef4444', '#fbbf24', '#fde047', '#f97316', '#fbbf24', '#ef4444', '#fde047', '#f97316', '#fbbf24'];

const Garland = () => (
    <svg className="pro-garland" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 8 Q100 50 200 22 T400 14" fill="none" stroke="#b45309" strokeWidth="1.5" opacity="0.6" />
        {BULBS.map((color, i) => {
            const x = 20 + i * 45;
            const y = i % 2 ? 30 : 22;
            return <circle key={i} className="pro-bulb" cx={x} cy={y} r="6" fill={color} style={{ '--delay': `${i * 0.23}s` }} />;
        })}
    </svg>
);

const BigDiya = () => (
    <div className="pro-diya-wrap" aria-hidden="true">
        <span className="pro-sparkle" style={{ left: '12%', top: '30%', '--delay': '0s' }}>✦</span>
        <span className="pro-sparkle" style={{ right: '10%', top: '22%', '--delay': '0.8s' }}>✦</span>
        <span className="pro-sparkle pro-sparkle-sm" style={{ left: '22%', top: '72%', '--delay': '1.4s' }}>✦</span>
        <span className="pro-sparkle pro-sparkle-sm" style={{ right: '20%', top: '78%', '--delay': '0.4s' }}>✦</span>
        <svg viewBox="0 0 200 170" className="pro-diya">
            <defs>
                <radialGradient id="proGlow" cx="50%" cy="40%" r="50%">
                    <stop offset="0%" stopColor="#fde68a" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
                </radialGradient>
            </defs>
            <circle className="pro-glow" cx="100" cy="60" r="62" fill="url(#proGlow)" />
            <path className="pro-flame" d="M100 6c14 20 20 32 20 44a20 20 0 0 1-40 0c0-12 6-24 20-44z" fill="#fbbf24" />
            <path className="pro-flame" d="M100 30c6 9 9 15 9 21a9 9 0 0 1-18 0c0-6 3-12 9-21z" fill="#fff7d6" />
            <path d="M20 128c22-22 48-28 80-28s58 6 80 28c-26 4-52 6-80 6s-54-2-80-6z" fill="#fcd34d" />
            <path d="M46 128c10-18 30-26 54-26s44 8 54 26c-16 3-34 4-54 4s-38-1-54-4z" fill="#f472b6" opacity="0.85" />
            <path d="M42 86h116c-4 22-28 36-58 36S46 108 42 86z" fill="#c2410c" />
            <path d="M42 86h116l-3 7H45z" fill="#7c2d12" />
        </svg>
    </div>
);

const PlanSelectionPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const returnPath = location.state?.returnTo || '/';

    const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [message, setMessage] = useState('');
    const countdown = useCountdown(SWIPES_LAUNCH_END);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        document.body.appendChild(script);
    }, []);

    const refreshUser = async () => {
        if (!currentUser?._id) return;
        try {
            const res = await fetch(`${BASE_URL}/user/${currentUser._id}`, { headers: authHeaders(), credentials: 'include' });
            if (!res.ok) return;
            const fresh = await res.json();
            localStorage.setItem('user', JSON.stringify(fresh));
            setCurrentUser(fresh);
        } catch (err) {
            console.error('Could not refresh the user', err);
        }
    };

    const subscription = currentUser?.biteSizeSubscription;
    const isActive = subscription?.status === 'active' && subscription?.expiresAt && new Date(subscription.expiresAt) > new Date();
    const autopayOn = subscription?.autopayStatus === 'on';
    const months = swipesMonths();
    const isLaunchOffer = months === 18;
    const renewsOn = new Date();
    renewsOn.setMonth(renewsOn.getMonth() + months);
    // What the same months would cost at the regular yearly price.
    const regularValue = Math.round((SWIPES_PRICE / 12) * months);
    const perMonth = Math.round(SWIPES_PRICE / months);
    const buyLabel = !SALES_OPEN ? 'Opening soon' : `Get ${months} months at ${rupees(SWIPES_PRICE)}`;

    const handleSubscribe = async () => {
        if (!currentUser) {
            setShowLoginModal(true);
            return;
        }
        setProcessing(true);
        setMessage('');
        try {
            const initRes = await fetch(`${BASE_URL}/bitesize-courses/subscribe`, {
                method: 'POST', headers: authHeaders(), credentials: 'include', body: JSON.stringify({})
            });
            const init = await initRes.json();

            if (initRes.status === 401 || initRes.status === 403) {
                localStorage.removeItem('user');
                setCurrentUser(null);
                setShowLoginModal(true);
                setProcessing(false);
                return;
            }
            if (!initRes.ok) {
                setMessage(init.message || 'Could not start autopay.');
                setProcessing(false);
                return;
            }

            const rzp = new window.Razorpay({
                key: init.key_id,
                subscription_id: init.subscription_id,
                name: 'UPSKALE Swipes Pro',
                description: `${rupees(SWIPES_PRICE)} for ${init.months} months, then ${rupees(SWIPES_PRICE)}/year on autopay`,
                prefill: { name: currentUser.name, email: currentUser.email, contact: currentUser.phone },
                theme: { color: '#dc2626' },
                modal: { ondismiss: () => setProcessing(false) },
                handler: async (response) => {
                    try {
                        await fetch(`${BASE_URL}/bitesize-courses/subscribe/verify`, {
                            method: 'POST', headers: authHeaders(), credentials: 'include', body: JSON.stringify(response)
                        });
                    } catch (err) {
                        console.error('Verify did not reach the server, the webhook will finish it', err);
                    }
                    // Stay here: the page switches to the member card with Start learning.
                    await refreshUser();
                    setProcessing(false);
                    setMessage('Welcome to Swipes Pro!');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
            rzp.on('payment.failed', (response) => {
                setMessage(`Payment failed. ${response.error.description}`);
                setProcessing(false);
            });
            rzp.open();
        } catch (err) {
            console.error('Subscribe error', err);
            setMessage('Connection error. Please try again.');
            setProcessing(false);
        }
    };

    const handleCancel = async () => {
        setProcessing(true);
        try {
            const res = await fetch(`${BASE_URL}/bitesize-courses/subscribe/cancel`, {
                method: 'POST', headers: authHeaders(), credentials: 'include'
            });
            const data = await res.json();
            setMessage(data.message);
            if (res.ok) await refreshUser();
        } catch {
            setMessage('Connection error. Please try again.');
        } finally {
            setConfirmCancel(false);
            setProcessing(false);
        }
    };

    return (
        <div className="pro-page min-h-screen font-sans pb-40 overflow-x-clip text-[#3b1d0a]">
            {showLoginModal && (
                <LoginModal
                    onClose={() => setShowLoginModal(false)}
                    onSuccess={(user) => {
                        setCurrentUser(user);
                        setShowLoginModal(false);
                    }}
                />
            )}

            <Garland />

            <button
                onClick={() => navigate(returnPath === '/' ? -1 : returnPath)}
                aria-label="Close"
                className="fixed top-4 right-4 z-30 w-12 h-12 rounded-full bg-white/90 shadow-md flex items-center justify-center active:scale-95 transition-transform"
            >
                <X size={24} />
            </button>

            <main className="relative z-10 max-w-md mx-auto px-5 pt-14 text-center">
                <BigDiya />

                <span className="swipe-rise inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-full shadow-lg shadow-red-600/30">
                    <Sparkles size={14} /> {isLaunchOffer ? 'Swipes Pro launch offer' : 'Swipes Pro'}
                </span>

                <h1 className="swipe-rise text-[2rem] leading-tight font-black tracking-tight mt-4" style={{ '--delay': '80ms' }}>
                    {isLaunchOffer ? (
                        <>12 months + <span className="text-red-600">6 months FREE</span></>
                    ) : (
                        <>1 year of <span className="text-red-600">Swipes Pro</span></>
                    )}
                </h1>

                {isLaunchOffer && (
                    <p className="swipe-rise mt-3 text-[#6b3a1a] font-semibold flex items-center justify-center gap-2" style={{ '--delay': '140ms' }}>
                        <CalendarDays size={18} className="text-red-600" /> Launch offer, till 31 Dec
                    </p>
                )}

                {isLaunchOffer && !isActive && (
                    <div className="swipe-rise pro-timer mt-6" style={{ '--delay': '200ms' }}>
                        <p className="text-[#fcd34d] text-xs font-black uppercase tracking-[0.25em] flex items-center justify-center gap-2">
                            <span className="pro-live-dot" /> Offer ends in
                        </p>
                        <div className="grid grid-cols-4 gap-2 mt-3">
                            {[['Days', countdown.days], ['Hrs', countdown.hours], ['Min', countdown.mins], ['Sec', countdown.secs]].map(([label, value]) => (
                                <div key={label} className="pro-timer-cell">
                                    <span key={value} className="pro-tick block text-3xl font-black text-[#fcd34d] tabular-nums">{pad(value)}</span>
                                    <span className="block text-[10px] font-bold uppercase tracking-widest text-[#fcd34d]/70 mt-1">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {isActive ? (
                    <div className="swipe-rise mt-8 bg-white rounded-3xl p-6 shadow-xl shadow-orange-900/10 text-center" style={{ '--delay': '260ms' }}>
                        <CircleCheck size={40} className="text-green-600 mx-auto mb-3" />
                        <h2 className="text-2xl font-black">You're on Swipes Pro</h2>
                        <p className="text-[#6b3a1a] text-sm mt-2">Access until {formatDate(subscription.expiresAt)}</p>
                        {autopayOn && subscription.nextChargeAt && (
                            <p className="text-[#6b3a1a] text-sm mt-2">Autopay is on. Next charge on {formatDate(subscription.nextChargeAt)}.</p>
                        )}
                        <button onClick={() => navigate('/premium')} className="w-full mt-5 py-3.5 rounded-xl bg-red-600 text-white font-black active:scale-95 transition-transform">
                            Start learning
                        </button>
                        {autopayOn && (confirmCancel ? (
                            <div className="mt-4 text-sm">
                                <p className="text-[#6b3a1a] mb-3">Cancel autopay? You keep access until the date above.</p>
                                <div className="flex gap-2">
                                    <button onClick={handleCancel} disabled={processing} className="flex-1 py-3 rounded-xl border border-red-300 text-red-600 font-bold">
                                        {processing ? 'Cancelling…' : 'Yes, cancel'}
                                    </button>
                                    <button onClick={() => setConfirmCancel(false)} className="flex-1 py-3 rounded-xl border border-[#e7c9a0] font-bold">Keep it</button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => setConfirmCancel(true)} className="mt-4 text-sm text-[#6b3a1a] underline">Cancel autopay</button>
                        ))}
                        {message && <p className="text-sm font-bold text-green-700 mt-3">{message}</p>}
                    </div>
                ) : (
                    <>
                        <p className="swipe-rise mt-9 text-sm font-black uppercase tracking-[0.25em] text-[#8a5a35]" style={{ '--delay': '260ms' }}>
                            Swipes Pro · {months} months
                        </p>
                        <div className="swipe-rise flex items-center justify-center gap-4 mt-1" style={{ '--delay': '300ms' }}>
                            <span className="swipe-pop pro-price">{rupees(SWIPES_PRICE)}</span>
                            {isLaunchOffer && (
                                <span className="text-left">
                                    <s className="block text-2xl font-black text-[#a1785a]">{rupees(regularValue)}</s>
                                    <span className="block text-sm font-black text-green-600 uppercase tracking-wide">6 months free</span>
                                </span>
                            )}
                        </div>

                        <div className="swipe-rise grid grid-cols-3 gap-3 mt-7" style={{ '--delay': '360ms' }}>
                            <div className="pro-tile">
                                <span className="text-2xl font-black text-orange-500">≈₹{perMonth}</span>
                                <span className="text-xs font-semibold text-[#6b3a1a] mt-1">per month</span>
                            </div>
                            <div className="pro-tile">
                                <Award size={26} className="text-orange-500" />
                                <span className="text-xs font-semibold text-[#6b3a1a] mt-1">Certificate with every course</span>
                            </div>
                            <div className="pro-tile">
                                <Smartphone size={26} className="text-orange-500" />
                                <span className="text-xs font-semibold text-[#6b3a1a] mt-1">Short lessons on your phone</span>
                            </div>
                        </div>

                        <p className="swipe-rise text-xs text-[#8a5a35] leading-relaxed mt-6" style={{ '--delay': '420ms' }}>
                            Pay {rupees(SWIPES_PRICE)} today for {months} months. Autopay renews at {rupees(SWIPES_PRICE)}/year on {formatDate(renewsOn)}.
                            Cancel anytime and keep access until the end of what you paid for.
                        </p>
                        <p className="text-xs text-[#8a5a35] mt-2 flex items-center justify-center gap-1.5">
                            <ShieldCheck size={14} className="text-green-600 shrink-0" /> Secure autopay by Razorpay
                        </p>
                    </>
                )}
            </main>

            {!isActive && (
                <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pt-3 pb-[calc(0.9rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-[#fde9c8] via-[#fde9c8]/95 to-transparent">
                    <div className="max-w-md mx-auto">
                        {message && <p className="text-sm font-semibold text-red-700 text-center mb-2">{message}</p>}
                        <button
                            onClick={handleSubscribe}
                            disabled={processing || !SALES_OPEN}
                            className="pro-cta w-full py-4 rounded-2xl text-white font-black text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60"
                        >
                            {processing ? <Loader2 size={22} className="animate-spin" /> : <>{buyLabel} <ArrowRight size={22} /></>}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlanSelectionPage;
