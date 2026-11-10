import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Award, ArrowRight, BookOpen, Check, ChevronLeft, CircleCheck, Loader2, Play, ShieldCheck, Smartphone, Sparkles } from 'lucide-react';
import { BASE_URL } from '../config';
import LoginModal from '../components/LoginModal';
import '../swipes.css';
import { SWIPES_PRICE, swipesMonths } from '../swipes';

// Sales stay closed until the real test purchase passes. /pro?launch opens checkout for that test.
const SALES_OPEN = new URLSearchParams(window.location.search).has('launch');

const BENEFITS = [
    { icon: Smartphone, title: 'Made for your phone', text: 'Short lessons you swipe through, anywhere.' },
    { icon: BookOpen, title: 'Every Swipes course', text: 'One plan unlocks all of them for the whole year.' },
    { icon: Award, title: 'Certificates included', text: 'Finish a course and earn a verifiable certificate.' }
];

const STEPS = [
    { icon: Play, label: 'Watch', tint: 'from-amber-400 to-orange-600' },
    { icon: Sparkles, label: 'Practise', tint: 'from-emerald-400 to-teal-700' },
    { icon: Award, label: 'Get certified', tint: 'from-fuchsia-500 to-indigo-700' }
];

const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const rupees = (amount) => `₹${amount.toLocaleString('en-IN')}`;

const authHeaders = () => {
    const token = localStorage.getItem('token');
    return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};

