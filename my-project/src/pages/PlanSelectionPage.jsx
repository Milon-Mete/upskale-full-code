import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Award, ShieldCheck, ArrowRight, ChevronLeft, Lock, Star, Check, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { BASE_URL } from '../config'; 
import LoginModal from '../components/LoginModal'; 

const PlanSelectionPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Return path logic
    const returnPath = location.state?.returnTo || '/';

    const [selectedPlan, setSelectedPlan] = useState('monthly');
    const [openFaq, setOpenFaq] = useState(null);
    const [previewLocked, setPreviewLocked] = useState(false);
    const previewVideoRef = useRef(null);

    // 🔴 AUTH STATE 
    const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);

    useEffect(() => {
        const syncUser = () => {
            const stored = localStorage.getItem('user');
            if (stored) {
                setCurrentUser(JSON.parse(stored));
            }
        };
        syncUser();
        window.addEventListener('storage', syncUser);
        return () => window.removeEventListener('storage', syncUser);
    }, []);

    const genericPlatformTrailerUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

    const testimonials = [
        { name: "Aarav Sharma", initial: "A", rating: 5, text: "This platform is such a gem. I upgraded to their pro plan and absolutely love using it. Thank u so much" },
        { name: "Priya Verma", initial: "P", rating: 4, text: "App bohat acha hai aur cost ke hisab se pro features kafi affordable hai. Apko pro features try karna chaiye" },
        { name: "Aarav Sharma", initial: "A", rating: 5, text: "Great for self-study. If you want to study without getting distracted then you should buy their pro mode." }
    ];
    
    const features = [
        { name: "Unlimited Module Access", free: true, pro: true },
        { name: "Community Access", free: true, pro: true },
        { name: "Premium Certifications", free: false, pro: true },
        { name: "Downloadable Resources", free: false, pro: true },
    ];
    
    const faqs = [
        { q: "How does the PRO plan help me get hired?", a: "PRO gives you direct access to our hiring partners, resume reviews, and mock interviews that free users do not get." },
        { q: "In which languages is the platform available?", a: "Our platform currently supports English, Hindi, and Bengali to help you navigate and manage your account in your preferred language." }
    ];

    useEffect(() => {
        const loadRazorpay = () => {
            return new Promise((resolve) => {
                const script = document.createElement("script");
                script.src = "https://checkout.razorpay.com/v1/checkout.js";
                script.onload = () => resolve(true);
                script.onerror = () => resolve(false);
                document.body.appendChild(script);
            });
        };
        loadRazorpay();
    }, []);

    useEffect(() => {
        if (previewVideoRef.current && !previewLocked) {
            const playPromise = previewVideoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => console.log("Autoplay blocked", e));
            }
        }
    }, [previewLocked]);

    // --- SUBSCRIPTION STATUS CALCULATION ---
    const subscription = currentUser?.biteSizeSubscription;
    const isActive = subscription?.status === 'active' && subscription?.expiresAt && new Date(subscription.expiresAt) > new Date();

    let daysLeft = 0;
    if (isActive) {
        const diffTime = new Date(subscription.expiresAt).getTime() - new Date().getTime();
        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const handleProceedToPayment = async () => {
        if (!currentUser) {
            setShowLoginModal(true);
            return;
        }

        setProcessingPayment(true);
        try {
            const initRes = await fetch(`${BASE_URL}/bitesize-courses/create-checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ planType: selectedPlan })
            });

            const initData = await initRes.json();

            // CATCH EXPIRED SESSIONS
            if (initRes.status === 401 || initRes.status === 403) {
                localStorage.removeItem('user');
                setCurrentUser(null);
                setShowLoginModal(true);
                setProcessingPayment(false);
                return;
            }

            if (!initRes.ok) {
                alert(initData.message || "Failed to initialize payment.");
                setProcessingPayment(false);
                return;
            }

            const options = {
                key: initData.key_id,
                amount: initData.amount * 100, 
                currency: "INR",
                name: "UPSKALE PRO",
                description: initData.description,
                order_id: initData.order_id,
                prefill: {
                    name: currentUser.name,
                    email: currentUser.email,
                    contact: currentUser.phone
                },
                handler: async function (response) {
                    try {
                        const verifyRes = await fetch(`${BASE_URL}/bitesize-courses/verify-payment`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });

                        const verifyData = await verifyRes.json();

                        if (verifyRes.ok) {
                            // 🔴 CRITICAL FIX: Fetch fresh user profile from DB to get the exact expiresAt date
                            try {
                                const freshUserRes = await fetch(`${BASE_URL}/user/${currentUser._id}`, {
                                    method: 'GET',
                                    headers: { 'Content-Type': 'application/json' },
                                    credentials: 'include'
                                });
                                if (freshUserRes.ok) {
                                    const freshUser = await freshUserRes.json();
                                    localStorage.setItem('user', JSON.stringify(freshUser));
                                    setCurrentUser(freshUser); // Updates state immediately so UI changes
                                }
                            } catch (e) {
                                console.error("Could not fetch fresh user data", e);
                            }

                            alert("Payment Successful! Welcome to PRO.");
                            navigate(returnPath, { replace: true }); 
                        } else {
                            alert(verifyData.message || "Payment verification failed.");
                        }
                    } catch (err) {
                        alert("Error verifying payment. Please contact support.");
                    }
                },
                theme: { color: "#eab308" }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                alert("Payment failed. " + response.error.description);
            });
            rzp.open();

        } catch (err) {
            console.error("Checkout error:", err);
            alert("Connection error. Could not start checkout.");
        } finally {
            setProcessingPayment(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-40 lg:pb-16 selection:bg-yellow-500/30">

            {/* LOGIN MODAL */}
            {showLoginModal && (
                <LoginModal 
                    onClose={() => setShowLoginModal(false)} 
                    onSuccess={(user) => {
                        setCurrentUser(user);
                        setShowLoginModal(false);
                    }} 
                />
            )}

            {/* VIDEO HEADER */}
            <div className="w-full h-[45vh] lg:h-[70vh] md:relative sticky bg-black top-0 z-0 overflow-hidden">
                <video
                    ref={previewVideoRef} src={genericPlatformTrailerUrl} autoPlay muted playsInline
                    className={`w-full h-full object-cover transition-all duration-1000 ease-out ${previewLocked ? 'opacity-30 blur-xl scale-105' : 'opacity-80 scale-100'}`}
                    onEnded={() => setPreviewLocked(true)}
                    onError={() => setPreviewLocked(true)}
                    onTimeUpdate={(e) => {
                        if (e.target.currentTime >= 10 && !previewLocked) {
                            e.target.pause();
                            setPreviewLocked(true);
                        }
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 lg:via-[#0a0a0a]/40 to-transparent pointer-events-none" />
                
                <button onClick={() => navigate(returnPath === '/' ? -1 : returnPath)} className="absolute top-6 left-4 lg:left-8 p-2 lg:p-3 bg-black/40 backdrop-blur-md rounded-full text-white z-30 hover:bg-black/60 transition-colors">
                    <ChevronLeft size={24} />
                </button>

                {previewLocked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center animate-fade-in-up">
                        <div className="w-16 h-16 bg-[#eab308]/20 rounded-full flex items-center justify-center mb-3 border border-[#eab308]/30">
                            <Lock size={32} className="text-[#eab308]" />
                        </div>
                        <h3 className="text-2xl lg:text-4xl font-black text-white drop-shadow-lg">Preview Ended</h3>
                        <p className="text-gray-300 text-sm lg:text-lg mt-2 drop-shadow-md">Unlock PRO to access all modules instantly.</p>
                    </div>
                )}
            </div>

            <div className="max-w-7xl mx-auto lg:px-8 relative z-10 -mt-6 lg:-mt-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* LEFT COLUMN: STORY & FEATURES */}
                    <div className="lg:col-span-8 bg-[#0a0a0a] px-4 lg:bg-transparent rounded-t-3xl pt-8 lg:pt-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] lg:shadow-none">
                        <div className="text-center lg:text-left mb-10">
                            <div className="group inline-flex items-center gap-2 mb-2 lg:mb-4 bg-black/40 lg:backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                                <img src="https://res.cloudinary.com/dvcs9x8yp/image/upload/v1775412223/20250730_170449_0000_uq4d24.png" alt="UPSKALE Logo" className="h-8 md:h-12 w-auto object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-[0_0_15px_rgba(0,138,69,0.3)]" />
                            </div>
                            <h1 className="text-3xl lg:text-6xl font-black mt-2 leading-tight lg:drop-shadow-2xl">Unlock 10x career growth now</h1>
                        </div>

                        {/* Testimonials */}
                        <div className="flex overflow-x-auto lg:grid lg:grid-cols-2 gap-4 pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {testimonials.map((t, idx) => (
                                <div key={idx} className="bg-[#121212] lg:bg-black/60 lg:backdrop-blur-md border border-white/5 lg:border-white/10 rounded-2xl p-5 min-w-[280px] sm:min-w-[320px] lg:min-w-0 snap-center shrink-0 lg:hover:-translate-y-1 transition-transform duration-300">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm text-gray-300">{t.initial}</div>
                                            <span className="font-bold text-sm text-gray-200">{t.name}</span>
                                        </div>
                                        <div className="flex gap-0.5 text-[#eab308]">
                                            {[...Array(t.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-sm leading-relaxed">{t.text}</p>
                                </div>
                            ))}
                        </div>

                        {/* Before / After Graphic */}
                        <div className="mb-12">
                            <div className="bg-[#121212] lg:bg-black/60 lg:backdrop-blur-md border border-white/5 lg:border-white/10 rounded-3xl overflow-hidden relative group shadow-2xl">
                                <div className="w-full relative bg-black flex items-center justify-center overflow-hidden">
                                    <img src="https://res.cloudinary.com/dv5ysdbps/image/upload/f_auto,q_auto/v1775649763/rqjvidu8zmlyxnjfmcro.webp" alt="Pro Benefits" className="w-full h-auto block opacity-80 group-hover:opacity-100 group-hover:scale-[1.01] transition-all duration-700 ease-out" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
                                </div>
                                <div className="p-6 lg:p-8 text-center border-t border-white/5 bg-[#0d0d0d]">
                                    <p className="font-black text-xl lg:text-3xl text-white tracking-tight">PRO users get hired <span className="text-emerald-500">3x faster.</span></p>
                                    <p className="text-gray-500 text-[10px] lg:text-xs mt-2 uppercase tracking-widest font-bold">Global Industry Report • 2026</p>
                                </div>
                            </div>
                        </div>

                        {/* Comparison Table */}
                        <div className="mb-12">
                            <h2 className="text-xl lg:text-3xl font-bold mb-6 text-center lg:text-left">Unlock deeper learning</h2>
                            <div className="bg-[#121212] lg:bg-black/60 lg:backdrop-blur-md border border-white/5 lg:border-white/10 rounded-3xl overflow-hidden">
                                <div className="grid grid-cols-12 py-4 lg:py-6 px-4 lg:px-8 border-b border-white/5 items-center">
                                    <div className="col-span-7 text-xs lg:text-sm font-bold text-gray-500 uppercase tracking-wider">What you get</div>
                                    <div className="col-span-2 text-center text-xs lg:text-sm font-bold text-gray-500">Free</div>
                                    <div className="col-span-3 text-center">
                                        <span className="bg-[#eab308] text-black text-[10px] lg:text-xs font-black uppercase px-3 lg:px-4 py-1 lg:py-1.5 rounded-full">Pro</span>
                                    </div>
                                </div>
                                {features.map((feat, idx) => (
                                    <div key={idx} className="grid grid-cols-12 py-4 lg:py-5 px-4 lg:px-8 border-b border-white/5 last:border-0 items-center hover:bg-white/[0.02] transition-colors">
                                        <div className="col-span-7 text-sm lg:text-base font-medium text-gray-300">{feat.name}</div>
                                        <div className="col-span-2 flex justify-center">{feat.free ? <Check size={18} className="text-[#eab308]" /> : <Lock size={16} className="text-gray-600" />}</div>
                                        <div className="col-span-3 flex justify-center bg-white/[0.02] py-2 rounded-lg">{feat.pro ? <Check size={18} className="text-[#eab308]" /> : <Lock size={16} className="text-gray-600" />}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* FAQs */}
                        <div className="mb-12 lg:mb-24">
                            <h2 className="text-xl lg:text-3xl font-bold mb-6 text-center lg:text-left">FAQs</h2>
                            <div className="space-y-3 lg:space-y-4">
                                {faqs.map((faq, idx) => (
                                    <div key={idx} className="bg-[#121212] lg:bg-black/60 lg:backdrop-blur-md border border-white/5 lg:border-white/10 rounded-2xl overflow-hidden transition-all hover:border-white/20">
                                        <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full p-5 lg:p-6 flex items-center justify-between text-left">
                                            <span className="font-bold text-sm lg:text-base text-gray-200 pr-4">{faq.q}</span>
                                            {openFaq === idx ? <ChevronUp size={20} className="text-gray-500 shrink-0" /> : <ChevronDown size={20} className="text-gray-500 shrink-0" />}
                                        </button>
                                        <div className={`px-5 lg:px-6 text-sm lg:text-base text-gray-400 leading-relaxed overflow-hidden transition-all duration-300 ${openFaq === idx ? 'max-h-40 pb-5 lg:pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>{faq.a}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: STICKY CHECKOUT CARD (DESKTOP) */}
                    <div className="hidden lg:block lg:col-span-4">
                        <div className="sticky top-24 bg-[#121212]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
                            
                            {isActive ? (
                                // 🟢 ACTIVE USER DASHBOARD UI
                                <div className="text-center animate-fade-in-up">
                                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl mx-auto flex items-center justify-center mb-5 shadow-xl shadow-emerald-500/20">
                                        <ShieldCheck className="text-white" size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black text-white">PRO Active</h3>
                                    <p className="text-gray-400 text-sm mt-2 mb-6">
                                        You are currently on the <span className="uppercase font-bold text-emerald-400">{subscription.planType}</span> plan.
                                    </p>
                                    
                                    <div className="bg-black/40 border border-emerald-500/20 rounded-2xl p-6 mb-8 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-emerald-500/5 blur-xl pointer-events-none"></div>
                                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2 relative z-10">Time Remaining</p>
                                        <div className="flex items-baseline justify-center gap-1 relative z-10">
                                            <span className="text-5xl font-black text-white">{daysLeft}</span> 
                                            <span className="text-lg text-gray-400 font-medium">days</span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => navigate('/')} 
                                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg active:scale-95"
                                    >
                                        Return to Dashboard <ArrowRight size={20} />
                                    </button>
                                </div>
                            ) : (
                                // 🟡 NON-ACTIVE USER PRICING UI
                                <>
                                    <div className="text-center mb-8">
                                        <div className="w-16 h-16 bg-gradient-to-br from-[#eab308] to-yellow-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-[#eab308]/20"><Award className="text-black" size={32} /></div>
                                        <h3 className="text-2xl font-black text-white">Choose your plan</h3>
                                        <p className="text-gray-400 text-sm mt-2">Get instant access to all premium modules and mentorship.</p>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div onClick={() => setSelectedPlan('yearly')} className={`rounded-2xl p-5 cursor-pointer relative border-2 transition-all duration-300 ${selectedPlan === 'yearly' ? 'border-[#eab308] bg-[#eab308]/5 transform scale-105 shadow-[0_0_20px_rgba(234,179,8,0.15)]' : 'border-white/10 bg-black/40 hover:border-white/20'}`}>
                                            <div className="absolute top-4 right-4"><div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPlan === 'yearly' ? 'border-[#eab308]' : 'border-gray-600'}`}>{selectedPlan === 'yearly' && <div className="w-2.5 h-2.5 bg-[#eab308] rounded-full"></div>}</div></div>
                                            <div className="inline-block bg-[#eab308] text-black text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm mb-3">Best Value</div>
                                            <div className="text-sm text-gray-300 font-bold mb-1">Full Access</div>
                                            <div className="flex items-baseline gap-1"><span className="text-3xl font-black text-white">₹599</span><span className="text-xs text-gray-500 font-medium">/year</span></div>
                                        </div>
                                        <div onClick={() => setSelectedPlan('monthly')} className={`rounded-2xl p-5 cursor-pointer relative border-2 transition-all duration-300 ${selectedPlan === 'monthly' ? 'border-[#eab308] bg-[#eab308]/5 transform scale-105 shadow-[0_0_20px_rgba(234,179,8,0.15)]' : 'border-white/10 bg-black/40 hover:border-white/20'}`}>
                                            <div className="absolute top-4 right-4"><div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPlan === 'monthly' ? 'border-[#eab308]' : 'border-gray-600'}`}>{selectedPlan === 'monthly' && <div className="w-2.5 h-2.5 bg-[#eab308] rounded-full"></div>}</div></div>
                                            <div className="inline-block border border-[#eab308]/50 text-[#eab308] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm mb-3">Most Popular</div>
                                            <div className="text-sm text-gray-300 font-bold mb-1">Monthly Pass</div>
                                            <div className="flex items-baseline gap-1"><span className="text-3xl font-black text-white">₹99</span><span className="text-xs text-gray-500 font-medium">/month</span></div>
                                        </div>
                                        <div onClick={() => setSelectedPlan('trial')} className={`rounded-2xl p-5 cursor-pointer relative border-2 transition-all duration-300 ${selectedPlan === 'trial' ? 'border-[#eab308] bg-[#eab308]/5 transform scale-105 shadow-[0_0_20px_rgba(234,179,8,0.15)]' : 'border-white/10 bg-black/40 hover:border-white/20'}`}>
                                            <div className="absolute top-4 right-4"><div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPlan === 'trial' ? 'border-[#eab308]' : 'border-gray-600'}`}>{selectedPlan === 'trial' && <div className="w-2.5 h-2.5 bg-[#eab308] rounded-full"></div>}</div></div>
                                            <div className="text-sm text-gray-300 font-bold mb-1">Trial Access</div>
                                            <div className="flex items-baseline gap-1"><span className="text-3xl font-black text-white">₹1</span><span className="text-xs text-gray-500 font-medium">/3 days</span></div>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={handleProceedToPayment} 
                                        disabled={processingPayment}
                                        className="w-full bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors shadow-lg active:scale-95 text-lg disabled:opacity-50"
                                    >
                                        {processingPayment ? <Loader2 className="animate-spin" size={20} /> : <>Continue to Payment <ArrowRight size={20} /></>}
                                    </button>
                                    
                                    <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1"><ShieldCheck size={14} /> Secure 256-bit encryption</p>
                                    <p className="text-center text-[10px] text-gray-600 mt-2">*For your security, sessions automatically require re-authentication every 7 days.</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MOBILE STICKY BOTTOM CHECKOUT */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-[#121212] border-t border-white/10 p-4 z-50 rounded-t-3xl shadow-[0_-20px_40px_rgba(0,0,0,0.8)] pb-safe">
                <div className="max-w-md mx-auto">
                    {isActive ? (
                        // 🟢 ACTIVE USER MOBILE UI
                        <div className="text-center mb-2">
                            <p className="text-emerald-400 font-bold uppercase text-xs tracking-wider mb-1 flex justify-center items-center gap-1"><ShieldCheck size={14}/> PRO Plan Active</p>
                            <p className="text-white font-black text-2xl mb-3">{daysLeft} <span className="text-sm text-gray-400">Days Remaining</span></p>
                            <button 
                                onClick={() => navigate('/')} 
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    ) : (
                        // 🟡 NON-ACTIVE USER MOBILE UI
                        <>
                            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pt-4 pb-2">
                                <div onClick={() => setSelectedPlan('yearly')} className={`min-w-[120px] flex-1 rounded-2xl p-4 cursor-pointer relative border-2 transition-all ${selectedPlan === 'yearly' ? 'border-[#eab308] bg-[#eab308]/5' : 'border-white/10 bg-black/40'}`}>
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-max bg-[#eab308] text-black text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded shadow-lg z-10">Best Value</div>
                                    <div className="text-[11px] text-gray-400 font-bold mb-1 mt-1 text-center">Yearly</div>
                                    <div className="text-xl font-black text-white leading-none mb-1 text-center">₹599</div>
                                </div>
                                <div onClick={() => setSelectedPlan('monthly')} className={`min-w-[120px] flex-1 rounded-2xl p-4 cursor-pointer relative border-2 transition-all ${selectedPlan === 'monthly' ? 'border-[#eab308] bg-[#eab308]/5' : 'border-white/10 bg-black/40'}`}>
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-max bg-emerald-500 text-white text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded shadow-lg z-10">Most Popular</div>
                                    <div className="text-[11px] text-[#eab308] font-bold mb-1 mt-1 text-center">Monthly</div>
                                    <div className="text-xl font-black text-white leading-none mb-1 text-center">₹99</div>
                                </div>
                                <div onClick={() => setSelectedPlan('trial')} className={`min-w-[100px] flex-1 rounded-2xl p-4 cursor-pointer relative border-2 transition-all ${selectedPlan === 'trial' ? 'border-[#eab308] bg-[#eab308]/5' : 'border-white/10 bg-black/40'}`}>
                                    <div className="text-[11px] text-gray-400 font-bold mb-1 mt-1 text-center">Trial</div>
                                    <div className="text-xl font-black text-white leading-none mb-1 text-center">₹1</div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleProceedToPayment} 
                                disabled={processingPayment}
                                className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50"
                            >
                                {processingPayment ? <Loader2 className="animate-spin" size={20} /> : "Continue to Payment"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlanSelectionPage;