import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, PlayCircle, ChevronDown, Star, Clock, ShieldCheck,
  ArrowRight, Users, Award, Zap, Loader2, Bot, FileSpreadsheet,
  BarChart3, Table2, Database, TrendingUp, BadgeCheck, X, Tag,
  GraduationCap, Infinity as InfinityIcon, MonitorPlay, FileText
} from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { BASE_URL } from '../config';

// ---------- TuteDude-inspired design tokens ----------
const PURPLE = '#7C3AED';
const PURPLE_DARK = '#5B21B6';
const PLUM = '#241530';
const PAGE_BG = '#F7F5FF';
const GREEN = '#16A34A';
const GOLD = '#F59E0B';
const RED = '#DC2626';
const CREAM = '#FFF8E6';

const COURSE_KEY = 'excel-mastery-with-ai-tools';
const FALLBACK_PRICING = {
  recorded: { amount: 199, label: 'Self-Paced Recorded Course' },
  live: { amount: 2499, label: 'Live + AI Cohort' }
};

const loadScript = (src) => new Promise((resolve) => {
  const s = document.createElement('script');
  s.src = src; s.onload = () => resolve(true); s.onerror = () => resolve(false);
  document.body.appendChild(s);
});

const syllabus = [
  { title: "Intro & Excel Basics", items: ["Tabs & Menus Overview", "Understanding the Interface", "Workbook Basics"], icon: FileSpreadsheet },
  { title: "Essential Functions", items: ["Auto Fill & Cell Movement", "Insert Rows / Columns", "Find, Replace & Number Formats"], icon: Zap },
  { title: "Core Calculations", items: ["SUM, AVERAGE, MIN / MAX", "COUNT Functions", "Arithmetic Formulas"], icon: BarChart3 },
  { title: "Lookup & Logic", items: ["IF Conditions", "VLOOKUP & HLOOKUP", "SUMIF / COUNTIF"], icon: Database },
  { title: "Data Cleaning", items: ["Conditional Formatting", "Remove Duplicates", "Advanced Sort & Filter"], icon: Table2 },
  { title: "Pivot Tables & Slicers", items: ["Summarise Large Datasets", "Pivot Table Mastery", "Interactive Slicers"], icon: Table2 },
  { title: "Charts & Dashboards", items: ["Production & Output Metrics", "Histograms & Line Graphs", "Visual Storytelling"], icon: MonitorPlay },
  { title: "Financial Analysis", items: ["ARR (Accounting Rate of Return)", "Payback Period", "Investment Decisions"], icon: TrendingUp },
  { title: "AI in Excel", items: ["ChatGPT Integration in Excel", "AI for Writing Formulas", "Google Sheets Essentials"], icon: Bot },
  { title: "Automation Basics", items: ["Intro to Macros", "Repetitive Task Automation", "AI Formula Bots"], icon: Zap },
  { title: "Real Business Projects", items: ["Sales Dashboard Project", "Finance Model Project", "Inventory Sheet Project"], icon: FileText },
  { title: "Final Assessment & Certificate", items: ["Comprehensive Exam", "Performance Review", "Certificate of Completion"], icon: Award },
];

const testimonials = [
  { name: "Rohit Malhotra", role: "Operations Manager @ Amazon", image: "https://randomuser.me/api/portraits/men/75.jpg", story: "I used to spend 4 hours daily on reports. After learning Macros and ChatGPT for Excel, I finish the same work in 15 minutes." },
  { name: "Anjali Gupta", role: "Financial Analyst @ HDFC", image: "https://randomuser.me/api/portraits/women/65.jpg", story: "The VLOOKUP and Pivot Table modules were explained so simply. I finally understand how to handle large datasets without crashing my sheet." },
  { name: "Vikram Singh", role: "Business Owner", image: "https://randomuser.me/api/portraits/men/32.jpg", story: "The dashboarding section helped me visualise my sales data. Now I can actually see where my business is growing." },
];

