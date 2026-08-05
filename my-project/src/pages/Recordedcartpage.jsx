import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Trash2, ArrowRight, Smartphone, Lock, Loader2, X, Tag, Video, Users, CheckCircle2, AlertCircle, ShieldCheck
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import { BASE_URL } from '../config';
import { useCart } from '../context/CartContext';
import LoginModal from '../components/LoginModal';

// --- RAZORPAY LOADER ---
const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const RecartPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- 1. GLOBAL CART ---
  const { cartItems, removeFromCart, addToCart, clearCart } = useCart();

  // --- 2. SYNCED CART STATE (Fresh Pricing from DB) ---
  const [syncedCart, setSyncedCart] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(true);

  // --- 3. MULTI-ITEM STATE MANAGEMENT ---
  const [itemPrefs, setItemPrefs] = useState({});

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Auth & Coupon State
  const [loginStep, setLoginStep] = useState(1);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [resendTimer, setResendTimer] = useState(0); 
  const [formData, setFormData] = useState({ phone: '', otp: '', name: '', email: '', age: '', gender: 'Male' });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); 
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState({ type: '', text: '' });

  // --- THE BRIDGE: Save Incoming Items ---
  useEffect(() => {
    if (location.state && location.state.item) {
        addToCart(location.state.item);
        navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, addToCart, navigate, location.pathname]);

  // --- STORAGE SYNC FOR AUTH ---
  useEffect(() => {
    const syncUser = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setIsLoggedIn(true);
      }
    };
    syncUser();
    window.addEventListener('storage', syncUser);
    return () => window.removeEventListener('storage', syncUser);
  }, []);

  // --- FETCH FRESH PRICING FROM BACKEND ---
  useEffect(() => {
    const fetchFreshDetails = async () => {
        setIsRefreshing(true);
        const freshItems = await Promise.all(cartItems.map(async (item) => {
            try {
                let fetchUrl = '';
                if (item.itemModel === 'Course') {
                    fetchUrl = `${BASE_URL}/courses/find/${item.id}`;
                } else if (item.itemModel === 'Cohort') {
                    fetchUrl = `${BASE_URL}/cohorts/find/${item.id}`;
                } else if (item.itemModel === 'BiteSizeCourse') { // Added Support for BiteSize
                    fetchUrl = `${BASE_URL}/bitesize-courses/${item.id}`;
                }

                if (fetchUrl) {
                    const res = await fetch(fetchUrl, {
                        credentials: 'include' // 🔴 ADDED
                    });
                    if (res.ok) {
                        const data = await res.json();
                        return { 
                            ...item, 
                            pricing: data.pricing || item.pricing,
                            title: data.title || item.title,
                            image: data.thumbnail || item.image 
                        };
                    }
                }
            } catch (err) { console.error("Pricing sync failed for:", item.id); }
            return item;
        }));
        setSyncedCart(freshItems);
        setIsRefreshing(false);
    };

    if (cartItems.length > 0) {
        fetchFreshDetails();
    } else {
        setSyncedCart([]);
        setIsRefreshing(false);
    }
  }, [cartItems]);

  // --- INITIALIZE PREFERENCES & CHECK ENROLLMENTS ---
  useEffect(() => {
    const checkEnrollmentStatus = () => {
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        if (user) setIsLoggedIn(true);

        const newPrefs = { ...itemPrefs }; 

        syncedCart.forEach(item => {
            if (!newPrefs[item.id]) {
                let isPart2 = false;
                
                if (user && user.enrolledCourses && user.enrolledCourses.length > 0) {
                    const enrollment = user.enrolledCourses.find(
                        (c) => c.item === item.id || c.item._id === item.id
                    );
                    if (enrollment && enrollment.paymentStatus === 'partial') {
                        isPart2 = true;
                    }
                }

                newPrefs[item.id] = {
                    activeTab: isPart2 ? 'live' : (item.planType || 'recorded'),
                    paymentMethod: 'full',
                    isPart2Payment: isPart2
                };
            }
        });

        setItemPrefs(newPrefs);
    };
    if (syncedCart.length > 0) checkEnrollmentStatus();
  }, [syncedCart]); 

  const updateItemPref = (id, key, value) => {
      setItemPrefs(prev => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
  };

  useEffect(() => {
    let interval;
    if (resendTimer > 0) interval = setInterval(() => setResendTimer((p) => p - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // --- DYNAMIC MULTI-ITEM PRICE CALCULATION ---
  let subtotal = 0;

  syncedCart.forEach(item => {
      const pref = itemPrefs[item.id] || { activeTab: 'recorded', paymentMethod: 'full', isPart2Payment: false };
      const pricing = item.pricing || {};
      const part1Price = pricing.installment?.pricePart1 || 0;
      const part2Price = pricing.installment?.pricePart2 || 0;

      if (item.itemModel === 'Masterclass') {
          subtotal += item.price || 0;
      } else {
          if (pref.isPart2Payment) {
              subtotal += part2Price;
          } else {
              if (pref.activeTab === 'live') {
                  if (pref.paymentMethod === 'installment' && pricing.installment?.enabled) {
                      subtotal += part1Price;
                  } else {
                      subtotal += pricing.live?.discount || item.price || 0;
                  }
              } else {
                  subtotal += pricing.recorded?.discount || item.price || 0;
              }
          }
      }
  });

  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  // --- ACTION HANDLERS ---
  const handleApplyCoupon = async () => {
    if(!couponCode.trim()) return;
    setCouponLoading(true); setCouponMsg({ type: '', text: '' });
    try {
        const res = await fetch(`${BASE_URL}/coupons/verify`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // 🔴 ADDED
            body: JSON.stringify({ code: couponCode, orderAmount: subtotal })
        });
        const data = await res.json();
        if (res.ok && data.success) {
            setAppliedCoupon({ code: data.code, discount: data.discount });
            setCouponMsg({ type: 'success', text: `Saved ₹${data.discount}!` });
        } else { setAppliedCoupon(null); setCouponMsg({ type: 'error', text: data.message }); }
    } catch (err) { setCouponMsg({ type: 'error', text: "Server Error" }); } 
    finally { setCouponLoading(false); }
  };
  
  const removeCoupon = () => { setAppliedCoupon(null); setCouponCode(''); setCouponMsg({ type: '', text: '' }); };
  const handleAuthChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setAuthError(''); };
  
  // --- EXPANDED AUTH LOGIC (CREDENTIALS ADDED) ---
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
        const res = await fetch(`${BASE_URL}/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // 🔴 ADDED
            body: JSON.stringify({ phone: formData.phone.startsWith('+') ? formData.phone : `+91${formData.phone}` })
        });
        if (res.ok) {
            setLoginStep(2);
            setResendTimer(120);
        } else {
            setAuthError((await res.json()).message);
        }
    } catch (e) { setAuthError("Error sending OTP"); } 
    finally { setAuthLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
        const res = await fetch(`${BASE_URL}/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // 🔴 ADDED
            body: JSON.stringify({ 
                phone: formData.phone.startsWith('+') ? formData.phone : `+91${formData.phone}`, 
                otp: formData.otp 
            })
        });
        const data = await res.json();
        if (res.ok) {
            if (data.isNewUser) {
                setLoginStep(3);
            } else {
                localStorage.setItem('user', JSON.stringify(data.user));
                setIsLoggedIn(true);
                window.dispatchEvent(new Event("storage"));
                setShowLoginModal(false);
            }
        } else {
            setAuthError("Invalid OTP");
        }
    } catch (e) { setAuthError("Error verifying OTP"); } 
    finally { setAuthLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
        const res = await fetch(`${BASE_URL}/complete-profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // 🔴 ADDED
            body: JSON.stringify({ 
                ...formData, 
                phone: formData.phone.startsWith('+') ? formData.phone : `+91${formData.phone}` 
            })
        });
        if (res.ok) {
            localStorage.setItem('user', JSON.stringify((await res.json()).user));
            setIsLoggedIn(true);
            setShowLoginModal(false);
        } else {
            setAuthError("Error creating profile");
        }
    } catch (e) { setAuthError("Error completing registration"); } 
    finally { setAuthLoading(false); }
  };

  // --- MULTI-ITEM PAYMENT HANDLER ---
 const handlePayment = async () => {
    if (!isLoggedIn) { setShowLoginModal(true); return; }
    if (syncedCart.length === 0) return;

    const user = JSON.parse(localStorage.getItem('user'));

    const checkoutItems = syncedCart.map(item => {
        const pref = itemPrefs[item.id] || {};
        return {
            itemId: item.id,
            itemModel: item.itemModel,
            planType: pref.activeTab || 'recorded',
            paymentType: pref.isPart2Payment ? 'full' : (pref.paymentMethod || 'full'),
            isPart2Payment: pref.isPart2Payment || false
        };
    });

    const CREATE_ORDER_URL = `${BASE_URL}/cohorts/create-order`;
    const VERIFY_URL = `${BASE_URL}/cohorts/verify-payment`;

    const requestBody = { 
        userId: user._id, 
        items: checkoutItems,
        couponCode: appliedCoupon?.code,
        expectedTotal: finalTotal 
    };

    try {
      // 🔴 REPLACED FETCH WITH AXIOS
      const orderRes = await axios.post(CREATE_ORDER_URL, requestBody, {
        withCredentials: true 
      });
      const data = orderRes.data;

      const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!res) { alert("Razorpay SDK failed to load. Check your internet connection."); return; }

      const options = {
        key: data.key_id, 
        amount: data.amount * 100,
        currency: "INR", 
        name: "UPSKALE",
        description: `Payment for ${syncedCart.length} items`,
        order_id: data.order_id,
        handler: async function (response) {
          try {
            // 🔴 REPLACED FETCH WITH AXIOS
            const verifyRes = await axios.post(VERIFY_URL, response, {
              withCredentials: true 
            });
            const verifyData = verifyRes.data;
            
            if (verifyData.success) {
              clearCart(); 
              alert("Payment Successful!"); 
              navigate('/profile'); 
            } else { 
              alert("Payment verification failed. Please contact support."); 
            }
          } catch (verifyError) {
             console.error("Verification failed:", verifyError);
             alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: { name: user.name, email: user.email, contact: user.phone },
        theme: { color: "#008a45" }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){ alert(`Payment Failed: ${response.error.description}`); });
      rzp.open();

    } catch (error) { 
        console.error("Checkout Error:", error); 
        // Interceptor handles 401/403. Only alert for other errors.
        if (!error.response || (error.response.status !== 401 && error.response.status !== 403)) {
            alert(error.response?.data?.message || "Order Creation Failed"); 
        }
    }
  };

  if (cartItems.length === 0) return (
    <div className="min-h-screen bg-[#030303] text-white flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#008a45]/10 rounded-full blur-[120px] pointer-events-none" />
        <Navbar/>
        <div className="flex-1 flex flex-col items-center justify-center z-10">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_50px_rgba(0,138,69,0.1)]">
                <Tag size={40} className="text-gray-500" />
            </div>
            <h2 className="text-3xl font-black mb-3">Your cart is empty</h2>
            <p className="text-gray-500 mb-8 text-center max-w-sm">Looks like you haven't added any courses yet. Start learning today!</p>
            <button onClick={() => navigate('/')} className="bg-[#008a45] hover:bg-[#00d26a] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(0,138,69,0.4)] active:scale-95">
                Explore Courses
            </button>
        </div>
        <Footer/>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans relative pb-24">
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#008a45] opacity-[0.06] blur-[150px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600 opacity-[0.04] blur-[150px] rounded-full" />
      </div>

      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 relative z-10">
        <div className="flex items-center justify-between mb-10">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">Checkout <span className="text-gray-500 text-2xl font-medium ml-2">({syncedCart.length} items)</span></h1>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {isRefreshing ? (
                <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="animate-spin text-[#008a45]" size={40} />
                    <p className="text-gray-400 font-medium tracking-wide">Syncing latest prices...</p>
                </div>
            ) : syncedCart.map((item) => {
              const pref = itemPrefs[item.id] || { activeTab: 'recorded', paymentMethod: 'full', isPart2Payment: false };
              const pricing = item.pricing || {};
              const part1Price = pricing.installment?.pricePart1 || 0;
              const part2Price = pricing.installment?.pricePart2 || 0;

              return (
              <div key={item.id} className="bg-[#0a0a0a] border border-white/10 hover:border-white/20 transition-colors rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden group">
                
                {/* Top Item Header */}
                <div className="flex flex-col sm:flex-row gap-6 mb-8">
                    <div className="relative shrink-0">
                        <img src={item.image} alt={item.title} className="w-full sm:w-36 h-48 sm:h-36 object-cover rounded-2xl border border-white/10 group-hover:scale-[1.02] transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl sm:hidden"></div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-2 gap-4">
                            <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">{item.title}</h3>
                            <button onClick={() => removeFromCart(item.id)} className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-all" title="Remove Item">
                                <Trash2 size={20} />
                            </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            {item.itemModel === 'Masterclass' ? <span className="bg-gradient-to-r from-red-500/20 to-orange-500/20 text-orange-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-orange-500/30">MASTERCLASS</span> :
                             pref.activeTab === 'live' ? <span className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-purple-500/30">LIVE COHORT</span> :
                             <span className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-500/30">RECORDED ACCESS</span>}
                            
                            {pref.isPart2Payment && <span className="bg-yellow-500/20 text-yellow-500 text-xs font-bold px-3 py-1.5 rounded-lg border border-yellow-500/30 flex items-center gap-1"><AlertCircle size={14}/> PENDING BALANCE</span>}
                        </div>
                    </div>
                </div>

                {/* Bottom Plan Selection UI */}
                {(item.itemModel === 'Course' || item.itemModel === 'Cohort' || item.itemModel === 'BiteSizeCourse') && (
                    <div className="space-y-6 border-t border-white/10 pt-6">
                        
                        {/* 🔴 I DELETED THE TOGGLE SWITCHES ENTIRELY */}

                        {/* Payment Options (Full vs Installment) - Only for Live, so we hide it too if you don't want EMI for recorded */}
                        {/* If you DO want EMI for recorded, let me know. For now, it defaults to full payment. */}
                        
                        {/* The Recorded Display Card */}
                        {!pref.isPart2Payment && (
                            <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
                                        <Video className="text-blue-400" size={20}/>
                                    </div>
                                    <div>
                                        <span className="block font-bold text-white text-lg">{item.itemModel === 'BiteSizeCourse' ? 'Bite-Sized Access' : 'Self-Paced Access'}</span>
                                        <span className="text-sm text-gray-500">Instant access to all modules.</span>
                                    </div>
                                </div>
                                <span className="font-black text-2xl text-white">₹{(item.itemModel === 'BiteSizeCourse' ? (pref.activeTab === 'trial' ? pricing.trial?.price : pricing.standard?.price) : pricing.recorded?.discount || item.price || 0).toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                )}
              </div>
            )})}
          </div>

          {/* RIGHT: SUMMARY & CHECKOUT */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-28 space-y-6">
                
                {/* Coupon Section */}
                <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Tag size={16} className="text-[#008a45]"/> Have a Coupon?</h3>
                    {appliedCoupon ? (
                        <div className="bg-[#008a45]/10 border border-[#008a45]/30 rounded-2xl p-4 flex justify-between items-center relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#008a45]/20 blur-xl rounded-full"></div>
                            <div className="relative z-10">
                                <p className="text-[#00d26a] font-bold text-lg">{appliedCoupon.code}</p>
                                <p className="text-xs text-[#008a45] font-medium flex items-center gap-1 mt-1"><CheckCircle2 size={12}/> Applied Successfully</p>
                            </div>
                            <button onClick={removeCoupon} className="text-gray-400 hover:text-white bg-black/50 p-2 rounded-full transition-colors relative z-10"><X size={16}/></button>
                        </div>
                    ) : (
                        <div className="relative flex items-center">
                            <input 
                                type="text" 
                                placeholder="Enter code here" 
                                value={couponCode} 
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())} 
                                className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-5 pr-24 text-white focus:border-[#008a45] focus:ring-1 focus:ring-[#008a45] outline-none transition-all placeholder:text-gray-600 font-medium tracking-wide"
                            />
                            <button 
                                onClick={handleApplyCoupon} 
                                disabled={couponLoading || !couponCode.trim()} 
                                className="absolute right-2 top-2 bottom-2 bg-white text-black font-bold px-5 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {couponLoading ? <Loader2 className="animate-spin" size={18}/> : 'Apply'}
                            </button>
                        </div>
                    )}
                    {couponMsg.text && <p className={`text-sm mt-3 font-medium flex items-center gap-1.5 ${couponMsg.type === 'error' ? 'text-red-500' : 'text-[#00d26a]'}`}>
                        {couponMsg.type === 'error' ? <AlertCircle size={14}/> : null} {couponMsg.text}
                    </p>}
                </div>

                {/* Total Summary */}
                <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden backdrop-blur-xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#008a45]/5 rounded-full blur-[80px] pointer-events-none"></div>
                  
                  <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">Order Summary</h3>
                  
                  <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-gray-400 font-medium">
                          <span>Items ({syncedCart.length})</span>
                          <span className="text-white">
                            {isRefreshing ? <Loader2 className="animate-spin" size={16}/> : `₹${subtotal.toLocaleString()}`}
                          </span>
                      </div>
                      {appliedCoupon && (
                          <div className="flex justify-between text-[#00d26a] font-medium">
                              <span>Discount</span>
                              <span>- ₹{appliedCoupon.discount.toLocaleString()}</span>
                          </div>
                      )}
                  </div>

                  <div className="h-px w-full border-b border-dashed border-white/10 mb-6"></div>
                  
                  <div className="flex justify-between items-end mb-8">
                      <div>
                          <span className="block text-gray-400 font-medium text-sm mb-1">Total to pay</span>
                          <span className="font-black text-4xl text-white tracking-tight">
                            {isRefreshing ? "..." : `₹${finalTotal.toLocaleString()}`}
                          </span>
                      </div>
                  </div>

                  <button 
                      onClick={handlePayment} 
                      disabled={isRefreshing}
                      className="w-full relative group overflow-hidden bg-[#008a45] text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-[0_10px_30px_rgba(0,138,69,0.3)] hover:shadow-[0_10px_40px_rgba(0,138,69,0.5)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                      <span className="relative flex items-center gap-2">Secure Checkout <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></span>
                  </button>

                  <p className="text-center text-xs text-gray-500 mt-6 flex items-center justify-center gap-1.5 font-medium">
                      <ShieldCheck size={14}/> Secure 256-bit SSL encryption
                  </p>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- PREMIUM AUTH MODAL --- */}
      {showLoginModal && !isLoggedIn && (
        <LoginModal 
          onSuccess={(user) => {
            setIsLoggedIn(true);
            setShowLoginModal(false);
          }}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
};

export default RecartPage;