import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Trash2, ArrowRight, CheckCircle2, ChevronLeft, 
  Smartphone, User, Mail, Lock, Loader2, X, Tag, 
  Calendar, Clock, Zap 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BASE_URL } from '../config';
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

const MasterclassCartPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- 1. INITIALIZE CART ---
  const [cartItems, setCartItems] = useState(() => {
    if (location.state?.item) {
      sessionStorage.setItem('activeMasterclassCart', JSON.stringify(location.state.item));
      return [location.state.item];
    }
    const saved = sessionStorage.getItem('activeMasterclassCart');
    return saved ? [JSON.parse(saved)] : [];
  });

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
  const [appliedPromotions, setAppliedPromotions] = useState([]); // 🔴 ADDED
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState({ type: '', text: '' });

  // --- 2. AUTH & TIMER CHECKS ---
  useEffect(() => {
    const syncUser = () => {
      const user = localStorage.getItem('user');
      if (user) {
        setIsLoggedIn(true);
      } else if (cartItems.length > 0) {
        setShowLoginModal(true);
      }
    };
    syncUser();
    window.addEventListener('storage', syncUser);
    return () => window.removeEventListener('storage', syncUser);
  }, [cartItems]);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) interval = setInterval(() => setResendTimer((p) => p - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleRemove = () => {
    setCartItems([]);
    sessionStorage.removeItem('activeMasterclassCart');
  };

  // --- 3. PRICE CALCULATION ---
// --- 3. PRICE CALCULATION ---
  const activeItem = cartItems[0];
  const currentBasePrice = activeItem?.price || 0;
  const discountAmount = appliedCoupon ? appliedCoupon.baseDiscount : 0; // 🔴 Changed to baseDiscount
  const promoDiscountAmount = appliedPromotions.reduce((sum, promo) => sum + promo.discountValue, 0); // 🔴 Calculate system rules
  const finalTotal = Math.max(0, currentBasePrice - discountAmount - promoDiscountAmount);

  // --- 4. ACTION HANDLERS ---

  // Apply Coupon
  const handleApplyCoupon = async () => {
    if(!couponCode.trim()) return;
    setCouponLoading(true); setCouponMsg({ type: '', text: '' });
    try {
        // 🔴 ADDED CREDENTIALS
        const res = await fetch(`${BASE_URL}/coupons/verify`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ code: couponCode, orderAmount: currentBasePrice })
        });
const data = await res.json();
        if (res.ok && data.success) {
            // 🔴 Map decoupled data
            setAppliedCoupon({ code: data.code, baseDiscount: data.baseDiscount });
            setAppliedPromotions(data.appliedPromotions || []);
            setCouponMsg({ type: 'success', text: `Saved ₹${data.totalDiscount}!` });
        } else { 
            setAppliedCoupon(null); 
            setAppliedPromotions([]); 
            setCouponMsg({ type: 'error', text: data.message }); 
        }
    } catch (err) { setCouponMsg({ type: 'error', text: "Server Error" }); } 
    finally { setCouponLoading(false); }
  };

  const removeCoupon = () => { 
      setAppliedCoupon(null); 
      setAppliedPromotions([]); // 🔴 Clear system rules
      setCouponCode(''); 
      setCouponMsg({ type: '', text: '' }); 
  };

  // --- AUTH HANDLERS ---
  const handleAuthChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setAuthError(''); };
  
  const handleSendOtp = async(e)=>{
    e.preventDefault(); 
    setAuthLoading(true);
    try{
        // 🔴 ADDED CREDENTIALS
        const res=await fetch(`${BASE_URL}/send-otp`,{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            credentials: 'include',
            body:JSON.stringify({phone:formData.phone.startsWith('+')?formData.phone:`+91${formData.phone}`})
        });
        if(res.ok){setLoginStep(2);setResendTimer(120)}
        else{setAuthError((await res.json()).message)}
    }catch(e){setAuthError("Error sending OTP")}
    finally{setAuthLoading(false)}
  };

  const handleVerifyOtp = async(e)=>{
    e.preventDefault(); 
    setAuthLoading(true);
    try{
        // 🔴 ADDED CREDENTIALS (Crucial for receiving the Set-Cookie header)
        const res=await fetch(`${BASE_URL}/verify-otp`,{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            credentials: 'include',
            body:JSON.stringify({phone:formData.phone.startsWith('+')?formData.phone:`+91${formData.phone}`,otp:formData.otp})
        });
        const data=await res.json();
        if(res.ok){
            if(data.isNewUser) {
                setLoginStep(3);
            } else {
                localStorage.setItem('user',JSON.stringify(data.user));
                window.dispatchEvent(new Event("storage"));
                setIsLoggedIn(true);
                setShowLoginModal(false); 
            }
        } else { setAuthError("Invalid OTP") }
    } catch(e){ setAuthError("Verification failed") }
    finally{ setAuthLoading(false) }
  };

  const handleRegister = async(e)=>{
    e.preventDefault(); 
    setAuthLoading(true);
    try{
        // 🔴 ADDED CREDENTIALS
        const res=await fetch(`${BASE_URL}/complete-profile`,{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            credentials: 'include',
            body:JSON.stringify({...formData,phone:formData.phone.startsWith('+')?formData.phone:`+91${formData.phone}`})
        });
        if(res.ok){
            localStorage.setItem('user',JSON.stringify((await res.json()).user));
            window.dispatchEvent(new Event("storage"));
            setIsLoggedIn(true);
            setShowLoginModal(false);
        } else { setAuthError("Registration failed") }
    } catch(e){ setAuthError("Error completing profile") }
    finally{ setAuthLoading(false) }
  };

  // --- PAYMENT HANDLER (PRODUCTION READY) ---
  const handlePayment = async () => {
    if (!isLoggedIn) { setShowLoginModal(true); return; }
    
    const user = JSON.parse(localStorage.getItem('user'));
    const CREATE_ORDER_URL = `${BASE_URL}/masterclasses/create-order`;
    const VERIFY_URL = `${BASE_URL}/masterclasses/verify-payment`;

    const requestBody = { 
        userId: user._id, 
        masterclassId: activeItem.id, 
        couponCode: appliedCoupon?.code 
    };

    try {
      // 1. Create the pending order securely in the backend
      const orderRes = await fetch(CREATE_ORDER_URL, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        credentials: 'include', 
        body: JSON.stringify(requestBody),
      });
      const data = await orderRes.json();
      if (!orderRes.ok) { alert(data.message || "Order Creation Failed"); return; }

      // 🔴 Handle Free Masterclass Direct Completion
      if (data.success && data.isFree) {
        sessionStorage.removeItem('activeMasterclassCart');
        try {
          const freshRes = await fetch(`${BASE_URL}/user/${user._id}`, { credentials: 'include' });
          if (freshRes.ok) {
            const freshUser = await freshRes.json();
            localStorage.setItem('user', JSON.stringify(freshUser));
            window.dispatchEvent(new Event("storage"));
          }
        } catch (e) { console.error("Profile refresh failed", e); }
        alert("🎉 Successfully enrolled in this Free Masterclass!");
        navigate('/profile');
        return;
      }

      // 2. Load the official Razorpay script
      const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!res) { alert("Razorpay SDK failed to load. Check your internet connection."); return; }

      // 3. Open the real Razorpay Payment Modal
      const options = {
        key: data.key_id, 
        amount: data.amount * 100, 
        currency: "INR", 
        name: "UPSKALE",
        description: `Masterclass Ticket: ${activeItem.title}`,
        order_id: data.order_id,
        handler: async function (response) {
          // 4. Securely verify the transaction hash with the backend
          // 🔴 ADDED CREDENTIALS
          const verifyRes = await fetch(VERIFY_URL, {
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
            body: JSON.stringify(response),
          });
          const verifyData = await verifyRes.json();
          
          if (verifyData.success) {
            sessionStorage.removeItem('activeMasterclassCart'); 
            alert("Payment Successful! See you in class."); 
            navigate('/dashboard'); 
          } else { 
            alert("Payment verification failed. Please contact support."); 
          }
        },
        prefill: { name: user.name, email: user.email, contact: user.phone },
        theme: { color: "#E11D48" },
        modal: {
            ondismiss: function() {
                console.log("Payment modal closed by user.");
            }
        }
      };
      
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response){
         console.error("Payment Failed:", response.error);
         alert(`Payment Failed: ${response.error.description}`);
      });
      
      rzp.open();

    } catch (error) { 
        console.error(error); 
        alert("Payment initialization failed. Please try again."); 
    }
  };

  // --- RENDER ---
  if (cartItems.length === 0) return <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center"><Navbar/><div className="flex-1 flex flex-col items-center justify-center"><Trash2 size={32} className="text-gray-500 mb-4"/><h2 className="text-2xl font-bold mb-2">No Masterclass Selected</h2><button onClick={() => navigate('/')} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold">Browse Events</button></div><Footer/></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans relative">
  
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="mb-12">
            <h1 className="text-4xl font-black text-white mb-2">Secure Checkout</h1>
            <p className="text-gray-400">Complete your registration for the live session.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* LEFT: MASTERCLASS DETAILS */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="flex flex-col md:flex-row gap-6 relative z-10">
                    <img src={activeItem.image} alt="" className="w-full md:w-48 h-32 object-cover rounded-xl shadow-lg" />
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-2xl font-bold text-white leading-tight">{activeItem.title}</h3>
                            <button onClick={handleRemove} className="text-gray-500 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                        </div>
                        <div className="flex flex-wrap gap-3 mb-4">
                            <span className="bg-red-500/10 text-red-500 text-xs font-bold px-3 py-1 rounded-full border border-red-500/20 flex items-center gap-1"><Zap size={12}/> LIVE MASTERCLASS</span>
                            <span className="bg-white/5 text-gray-300 text-xs font-bold px-3 py-1 rounded-full border border-white/10 flex items-center gap-1"><Clock size={12}/> Limited Seats</span>
                        </div>
                        <div className="space-y-2 text-sm text-gray-400">
                            <p className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500"/> Live Interactive Session</p>
                            <p className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500"/> Verified Certificate</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* RIGHT: PAYMENT SUMMARY */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Coupon Box */}
            <div className="bg-[#121212] border border-white/10 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Tag size={16}/> Coupon Code</h3>
                {appliedCoupon ? (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex justify-between items-center">
                        <div><p className="text-green-500 font-bold">{appliedCoupon.code}</p><p className="text-xs text-green-400">Discount Applied</p></div>
                        <button onClick={removeCoupon} className="text-gray-400 hover:text-white"><X size={16}/></button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <input type="text" placeholder="Enter Code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-2 text-white focus:border-red-500 outline-none"/>
                        <button onClick={handleApplyCoupon} disabled={couponLoading} className="bg-white text-black font-bold px-4 rounded-xl hover:bg-gray-200 disabled:opacity-50">{couponLoading ? <Loader2 className="animate-spin"/> : 'Apply'}</button>
                    </div>
                )}
                {couponMsg.text && <p className={`text-xs mt-2 font-bold ${couponMsg.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>{couponMsg.text}</p>}
            </div>

            {/* Total Summary */}
            <div className="bg-[#121212] border border-white/10 rounded-2xl p-8 sticky top-24">
              <h3 className="text-xl font-bold mb-6">Payment Summary</h3>
<div className="flex justify-between mb-3 text-gray-400"><span>Ticket Price</span><span>₹{currentBasePrice.toLocaleString()}</span></div>
              
              {/* 🔴 Base Coupon UI */}
              {appliedCoupon && (<div className="flex justify-between mb-3 text-green-500"><span>Coupon ({appliedCoupon.code})</span><span>- ₹{appliedCoupon.baseDiscount.toLocaleString()}</span></div>)}
              
              {/* 🔴 Automated Surprise Discounts UI */}
              {appliedPromotions.length > 0 && appliedPromotions.map((promo, idx) => (
                  <div key={idx} className="flex justify-between mb-3 text-yellow-500 font-bold items-center">
                      <span>Extra: {promo.message || promo.promotionName}</span>
                      <span>- ₹{promo.discountValue.toLocaleString()}</span>
                  </div>
              ))}
              
              <div className="h-px bg-white/10 my-6"></div>
              <div className="flex justify-between items-end mb-8">
                <span className="font-bold text-white text-lg">Total Payable</span>
                <span className={`text-4xl font-black ${finalTotal === 0 ? 'text-green-400' : 'text-white'}`}>
                  {finalTotal === 0 ? 'FREE' : `₹${finalTotal.toLocaleString()}`}
                </span>
              </div>
              <button onClick={handlePayment} className={`w-full text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all ${finalTotal === 0 ? 'bg-green-600 hover:bg-green-500 shadow-green-900/20' : 'bg-red-600 hover:bg-red-500 shadow-red-900/20'}`}>
                {finalTotal === 0 ? 'Enroll For Free' : 'Complete Registration'} <ArrowRight size={20} />
              </button>
              <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1">
                <Lock size={10}/> {finalTotal === 0 ? '100% Free Instant Registration' : 'Secure Payment via Razorpay'}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* --- PROFESSIONAL LOGIN MODAL --- */}
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

export default MasterclassCartPage;