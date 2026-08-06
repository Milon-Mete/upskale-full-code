import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Trash2, ArrowRight, CheckCircle2, Lock, Loader2, X, Tag,
  Clock, Zap, ShieldCheck, MessageCircle, PartyPopper
} from 'lucide-react';
import { BASE_URL } from '../config';
import LoginModal from '../components/LoginModal';

// ================= THEME TOKENS (Outskill / Claude palette) =================
const CLAY = '#c96442';
const CLAY_DARK = '#b85435';
const CREAM = '#faf9f5';
const CREAM_ALT = '#f5f2eb';
const CARD = '#ffffff';
const BORDER = '#e9e6dc';
const INK = '#1a1a18';
const MUTE = '#6b675f';
const GREEN = '#15875a';
const LOGO_URL = 'https://res.cloudinary.com/villain/image/upload/v1770662332/20250730_170553_0000_xyfhoc.png';
const WHATSAPP_GROUP_LINK = 'https://chat.whatsapp.com/BiTmEXn9nTVAIsBWnXPhVE?s=sh&p=a&ilr=0';

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
  const [showSuccess, setShowSuccess] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [appliedPromotions, setAppliedPromotions] = useState([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState({ type: '', text: '' });

  // --- 2. AUTH CHECK ---
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

  const handleRemove = () => {
    setCartItems([]);
    sessionStorage.removeItem('activeMasterclassCart');
  };

  // --- 3. PRICE CALCULATION ---
  const activeItem = cartItems[0];
  const currentBasePrice = activeItem?.price || 0;
  const CONVENIENCE_FEE = currentBasePrice === 0 ? 9 : 0; // 🔴 Platform fee for free workshops
  const discountAmount = appliedCoupon ? appliedCoupon.baseDiscount : 0;
  const promoDiscountAmount = appliedPromotions.reduce((sum, promo) => sum + promo.discountValue, 0);
  const subtotalAfterDiscount = Math.max(0, currentBasePrice - discountAmount - promoDiscountAmount);
  const finalTotal = subtotalAfterDiscount + CONVENIENCE_FEE;

  // --- 4. COUPON ---
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true); setCouponMsg({ type: '', text: '' });
    try {
      const res = await fetch(`${BASE_URL}/coupons/verify`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: couponCode, orderAmount: currentBasePrice })
      });
      const data = await res.json();
      if (res.ok && data.success) {
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
    setAppliedPromotions([]);
    setCouponCode('');
    setCouponMsg({ type: '', text: '' });
  };

  // --- 5. PAYMENT HANDLER (PRODUCTION READY) ---
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
        setShowSuccess(true);
        return;
      }

      const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!res) { alert("Razorpay SDK failed to load. Check your internet connection."); return; }

      const options = {
        key: data.key_id,
        amount: data.amount * 100,
        currency: "INR",
        name: "UPSKALE",
        description: `Masterclass Ticket: ${activeItem.title}`,
        order_id: data.order_id,
        handler: async function (response) {
          const verifyRes = await fetch(VERIFY_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
            body: JSON.stringify(response),
          });
          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            sessionStorage.removeItem('activeMasterclassCart');
            setShowSuccess(true);
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: { name: user.name, email: user.email, contact: user.phone },
        theme: { color: CLAY },
        modal: {
          ondismiss: function () {
            console.log("Payment modal closed by user.");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error("Payment Failed:", response.error);
        alert(`Payment Failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (error) {
      console.error(error);
      alert("Payment initialization failed. Please try again.");
    }
  };

  // --- HEADER / FOOTER (self-contained light theme) ---
  const Header = () => (
    <header className="sticky top-0 z-40 backdrop-blur-md" style={{ background: 'rgba(250,249,245,0.85)', borderBottom: `1px solid ${BORDER}` }}>
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center">
          <img src={LOGO_URL} alt="UPSKALE" className="h-9 w-auto object-contain" />
        </button>
        <span className="text-sm font-semibold inline-flex items-center gap-1.5" style={{ color: MUTE }}>
          <Lock size={14} /> Secure Checkout
        </span>
      </div>
    </header>
  );

  // --- EMPTY STATE ---
  if (cartItems.length === 0) return (
    <div className="min-h-screen flex flex-col overflow-x-hidden w-full" style={{ background: CREAM, color: INK, fontFamily: "'Poppins', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');`}</style>
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center px-5">
        <Trash2 size={32} className="mb-4" style={{ color: MUTE }} />
        <h2 className="text-2xl font-black mb-4">No Masterclass Selected</h2>
        <button onClick={() => navigate('/')} className="text-white px-6 py-3 rounded-xl font-bold"
          style={{ background: `linear-gradient(90deg, ${CLAY_DARK}, ${CLAY})` }}>Browse Workshops</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden w-full" style={{ background: CREAM, color: INK, fontFamily: "'Poppins', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');`}</style>
      <Header />

      <div className="max-w-6xl mx-auto px-5 py-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black mb-1">Secure Checkout</h1>
          <p style={{ color: MUTE }}>Complete your registration for the live session.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* LEFT: DETAILS */}
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
              <div className="flex flex-col md:flex-row gap-5">
                <img src={activeItem.image} alt="" className="w-full md:w-48 h-32 object-cover rounded-xl" />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-black leading-tight">{activeItem.title}</h3>
                    <button onClick={handleRemove} className="p-2 hover:opacity-70" style={{ color: MUTE }}><Trash2 size={18} /></button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1"
                      style={{ background: CREAM_ALT, color: CLAY, border: `1px solid ${BORDER}` }}><Zap size={12} /> LIVE MASTERCLASS</span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1"
                      style={{ background: CREAM_ALT, color: MUTE, border: `1px solid ${BORDER}` }}><Clock size={12} /> Limited Seats</span>
                  </div>
                  <div className="space-y-2 text-sm" style={{ color: MUTE }}>
                    <p className="flex items-center gap-2"><CheckCircle2 size={15} style={{ color: GREEN }} /> Live Interactive Session</p>
                    <p className="flex items-center gap-2"><CheckCircle2 size={15} style={{ color: GREEN }} /> Verified Certificate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: SUMMARY */}
          <div className="lg:col-span-1 space-y-5">

            {/* Coupon */}
            <div className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
              <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: MUTE }}><Tag size={16} /> Coupon Code</h3>
              {appliedCoupon ? (
                <div className="rounded-xl p-3 flex justify-between items-center" style={{ background: '#eef7f1', border: `1px solid #cfe8da` }}>
                  <div><p className="font-bold" style={{ color: GREEN }}>{appliedCoupon.code}</p><p className="text-xs" style={{ color: GREEN }}>Discount Applied</p></div>
                  <button onClick={removeCoupon} className="hover:opacity-70" style={{ color: MUTE }}><X size={16} /></button>
                </div>
              ) : (
                <div className="flex gap-2 min-w-0">
                  <input type="text" placeholder="Enter Code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 min-w-0 rounded-xl px-4 py-2 outline-none" style={{ background: CREAM, border: `1px solid ${BORDER}`, color: INK }} />
                  <button onClick={handleApplyCoupon} disabled={couponLoading} className="text-white font-bold px-4 rounded-xl disabled:opacity-50"
                    style={{ background: INK }}>{couponLoading ? <Loader2 className="animate-spin" /> : 'Apply'}</button>
                </div>
              )}
              {couponMsg.text && <p className="text-xs mt-2 font-bold" style={{ color: couponMsg.type === 'error' ? '#c0392b' : GREEN }}>{couponMsg.text}</p>}
            </div>

            {/* Total */}
            <div className="rounded-2xl p-7 lg:sticky lg:top-24" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
              <h3 className="text-lg font-black mb-5">Payment Summary</h3>
              <div className="flex justify-between mb-3" style={{ color: MUTE }}>
                <span>Ticket Price</span>
                <span>{currentBasePrice === 0 ? <span className="font-bold" style={{ color: GREEN }}>FREE</span> : `₹${currentBasePrice.toLocaleString()}`}</span>
              </div>

              {appliedCoupon && (<div className="flex justify-between mb-3" style={{ color: GREEN }}><span>Coupon ({appliedCoupon.code})</span><span>- ₹{appliedCoupon.baseDiscount.toLocaleString()}</span></div>)}

              {appliedPromotions.length > 0 && appliedPromotions.map((promo, idx) => (
                <div key={idx} className="flex justify-between mb-3 font-bold" style={{ color: '#c67c00' }}>
                  <span>Extra: {promo.message || promo.promotionName}</span>
                  <span>- ₹{promo.discountValue.toLocaleString()}</span>
                </div>
              ))}

              {/* 🔴 Convenience Fee */}
              {CONVENIENCE_FEE > 0 && (<div className="flex justify-between mb-3" style={{ color: MUTE }}><span>Convenience Fee</span><span>₹{CONVENIENCE_FEE}</span></div>)}

              <div className="h-px my-5" style={{ background: BORDER }}></div>
              <div className="flex justify-between items-end mb-6">
                <span className="font-bold text-lg">Total Payable</span>
                <span className="text-4xl font-black" style={{ color: finalTotal === 0 ? GREEN : INK }}>
                  {finalTotal === 0 ? 'FREE' : `₹${finalTotal.toLocaleString()}`}
                </span>
              </div>
              <button onClick={handlePayment} className="w-full text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                style={{ background: finalTotal === 0 ? GREEN : `linear-gradient(90deg, ${CLAY_DARK}, ${CLAY})` }}>
                {finalTotal === 0 ? 'Enroll For Free' : 'Complete Registration'} <ArrowRight size={20} />
              </button>
              <p className="text-center text-xs mt-4 flex items-center justify-center gap-1" style={{ color: MUTE }}>
                <ShieldCheck size={12} /> {finalTotal === 0 ? '100% Free Instant Registration' : 'Secure Payment via Razorpay'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-5 text-center mt-8" style={{ background: INK, color: '#d9d5cc' }}>
        <img src={LOGO_URL} alt="UPSKALE" className="h-8 w-auto object-contain mx-auto" style={{ filter: 'brightness(0) invert(1)' }} />
        <p className="text-xs mt-3 opacity-70">© {new Date().getFullYear()} UPSKALE. All rights reserved.</p>
      </footer>

      {/* Login Modal */}
      {showLoginModal && !isLoggedIn && (
        <LoginModal
          onSuccess={() => {
            setIsLoggedIn(true);
            setShowLoginModal(false);
          }}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {/* Registration Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5" style={{ background: 'rgba(26,26,24,0.6)' }}>
          <div className="w-full max-w-md rounded-3xl p-8 text-center" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
            <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: '#eef7f1' }}>
              <PartyPopper size={30} style={{ color: GREEN }} />
            </div>
            <h2 className="text-2xl font-black mb-2">You're Registered! 🎉</h2>
            <p className="mb-6" style={{ color: MUTE }}>Your seat for <span className="font-bold" style={{ color: INK }}>{activeItem?.title}</span> is confirmed. See you in class!</p>

            <a
              href={WHATSAPP_GROUP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 text-white py-4 rounded-xl font-bold text-lg mb-3 transition-all hover:scale-[1.01]"
              style={{ background: '#25D366' }}
            >
              <MessageCircle size={20} /> Join WhatsApp Group
            </a>
            <button
              onClick={() => navigate('/profile')}
              className="w-full py-3 rounded-xl font-bold"
              style={{ background: CREAM_ALT, color: INK, border: `1px solid ${BORDER}` }}
            >
              Go to My Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterclassCartPage;
