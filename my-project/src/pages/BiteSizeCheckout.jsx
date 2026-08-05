import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck, ChevronLeft, CreditCard, Globe, CheckCircle } from 'lucide-react';
import { BASE_URL } from '../config';
import LoginModal from '../components/LoginModal';

const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const BiteSizeCheckout = () => {
    const { slug } = useParams();
    const [searchParams] = useSearchParams();
    const planType = searchParams.get('plan') || 'monthly'; 
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processingPayment, setProcessingPayment] = useState(false);
    
    const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
    const [showLoginModal, setShowLoginModal] = useState(false);

    // 🔴 NEW NETFLIX PRICING LOGIC
    const getPricingDetails = (type) => {
        switch(type) {
            case 'trial': return { price: 1, duration: '3 Days', label: 'Trial Access' };
            case 'monthly': return { price: 99, duration: '1 Month', label: 'Monthly Pass' };
            case 'yearly': return { price: 599, duration: '1 Year', label: 'Yearly Access' };
            default: return { price: 99, duration: '1 Month', label: 'Monthly Pass' };
        }
    };

    const pricingDetails = getPricingDetails(planType);
    
    // 🔴 Check if user already has an active subscription
    const subscription = currentUser?.biteSizeSubscription;
    const hasActiveSub = subscription?.status === 'active' && 
        subscription?.expiresAt && new Date(subscription.expiresAt) > new Date();
    
    // 🔴 Calculate remaining days if active
    let activeDaysLeft = 0;
    if (hasActiveSub) {
        const diffTime = new Date(subscription.expiresAt).getTime() - new Date().getTime();
        activeDaysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    useEffect(() => {
        const syncUser = () => {
            const stored = localStorage.getItem('user');
            if (stored) {
                const parsed = JSON.parse(stored);
                setCurrentUser(parsed);
                setShowLoginModal(false);
            } else {
                setShowLoginModal(true);
            }
        };
        syncUser();
        window.addEventListener('storage', syncUser);
        return () => window.removeEventListener('storage', syncUser);
    }, []);

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                // We still fetch the course just to show them a nice image of what they are about to unlock
                const res = await fetch(`${BASE_URL}/bitesize-courses/${slug}`);
                if (!res.ok) {
                    navigate('/'); 
                    return;
                }
                const data = await res.json();
                setCourse(data);
            } catch (error) {
                console.error("Error loading course:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseData();
    }, [slug, navigate]);

    const handlePayment = async () => {
        if (!currentUser) {
            setShowLoginModal(true);
            return;
        }

        setProcessingPayment(true);
        try {
            // 🔴 SECURED SUBSCRIPTION CHECKOUT
            const initRes = await fetch(`${BASE_URL}/bitesize-courses/create-checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', 
                // Notice: We NO LONGER send courseId. We only send planType.
                body: JSON.stringify({ planType }) 
            });

            const orderData = await initRes.json();
            if (initRes.status === 401 || initRes.status === 403) {
            localStorage.removeItem('user'); // Nuke the stale frontend state
            alert("Your session has expired. Please log in again to continue.");
            window.location.href = '/login'; // Force redirect
            return;
        }

        if (!initRes.ok) throw new Error(orderData.message);

            const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
            if (!res) { 
                alert("Razorpay SDK failed to load. Check your internet connection."); 
                return; 
            }

            const options = {
                key: orderData.key_id,
                amount: orderData.amount * 100,
                currency: "INR",
                name: "UPSKALE",
                description: orderData.description,
                order_id: orderData.order_id,
                handler: async function (response) {
                    
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

                    if (verifyRes.ok) {
                        // Redirect them back to the course they were trying to watch
                        navigate(`/bitesize/${slug}`, { replace: true });
                    } else {
                        alert("Payment verification failed.");
                    }
                },
                prefill: {
                    name: currentUser.name,
                    email: currentUser.email,
                    contact: currentUser.phone
                },
                theme: { color: "#10b981" }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response){ 
                alert(`Payment Failed: ${response.error.description}`); 
            });
            rzp.open();

        } catch (error) {
            alert(`Checkout Error: ${error.message}`);
        } finally {
            setProcessingPayment(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="animate-spin text-emerald-500" size={40} />
            </div>
        );
    }

    if (!course) return null;

    return (
        <div className="min-h-screen bg-[#050505] font-sans pt-20 pb-24 px-6 relative">
            
            {showLoginModal && (
                <LoginModal 
                    onClose={() => navigate(-1)} 
                    onSuccess={(user) => {
                        setCurrentUser(user);
                        setShowLoginModal(false);
                    }} 
                />
            )}

            <div className="max-w-xl mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
                    <ChevronLeft size={20} /> Back to Course
                </button>

                {/* 🔴 SHOW ACTIVE SUBSCRIPTION WARNING */}
                {hasActiveSub ? (
                    <div className="bg-[#121212] border border-emerald-500/30 rounded-2xl p-6 md:p-8 shadow-2xl mb-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} className="text-emerald-500" />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-2">Subscription Active</h2>
                            <p className="text-gray-400 text-sm mb-2">
                                You already have an active <span className="uppercase font-bold text-emerald-400">{subscription.planType}</span> plan.
                            </p>
                            <p className="text-white font-bold text-xl mb-6">
                                {activeDaysLeft} <span className="text-sm text-gray-400">days remaining</span>
                            </p>
                            <p className="text-gray-500 text-xs mb-6">
                                Purchasing a new plan will extend your current subscription end date.
                            </p>
                            <button
                                onClick={() => navigate(-1)}
                                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors"
                            >
                                Return to Course
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl mb-8">
                        <div className="flex gap-4 items-center border-b border-white/10 pb-6 mb-6">
                            <img src={course.image} alt={course.title} className="w-20 h-20 object-cover rounded-xl bg-black" />
                            <div>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-500 uppercase tracking-widest mb-1">
                                    <CreditCard size={12} /> Subscription Plan
                                </div>
                                <h2 className="text-lg font-bold text-white leading-tight">Unlocks {course.title} + All Modules</h2>
                                <p className="text-sm text-gray-400 mt-1">{pricingDetails.label}</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-gray-400">
                                <span>Subtotal</span>
                                <span>₹{pricingDetails.price}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>Duration</span>
                                <span>{pricingDetails.duration}</span>
                            </div>
                            <div className="h-px bg-white/10 w-full" />
                            <div className="flex justify-between text-white font-black text-xl">
                                <span>Total Due</span>
                                <span>₹{pricingDetails.price}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mb-8">
                            <span className="flex items-center gap-1"><ShieldCheck size={14}/> Secure Encrypted</span>
                            <span className="flex items-center gap-1"><CreditCard size={14}/> One-time payment</span>
                        </div>

                        <button 
                            onClick={handlePayment}
                            disabled={processingPayment}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                        >
                            {processingPayment ? <Loader2 className="animate-spin" size={18} /> : `Pay ₹${pricingDetails.price} Now`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BiteSizeCheckout;