const PhoneDeck = () => (
    <div className="swipe-phone" aria-hidden="true">
        <div className="swipe-screen">
            {STEPS.map(({ icon: Icon, label, tint }, index) => (
                <div key={label} className={`swipe-slide bg-gradient-to-br ${tint}`} style={{ '--slide': index }}>
                    <Icon size={44} />
                    <span>{label}</span>
                </div>
            ))}
            <div className="swipe-progress"><i /></div>
        </div>
        <div className="swipe-finger" />
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
    const buyLabel = !SALES_OPEN ? 'Opening soon' : isLaunchOffer ? `Get ${months} months for ${rupees(SWIPES_PRICE)}` : `Pay ${rupees(SWIPES_PRICE)}`;

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
                theme: { color: '#eab308' },
                modal: { ondismiss: () => setProcessing(false) },
                handler: async (response) => {
                    try {
                        await fetch(`${BASE_URL}/bitesize-courses/subscribe/verify`, {
                            method: 'POST', headers: authHeaders(), credentials: 'include', body: JSON.stringify(response)
                        });
                    } catch (err) {
                        console.error('Verify did not reach the server, the webhook will finish it', err);
                    }
                    await refreshUser();
                    setProcessing(false);
                    navigate(returnPath, { replace: true });
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
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-44 lg:pb-16 overflow-x-clip selection:bg-yellow-500/30">
            {showLoginModal && (
                <LoginModal
                    onClose={() => setShowLoginModal(false)}
                    onSuccess={(user) => {
                        setCurrentUser(user);
                        setShowLoginModal(false);
                    }}
                />
            )}

            <div className="fixed inset-0 pointer-events-none">
                <div className="swipe-glow absolute top-[-15%] left-1/2 w-[620px] h-[620px] bg-yellow-500 opacity-[0.1] blur-[140px] rounded-full" />
            </div>

            <button
                onClick={() => navigate(returnPath === '/' ? -1 : returnPath)}
                aria-label="Go back"
                className="absolute top-5 left-4 lg:left-10 z-20 p-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
            >
                <ChevronLeft size={24} />
            </button>

            <main className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pt-20 lg:pt-24 lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
                <section className="text-center lg:text-left">
                    <p className="swipe-rise inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-yellow-400 mb-4">
                        <Sparkles size={14} /> Swipes Pro
                    </p>
                    <h1 className="swipe-rise text-4xl md:text-6xl font-black tracking-tight leading-[1.05]" style={{ '--delay': '80ms' }}>
                        Fewer reels.<br />
                        <span className="swipe-shimmer">More skills.</span>
                    </h1>
                    <p className="swipe-rise text-gray-400 text-lg mt-4 max-w-md mx-auto lg:mx-0" style={{ '--delay': '160ms' }}>
                        Short lessons built for your phone, with a certificate at the end.
                    </p>
                    <div className="swipe-rise my-8 lg:hidden" style={{ '--delay': '220ms' }}><PhoneDeck /></div>

                    <ul className="mt-8 space-y-3 max-w-md mx-auto lg:mx-0 text-left">
                        {BENEFITS.map(({ icon: Icon, title, text }, index) => (
                            <li key={title} className="swipe-rise flex items-center gap-4 bg-white/[0.04] border border-white/10 rounded-2xl p-4" style={{ '--delay': `${280 + index * 90}ms` }}>
                                <span className="w-11 h-11 shrink-0 rounded-xl bg-yellow-500/15 text-yellow-400 flex items-center justify-center"><Icon size={22} /></span>
                                <span>
                                    <span className="block font-bold">{title}</span>
                                    <span className="block text-sm text-gray-400">{text}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="mt-8 lg:mt-0">
                    <div className="hidden lg:block mb-8"><PhoneDeck /></div>

                    <div className="swipe-rise swipe-card max-w-md mx-auto" style={{ '--delay': '420ms' }}>
                        {isActive ? (
                            <div className="text-center">
                                <CircleCheck size={40} className="text-[#00d26a] mx-auto mb-3" />
                                <h2 className="text-2xl font-black">You're on Swipes Pro</h2>
                                <p className="text-gray-400 text-sm mt-2">Access until {formatDate(subscription.expiresAt)}</p>
                                {autopayOn && subscription.nextChargeAt && (
                                    <p className="text-gray-300 text-sm mt-3">Autopay is on. Next charge on {formatDate(subscription.nextChargeAt)}.</p>
                                )}
                                <button onClick={() => navigate('/premium')} className="w-full mt-5 py-3.5 rounded-xl bg-white text-black font-black active:scale-95 transition-transform">
                                    Start learning
                                </button>
                                {autopayOn && (confirmCancel ? (
                                    <div className="mt-4 text-sm">
                                        <p className="text-gray-300 mb-3">Cancel autopay? You keep access until the date above.</p>
                                        <div className="flex gap-2">
                                            <button onClick={handleCancel} disabled={processing} className="flex-1 py-3 rounded-xl border border-red-500/50 text-red-400 font-bold">
                                                {processing ? 'Cancelling…' : 'Yes, cancel'}
                                            </button>
                                            <button onClick={() => setConfirmCancel(false)} className="flex-1 py-3 rounded-xl border border-white/15 font-bold">Keep it</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => setConfirmCancel(true)} className="mt-4 text-sm text-gray-400 underline">Cancel autopay</button>
                                ))}
                            </div>
                        ) : (
                            <>
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-400">
                                    {isLaunchOffer ? 'Launch offer · till 31 Dec' : 'Swipes Pro yearly'}
                                </p>
                                <div className="flex items-end gap-2 mt-2">
                                    <span className="swipe-pop text-6xl font-black leading-none">{rupees(SWIPES_PRICE)}</span>
                                    <span className="text-gray-400 font-semibold mb-1">for {months} months</span>
                                </div>
                                {isLaunchOffer && (
                                    <p className="mt-2 inline-block text-xs font-black uppercase tracking-wider text-black bg-[#00d26a] px-2.5 py-1 rounded-md">12 months + 6 months free</p>
                                )}

                                <ol className="mt-5 space-y-2.5 text-sm">
                                    <li className="flex gap-2.5"><Check size={18} className="text-[#00d26a] shrink-0" /><span><b>Today:</b> {rupees(SWIPES_PRICE)} for {months} months of access</span></li>
                                    <li className="flex gap-2.5"><Check size={18} className="text-[#00d26a] shrink-0" /><span><b>{formatDate(renewsOn)}:</b> renews at {rupees(SWIPES_PRICE)}/year on autopay</span></li>
                                    <li className="flex gap-2.5"><Check size={18} className="text-[#00d26a] shrink-0" /><span><b>Cancel anytime:</b> you keep access until the end of what you paid for</span></li>
                                </ol>

                                <button onClick={handleSubscribe} disabled={processing || !SALES_OPEN} className="hidden lg:flex swipe-cta w-full mt-6 py-4 rounded-xl text-black font-black text-lg items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60">
                                    {processing ? <Loader2 size={20} className="animate-spin" /> : <>{buyLabel} <ArrowRight size={20} /></>}
                                </button>

                                <p className="text-xs text-gray-400 leading-relaxed mt-4">
                                    Autopay renews automatically until you cancel. Cancel anytime from this page.
                                </p>
                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#008a45] shrink-0" /> Secure autopay by Razorpay</p>
                            </>
                        )}
                        {message && <p className="text-sm text-yellow-300 mt-3 text-center">{message}</p>}
                    </div>
                </section>
            </main>

            {!isActive && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0d0d0d]/95 backdrop-blur border-t border-yellow-500/40 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
                    <button onClick={handleSubscribe} disabled={processing || !SALES_OPEN} className="swipe-cta w-full py-4 rounded-xl text-black font-black text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60">
                        {processing ? <Loader2 size={20} className="animate-spin" /> : <>{buyLabel} <ArrowRight size={20} /></>}
                    </button>
                    {message && <p className="text-xs text-yellow-300 text-center mt-2">{message}</p>}
                    <p className="text-[11px] text-gray-400 text-center mt-2">
                        Renews at {rupees(SWIPES_PRICE)}/year on {formatDate(renewsOn)}. Cancel anytime.
                    </p>
                </div>
            )}
        </div>
    );
};

export default PlanSelectionPage;