const faqs = [
  { q: "Is this course good for complete beginners?", a: "Yes. We start from the absolute basics — interface, tabs, workbooks — and take you step by step to advanced topics like Pivot Tables, dashboards and AI-powered Excel." },
  { q: "Do I need Microsoft Excel installed?", a: "You can follow along with Microsoft Excel (any recent version) or free Google Sheets. The AI modules work in both." },
  { q: "How long do I get access to the recordings?", a: "Lifetime. Pay once and revisit every lesson, update and project forever." },
  { q: "Will I get a certificate?", a: "Yes. After completing the final assessment you earn a verifiable Upskale certificate you can add to your resume and LinkedIn." },
  { q: "How does the EXCEL500 coupon work?", a: "On the Live + AI Cohort plan, enter the code EXCEL500 at checkout to get ₹500 off — you pay ₹1,999 instead of ₹2,499. Limited to the first 5 students." },
  { q: "What if I miss a live class?", a: "Every live session is recorded and added to your library, so you never fall behind." },
];

const ExcelCoursePage = () => {
  const navigate = useNavigate();
  const [pricing, setPricing] = useState(null);
  const [paying, setPaying] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [openModule, setOpenModule] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  // Coupon state (live plan)
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponMsg, setCouponMsg] = useState({ type: '', text: '' });
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Prices come from the server catalogue; fallback keeps the page correct offline.
  useEffect(() => {
    fetch(`${BASE_URL}/course-payment/catalogue/${COURSE_KEY}`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (d && d.success) setPricing(d.tracks); })
      .catch(() => {});
  }, []);

  const recordedPrice = pricing?.recorded?.amount || FALLBACK_PRICING.recorded.amount;
  const livePrice = pricing?.live?.amount || FALLBACK_PRICING.live.amount;
  const liveDiscount = couponApplied?.discount || 0;
  const liveEffective = livePrice - liveDiscount;

  const getUser = () => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  };

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponMsg({ type: '', text: '' });
    try {
      const res = await fetch(`${BASE_URL}/coupons/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), orderAmount: livePrice })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCouponApplied({ code: data.code, discount: data.totalDiscount });
        setCouponMsg({ type: 'success', text: `Coupon applied — you save ₹${data.totalDiscount}!` });
      } else {
        setCouponApplied(null);
        setCouponMsg({ type: 'error', text: data.message || 'Invalid coupon code' });
      }
    } catch {
      setCouponMsg({ type: 'error', text: 'Could not verify the coupon. Try again.' });
    }
    setCouponLoading(false);
  };

  // LoginPage/ProfilePage only honour sessionStorage 'redirectAfterLogin'
  // (router state is ignored), so set it before sending the user to /login.
  // 'excelCheckoutPending' lets the page resume checkout automatically when
  // the user lands back here after Google sign-in.
  const sendToLogin = (trackKey) => {
    sessionStorage.setItem('redirectAfterLogin', '/excel-mastery-with-ai-tools');
    sessionStorage.setItem('excelCheckoutPending', JSON.stringify({
      track: trackKey,
      coupon: trackKey === 'live' && couponApplied ? couponApplied.code : null,
      at: Date.now()
    }));
    navigate('/login');
  };

  const handleBuy = async (trackKey, couponOverride) => {
    const user = getUser();
    if (!user) {
      sendToLogin(trackKey);
      return;
    }
    if (paying) return;
    setPaying(true);
    const liveCoupon = (couponOverride && couponOverride.code) ? couponOverride : couponApplied;
    try {
      const orderRes = await fetch(`${BASE_URL}/course-payment/create-order`, {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          courseKey: COURSE_KEY,
          trackKey,
          couponCode: trackKey === 'live' && liveCoupon ? liveCoupon.code : undefined
        })
      });
      const data = await orderRes.json();
      if (!orderRes.ok || !data.success) {
        if (orderRes.status === 401) {
          alert('Your session has expired. Please log in again.');
          sendToLogin(trackKey);
        } else {
          alert(data.message || 'Could not start the payment. Please try again.');
        }
        setPaying(false);
        return;
      }

      const ok = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!ok) { alert('Razorpay could not load. Check your internet connection.'); setPaying(false); return; }

      const rzp = new window.Razorpay({
        key: data.key_id,
        amount: data.amount * 100,
        currency: 'INR',
        name: 'UPSKALE',
        description: data.description,
        order_id: data.order_id,
        handler: async (response) => {
          const verifyRes = await fetch(`${BASE_URL}/course-payment/verify-payment`, {
            method: 'POST',
            headers: authHeaders(),
            credentials: 'include',
            body: JSON.stringify(response)
          });
          const verify = await verifyRes.json();
          setPaying(false);
          if (verify.success) {
            setEnrolled(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            alert('Payment went through but confirmation failed. Please contact support with your payment ID.');
          }
        },
        prefill: { name: user.name, email: user.email, contact: user.phone },
        theme: { color: PURPLE },
        modal: { ondismiss: () => setPaying(false) }
      });
      rzp.on('payment.failed', (r) => {
        setPaying(false);
        alert(`Payment failed: ${r.error?.description || 'Please try again.'}`);
      });
      rzp.open();
    } catch (e) {
      console.error(e);
      alert('Payment could not be started. Please try again.');
      setPaying(false);
    }
  };

  // Auto-resume: user clicked Buy, got sent to Google login, and is now
  // back on this page signed in. Re-open checkout once, automatically,
  // re-applying the live-track coupon first if they had one.
  const autoResumedRef = useRef(false);
  useEffect(() => {
    if (autoResumedRef.current) return;
    const raw = sessionStorage.getItem('excelCheckoutPending');
    if (!raw) return;
    let pending;
    try { pending = JSON.parse(raw); } catch { sessionStorage.removeItem('excelCheckoutPending'); return; }
    if (!pending?.track || Date.now() - (pending.at || 0) > 15 * 60 * 1000) {
      sessionStorage.removeItem('excelCheckoutPending');
      return;
    }
    if (!getUser()) return;
    autoResumedRef.current = true;
    sessionStorage.removeItem('excelCheckoutPending');
    (async () => {
      let coupon = null;
      if (pending.track === 'live' && pending.coupon) {
        try {
          const res = await fetch(`${BASE_URL}/coupons/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: pending.coupon, orderAmount: livePrice })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            coupon = { code: data.code, discount: data.totalDiscount };
            setCouponApplied(coupon);
          }
        } catch { /* resume without the coupon rather than not at all */ }
      }
      handleBuy(pending.track, coupon);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToPricing = () => {
    document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const stats = [
    { icon: Clock, label: '20+ Hours Content' },
    { icon: FileText, label: '12 Modules' },
    { icon: Star, label: '4.9/5 Rating' },
    { icon: InfinityIcon, label: 'Lifetime Access' },
    { icon: Award, label: 'Certificate Included' },
    { icon: Users, label: 'Beginner Friendly' },
  ];

  const included = [
    '20+ hours of HD recorded lessons',
    '12 modules — basics to AI dashboards',
    'Real business case studies',
    'ChatGPT workflows for Excel',
    'Downloadable notes & resources',
    'Certificate of completion',
    'Lifetime access, pay once',
    'Final assessment & review',
  ];

  const compareRows = [
    { f: 'Structured curriculum', us: true, yt: false, other: 'partial' },
    { f: 'AI tools training (ChatGPT in Excel)', us: true, yt: false, other: false },
    { f: 'Certificate on completion', us: true, yt: false, other: true },
    { f: 'Doubt support', us: true, yt: false, other: 'partial' },
    { f: 'Price', us: '₹199', yt: 'Free', other: '₹10,000+' },
  ];

  const CellMark = ({ v }) => {
    if (v === true) return <CheckCircle2 size={22} className="mx-auto" style={{ color: GREEN }} />;
    if (v === false) return <X size={22} className="mx-auto text-red-500" />;
    if (v === 'partial') return <span className="text-amber-500 font-bold text-sm">Partial</span>;
    return <span className="font-black text-lg">{v}</span>;
  };

  return (
    <div className="min-h-screen font-sans text-slate-900" style={{ background: PAGE_BG }}>
      <Navbar />

      {/* ===== ANNOUNCEMENT BAR ===== */}
      <div className="w-full text-center text-white text-xs sm:text-sm font-semibold py-2 px-4"
        style={{ background: `linear-gradient(90deg, ${PURPLE_DARK}, ${PURPLE})` }}>
        Excel Mastery with Generative AI &nbsp;·&nbsp; Recorded + Live options &nbsp;·&nbsp; Certificate included
      </div>

      {enrolled && (
        <div className="max-w-6xl mx-auto px-4 mt-6">
          <div className="rounded-2xl p-5 flex items-center gap-4 text-white shadow-lg"
            style={{ background: `linear-gradient(90deg, #15803d, ${GREEN})` }}>
            <BadgeCheck size={32} className="shrink-0" />
            <div>
              <p className="font-black text-lg">Enrolment confirmed — welcome aboard!</p>
              <p className="text-sm text-white/90">Your course library is ready in your profile.</p>
            </div>
            <button onClick={() => navigate('/profile')}
              className="ml-auto bg-white font-bold px-6 py-3 rounded-xl text-sm shrink-0"
              style={{ color: GREEN }}>
              Go to Profile
            </button>
          </div>
        </div>
      )}

      {/* ===== HERO ===== */}
      <section className="max-w-6xl mx-auto px-4 pt-8">
        <div className="rounded-3xl p-8 md:p-12 text-white relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${PLUM} 0%, #3B1F4D 100%)` }}>
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20 blur-3xl"
            style={{ background: PURPLE }} />
          <div className="grid md:grid-cols-2 gap-10 items-center relative">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
                style={{ background: 'rgba(22,163,74,0.18)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.35)' }}>
                <span className="w-2 h-2 rounded-full animate-ping" style={{ background: '#4ADE80' }} />
                New AI Modules Added
              </div>

              <h1 className="text-4xl md:text-5xl font-black leading-[1.12] tracking-tight mb-4">
                Become an <span style={{ color: '#C4B5FD' }}>Advanced Excel</span><br />
                <span className="relative inline-block">
                  with AI Expert
                  <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 200 10" preserveAspectRatio="none">
                    <path d="M2 8 Q 100 -2 198 6" stroke={PURPLE} strokeWidth="5" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>

              <p className="text-slate-300 text-base md:text-lg mb-6 max-w-md">
                Go from spreadsheet basics to AI-powered dashboards. Learn VLOOKUP, Pivot Tables,
                automation and ChatGPT workflows on real business data.
              </p>

              {/* Price row */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="text-slate-400 line-through text-xl font-semibold">₹999</span>
                <span className="text-5xl font-black text-white">₹{recordedPrice}</span>
                <span className="px-3 py-1.5 rounded-lg text-sm font-black text-white"
                  style={{ background: '#1F2937' }}>80% OFF</span>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-7"
                style={{ background: 'rgba(22,163,74,0.16)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.3)' }}>
                <ShieldCheck size={15} />
                Lifetime access · Certificate included · No hidden charges
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => handleBuy('recorded')} disabled={paying}
                  className="px-8 py-4 rounded-2xl font-black text-lg text-white shadow-xl transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(90deg, ${PURPLE_DARK}, ${PURPLE})` }}>
                  {paying ? <><Loader2 size={20} className="animate-spin" /> Processing…</> : <>Enroll Now @ ₹{recordedPrice} <ArrowRight size={20} /></>}
                </button>
                <button onClick={scrollToPricing}
                  className="px-8 py-4 rounded-2xl font-bold text-lg border border-white/20 text-white hover:bg-white/10 transition-colors">
                  View Plans
                </button>
              </div>
              <p className="text-slate-400 text-xs mt-3">Secure payment via Razorpay · UPI, cards & netbanking</p>
            </div>

            <div className="relative hidden md:block">
              <div className="rounded-2xl overflow-hidden border border-white/15 shadow-2xl">
                <img
                  src="https://res.cloudinary.com/dvcs9x8yp/image/upload/v1770749468/EXCEL_WITH_AI_aqwtoe.png"
                  alt="Excel with AI course"
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl px-5 py-3 flex items-center gap-3">
                <div className="flex" style={{ color: GOLD }}>
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} fill="currentColor" />)}
                </div>
                <div className="text-slate-900">
                  <p className="font-black text-sm leading-none">4.9/5</p>
                  <p className="text-[11px] text-slate-500">Student rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust chips */}
        <div className="flex flex-wrap gap-3 mt-6 justify-center">
          {['20+ Hours Content', '12 In-depth Modules', 'Certificate Included'].map(c => (
            <span key={c} className="inline-flex items-center gap-2 bg-white border border-purple-100 rounded-full px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">
              <CheckCircle2 size={16} style={{ color: GREEN }} /> {c}
            </span>
          ))}
        </div>
      </section>

      {/* ===== STATS STRIP ===== */}
      <section className="max-w-6xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.map(({ icon: Icon, label }) => (
            <div key={label} className="bg-white rounded-2xl border border-purple-100 p-4 text-center shadow-sm">
              <Icon size={22} className="mx-auto mb-2" style={{ color: PURPLE }} />
              <p className="text-xs font-bold text-slate-700">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== EVERYTHING YOU GET ===== */}
      <section className="max-w-6xl mx-auto px-4 mt-14">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-2">
          Everything you get <span style={{ color: PURPLE }}>inside the course</span>
        </h2>
        <p className="text-slate-500 text-center mb-8">One payment. Everything below, forever.</p>
        <div className="grid sm:grid-cols-2 gap-3 max-w-4xl mx-auto">
          {included.map(item => (
            <div key={item} className="flex items-center gap-3 bg-white rounded-2xl border border-purple-100 px-5 py-4 shadow-sm">
              <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(22,163,74,0.12)' }}>
                <CheckCircle2 size={18} style={{ color: GREEN }} />
              </span>
              <span className="font-semibold text-slate-700 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CURRICULUM ===== */}
      <section className="max-w-4xl mx-auto px-4 mt-16">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-2">
          Excel with AI <span style={{ color: PURPLE }}>Curriculum</span>
        </h2>
        <p className="text-slate-500 text-center mb-8">12 modules · basics to AI-powered analysis · real projects</p>

        <div className="space-y-3">
          {syllabus.map((mod, idx) => {
            const Icon = mod.icon;
            const open = openModule === idx;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenModule(open ? null : idx)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left">
                  <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white"
                    style={{ background: `linear-gradient(135deg, ${PURPLE}, ${PURPLE_DARK})` }}>
                    <Icon size={20} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[11px] font-black uppercase tracking-widest" style={{ color: PURPLE }}>
                      Module {idx + 1}
                    </span>
                    <span className="block font-bold text-slate-900">{mod.title}</span>
                  </span>
                  <span className="hidden sm:flex items-center gap-1 text-xs text-slate-500 font-semibold">
                    <Clock size={14} /> {mod.items.length} lessons
                  </span>
                  <ChevronDown size={20} className={`transition-transform ${open ? 'rotate-180' : ''}`}
                    style={{ color: PURPLE }} />
                </button>
                {open && (
                  <div className="px-5 pb-5 pt-1 border-t border-dashed border-purple-100">
                    <ul className="pt-3 space-y-2">
                      {mod.items.map((lesson, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                          <PlayCircle size={16} style={{ color: PURPLE }} className="shrink-0" />
                          {lesson}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing-section" className="max-w-6xl mx-auto px-4 mt-20">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-2">
          Choose Your <span style={{ color: PURPLE }}>Perfect Plan</span>
        </h2>
        <p className="text-slate-500 text-center mb-10">Start small with recordings, or go big with live mentorship.</p>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
          {/* ---- RECORDED TICKET ---- */}
          <div className="relative bg-white rounded-3xl border-2 border-purple-100 shadow-xl overflow-hidden flex flex-col">
            <div className="px-8 pt-8 pb-2 text-center">
              <span className="inline-block px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-widest text-white mb-4"
                style={{ background: PURPLE }}>Self-Paced</span>
              <h3 className="font-black text-xl text-slate-900">Recorded Course</h3>
              <p className="text-sm text-slate-500 mt-1">Learn at your own speed</p>
            </div>

            {/* perforation band */}
            <div className="relative my-2 py-5" style={{ background: CREAM, borderTop: '2px dashed #E9D5FF', borderBottom: '2px dashed #E9D5FF' }}>
              <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full" style={{ background: PAGE_BG }} />
              <span className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full" style={{ background: PAGE_BG }} />
              <div className="text-center">
                <span className="text-slate-400 line-through text-lg font-semibold mr-2">₹999</span>
                <span className="text-5xl font-black" style={{ color: PURPLE }}>₹{recordedPrice}</span>
                <p className="font-bold text-sm mt-1" style={{ color: GREEN }}>You save 80%</p>
              </div>
            </div>

            <ul className="px-8 py-4 space-y-3 text-sm text-slate-700 flex-1">
              {['20+ hours recorded lessons', 'Lifetime access', 'Certificate of completion', 'Notes & resources'].map(f => (
                <li key={f} className="flex items-center gap-3">
                  <CheckCircle2 size={18} style={{ color: GREEN }} className="shrink-0" /> {f}
                </li>
              ))}
            </ul>

            <div className="px-8 pb-8">
              <button onClick={() => handleBuy('recorded')} disabled={paying}
                className="w-full py-4 rounded-2xl font-black text-white text-lg transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
                style={{ background: `linear-gradient(90deg, ${PURPLE_DARK}, ${PURPLE})` }}>
                {paying ? 'Processing…' : `Enroll Now @ ₹${recordedPrice}`}
              </button>
            </div>
          </div>

          {/* ---- LIVE TICKET ---- */}
          <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col"
            style={{ border: `2px solid ${PURPLE}` }}>
            <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest text-white"
              style={{ background: RED }}>Most Popular</div>

            <div className="px-8 pt-8 pb-2 text-center">
              <span className="inline-block px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-widest text-white mb-4"
                style={{ background: GREEN }}>Live + AI Cohort</span>
              <h3 className="font-black text-xl text-slate-900">Live Mentorship</h3>
              <p className="text-sm text-slate-500 mt-1">Learn directly from experts</p>
            </div>

            <div className="relative my-2 py-5" style={{ background: CREAM, borderTop: '2px dashed #E9D5FF', borderBottom: '2px dashed #E9D5FF' }}>
              <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full" style={{ background: PAGE_BG }} />
              <span className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full" style={{ background: PAGE_BG }} />
              <div className="text-center">
                {liveDiscount > 0 ? (
                  <>
                    <span className="text-slate-400 line-through text-lg font-semibold mr-2">₹{livePrice}</span>
                    <span className="text-5xl font-black" style={{ color: PURPLE }}>₹{liveEffective}</span>
                    <p className="font-bold text-sm mt-1" style={{ color: GREEN }}>
                      Coupon {couponApplied.code} applied — you save ₹{liveDiscount}!
                    </p>
                  </>
                ) : (
                  <>
                    <span className="text-slate-400 line-through text-lg font-semibold mr-2">₹3,999</span>
                    <span className="text-5xl font-black" style={{ color: PURPLE }}>₹{livePrice}</span>
                    <p className="font-bold text-sm mt-1" style={{ color: GREEN }}>First 5 students pay only ₹1,999</p>
                  </>
                )}
              </div>
            </div>

            {/* Coupon box */}
            <div className="px-8 pt-2">
              {liveDiscount > 0 ? (
                <div className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold"
                  style={{ background: 'rgba(22,163,74,0.1)', color: GREEN, border: '1px dashed rgba(22,163,74,0.4)' }}>
                  <span className="flex items-center gap-2"><Tag size={16} /> {couponApplied.code}</span>
                  <button onClick={() => { setCouponApplied(null); setCouponMsg({ type: '', text: '' }); setCouponCode(''); }}
                    className="underline text-xs">Remove</button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Coupon code (try EXCEL500)"
                      className="flex-1 rounded-xl border-2 border-purple-100 px-4 py-2.5 text-sm font-bold uppercase outline-none focus:border-purple-400"
                    />
                    <button onClick={applyCoupon} disabled={couponLoading}
                      className="px-5 py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-60"
                      style={{ background: PURPLE }}>
                      {couponLoading ? '…' : 'Apply'}
                    </button>
                  </div>
                  {couponMsg.text && (
                    <p className={`text-xs font-bold mt-2 ${couponMsg.type === 'success' ? '' : 'text-red-500'}`}
                      style={couponMsg.type === 'success' ? { color: GREEN } : {}}>
                      {couponMsg.text}
                    </p>
                  )}
                </div>
              )}
            </div>

            <ul className="px-8 py-4 space-y-3 text-sm text-slate-700 flex-1">
              {['Everything in Recorded, plus:', 'Live classes on AI & dashboards', '1-on-1 doubt solving', 'Verified "AI in Excel" certificate', 'Resume review'].map((f, i) => (
                <li key={f} className={`flex items-center gap-3 ${i === 0 ? 'font-black text-slate-900' : ''}`}>
                  <CheckCircle2 size={18} style={{ color: i === 0 ? PURPLE : GREEN }} className="shrink-0" /> {f}
                </li>
              ))}
            </ul>

            <div className="px-8 pb-8">
              <button onClick={() => handleBuy('live')} disabled={paying}
                className="w-full py-4 rounded-2xl font-black text-white text-lg transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(90deg, #15803d, ${GREEN})` }}>
                {paying ? 'Processing…' : <><Zap size={20} fill="currentColor" /> Enroll in Live Cohort @ ₹{liveEffective}</>}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COMPARISON ===== */}
      <section className="max-w-4xl mx-auto px-4 mt-20">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-8">
          Why learners <span style={{ color: PURPLE }}>trust Upskale?</span>
        </h2>
        <div className="bg-white rounded-3xl border border-purple-100 shadow-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-purple-100">
                <th className="text-left px-5 py-4 font-bold text-slate-500">Features</th>
                <th className="px-3 py-4 font-black" style={{ color: PURPLE, background: 'rgba(124,58,237,0.06)' }}>Upskale ₹199</th>
                <th className="px-3 py-4 font-bold text-slate-500">YouTube</th>
                <th className="px-3 py-4 font-bold text-slate-500 hidden sm:table-cell">Others ₹10K+</th>
              </tr>
            </thead>
            <tbody>
              {compareRows.map((r, i) => (
                <tr key={r.f} className={i % 2 ? 'bg-purple-50/40' : ''}>
                  <td className="px-5 py-3.5 font-semibold text-slate-700">{r.f}</td>
                  <td className="px-3 py-3.5 text-center" style={{ background: 'rgba(124,58,237,0.06)' }}><CellMark v={r.us} /></td>
                  <td className="px-3 py-3.5 text-center"><CellMark v={r.yt} /></td>
                  <td className="px-3 py-3.5 text-center hidden sm:table-cell"><CellMark v={r.other} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="max-w-6xl mx-auto px-4 mt-20">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-2">
          Student <span style={{ color: PURPLE }}>success stories</span>
        </h2>
        <p className="text-slate-500 text-center mb-8">Real learners. Real promotions.</p>
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map(t => (
            <div key={t.name} className="bg-white rounded-3xl border border-purple-100 p-6 shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    {t.name} <BadgeCheck size={16} style={{ color: GREEN }} />
                  </p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3" style={{ color: GOLD }}>
                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="currentColor" />)}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">“{t.story}”</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="max-w-3xl mx-auto px-4 mt-20">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-8">
          Frequently asked <span style={{ color: PURPLE }}>questions</span>
        </h2>
        <div className="space-y-3">
          {faqs.map((f, i) => {
            const open = openFaq === i;
            return (
              <div key={i} className="rounded-2xl overflow-hidden"
                style={{ background: '#F3EFFF', border: '1px solid #E9D5FF' }}>
                <button onClick={() => setOpenFaq(open ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left font-bold text-slate-900">
                  {f.q}
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-lg shrink-0"
                    style={{ background: PURPLE }}>{open ? '−' : '+'}</span>
                </button>
                {open && <p className="px-6 pb-5 text-sm text-slate-600 leading-relaxed border-t border-purple-200/60 pt-4">{f.a}</p>}
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="max-w-6xl mx-auto px-4 mt-20 mb-24">
        <div className="rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})` }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
          <div className="relative">
            <GraduationCap size={44} className="mx-auto mb-5 text-white/90" />
            <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
              Stop working hard.<br />Start working smart.
            </h2>
            <p className="text-white/85 mb-8 max-w-xl mx-auto">
              Join the Excel Mastery course today — recordings, AI workflows and certificate,
              all for less than a pizza.
            </p>
            <button onClick={() => handleBuy('recorded')} disabled={paying}
              className="bg-white font-black px-10 py-4 rounded-2xl text-lg hover:scale-105 active:scale-95 transition-transform disabled:opacity-70"
              style={{ color: PURPLE_DARK }}>
              {paying ? 'Processing…' : `Enroll Now @ ₹${recordedPrice}`}
            </button>
          </div>
        </div>
      </section>

      <Footer />

      {/* ===== STICKY MOBILE BAR ===== */}
      <div className="fixed bottom-0 left-0 w-full z-50 md:hidden"
        style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)', borderTop: '1px solid #E9D5FF' }}>
        <div className="flex items-center justify-between gap-4 px-5 py-3">
          <div>
            <p className="text-[11px] text-slate-500 font-semibold leading-none mb-1">Starts at</p>
            <p className="leading-none">
              <span className="text-slate-400 line-through text-sm mr-1.5">₹999</span>
              <span className="text-2xl font-black" style={{ color: PURPLE }}>₹{recordedPrice}</span>
            </p>
          </div>
          <button onClick={() => handleBuy('recorded')} disabled={paying}
            className="flex-1 py-3.5 rounded-2xl font-black text-white active:scale-95 transition-transform disabled:opacity-70"
            style={{ background: `linear-gradient(90deg, ${PURPLE_DARK}, ${PURPLE})` }}>
            {paying ? 'Processing…' : 'Enroll Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExcelCoursePage;
