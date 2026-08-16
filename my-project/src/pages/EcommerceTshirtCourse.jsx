import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Check, CheckCircle2, Clock, Calendar, ChevronDown,
  Palette, Package, Megaphone, Wallet, Rocket, GraduationCap,
  ShoppingBag, Users, Target, ArrowRight, Star, ShieldCheck, Loader2
} from 'lucide-react';
import Accreditations from '../components/Accreditations';
import { BASE_URL } from '../config';

const COURSE_KEY = 'ecommerce-tshirt-business';

const loadScript = (src) => new Promise((resolve) => {
  if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
  const s = document.createElement('script');
  s.src = src;
  s.onload = () => resolve(true);
  s.onerror = () => resolve(false);
  document.body.appendChild(s);
});

// ================= THEME TOKENS (shared with MasterclassLanding) =================
const CLAY = '#c96442';
const CLAY_DARK = '#b85435';
const CREAM = '#faf9f5';
const CREAM_ALT = '#f5f2eb';
const CARD = '#ffffff';
const BORDER = '#e9e6dc';
const INK = '#1a1a18';
const MUTE = '#6b675f';
const LOGO_URL = 'https://res.cloudinary.com/villain/image/upload/v1770662332/20250730_170553_0000_xyfhoc.png';

const MENTOR = {
  name: 'Soumyadeep Datta',
  role: 'AI & Business Skills Mentor',
  image: '/soumyadeep.png'
};

// ================= CURRICULUM (from the course document) =================

const CRASH_COURSE = [
  { n: 1,  topic: 'Welcome to E-commerce',              covers: 'What is e-commerce; how online businesses work; success stories of young entrepreneurs; setting personal goals for the T-shirt brand.' },
  { n: 2,  topic: 'Finding Your Niche',                 covers: 'Understanding target customers (age, interest, occasion); choosing a T-shirt theme — school life, gaming, anime, motivational quotes, local pride; simple market research.' },
  { n: 3,  topic: 'Designing Your First T-Shirt',       covers: 'Intro to Canva and free design tools; design principles (colour, font, placement); creating 2–3 sample designs.' },
  { n: 4,  topic: 'Sourcing & Printing Basics',         covers: 'Types of blank T-shirts and fabrics; printing methods explained (screen printing, DTG, vinyl, sublimation); finding local and online suppliers, plus print-on-demand options.' },
  { n: 5,  topic: 'Costing & Pricing',                  covers: 'Calculating cost per shirt (blank + printing + packaging); break-even basics; setting a fair, profitable selling price.' },
  { n: 6,  topic: 'Building an Online Presence',        covers: 'Choosing a brand name; creating an Instagram or WhatsApp Business page, or a simple online store.' },
  { n: 7,  topic: 'Branding & Packaging',               covers: 'Designing a logo; creating a brand story; simple, attractive packaging ideas on a budget.' },
  { n: 8,  topic: 'Product Photography & Listings',     covers: 'Taking good product photos with a phone; writing simple, appealing product descriptions; uploading listings.' },
  { n: 9,  topic: 'Marketing on Social Media',          covers: 'Instagram and WhatsApp status marketing; using hashtags; asking friends and family for first orders; a simple content calendar.' },
  { n: 10, topic: 'Taking Orders & Customer Service',   covers: 'Order forms, payment collection basics (UPI), handling customer questions and complaints politely.' },
  { n: 11, topic: 'Money Management',                   covers: 'Simple income–expense tracking in a notebook or Excel; saving vs. reinvesting profit; understanding revenue, cost and profit.' },
  { n: 12, topic: 'Launch Day & Presentation',          covers: 'Student presents their T-shirt brand — name, logo, designs, pricing and marketing plan — to the class and parents; feedback and next steps.' },
];

const WEEKEND_COURSE = [
  {
    month: 'Month 1', title: 'Foundations of E-Commerce', icon: ShoppingBag,
    blurb: 'Build a strong base in how online business and the T-shirt industry work.',
    classes: [
      { wk: 1, topic: 'Intro to E-Commerce',        covers: 'What is e-commerce; types of online businesses; how money is made online.' },
      { wk: 1, topic: 'Entrepreneurial Mindset',    covers: 'Traits of successful young entrepreneurs; goal-setting for the T-shirt brand.' },
      { wk: 2, topic: 'The T-Shirt Industry',       covers: 'Market size, trends and opportunities; who buys custom T-shirts and why.' },
      { wk: 2, topic: 'Niche & Target Audience',    covers: 'Choosing a theme or niche; identifying ideal customers; simple surveys.' },
      { wk: 3, topic: 'Competitor Research',        covers: 'Studying existing T-shirt brands online; identifying gaps and opportunities.' },
      { wk: 3, topic: 'Business Basics',            covers: 'Business model canvas (simplified); what makes a business idea viable.' },
      { wk: 4, topic: 'Goal Setting & Planning',    covers: 'Setting 6-month milestones; introduction to the capstone project.' },
      { wk: 4, topic: 'Month 1 Review & Quiz',      covers: 'Recap, doubt-clearing and a fun quiz on e-commerce basics.' },
    ]
  },
  {
    month: 'Month 2', title: 'Design & Production', icon: Palette,
    blurb: 'Learn to design, source and produce T-shirts.',
    classes: [
      { wk: 5, topic: 'Design Tools Workshop',      covers: 'Canva basics — layouts, text, colours, elements.' },
      { wk: 5, topic: 'Design Principles',          covers: 'Colour theory, typography and composition for T-shirt graphics.' },
      { wk: 6, topic: 'Creating Designs I',         covers: 'Hands-on: designing 2 original T-shirt graphics.' },
      { wk: 6, topic: 'Creating Designs II',        covers: 'Hands-on: refining designs; peer feedback session.' },
      { wk: 7, topic: 'Printing Methods',           covers: 'Screen printing, DTG, vinyl and sublimation — pros, cons and costs.' },
      { wk: 7, topic: 'Sourcing Suppliers',         covers: 'Finding blank T-shirt suppliers and local or online print vendors; print-on-demand platforms.' },
      { wk: 8, topic: 'Sample Production',          covers: 'Placing a trial order or DIY-printing a sample batch.' },
      { wk: 8, topic: 'Month 2 Review & Quiz',      covers: 'Recap and quality-check of the sample T-shirts produced.' },
    ]
  },
  {
    month: 'Month 3', title: 'Branding & Online Store Setup', icon: Package,
    blurb: 'Create a brand identity and set up the store.',
    classes: [
      { wk: 9,  topic: 'Brand Identity',            covers: 'Choosing a brand name, tagline and story.' },
      { wk: 9,  topic: 'Logo Design',               covers: 'Designing a simple, memorable logo using free tools.' },
      { wk: 10, topic: 'Packaging Design',          covers: 'Budget-friendly packaging ideas; adding a personal touch (thank-you cards, stickers).' },
      { wk: 10, topic: 'Costing & Pricing Deep Dive', covers: 'Full cost breakdown; competitive pricing strategy; profit margins.' },
      { wk: 11, topic: 'Setting Up Online Store',   covers: 'Instagram Shop, WhatsApp Business catalog or simple website options.' },
      { wk: 11, topic: 'Product Photography',       covers: 'Phone photography tips; lighting, backgrounds and styling flat-lays.' },
      { wk: 12, topic: 'Writing Product Listings',  covers: 'Compelling titles and descriptions; pricing display.' },
      { wk: 12, topic: 'Month 3 Review & Quiz',     covers: 'Recap; store walkthrough and peer review.' },
    ]
  },
  {
    month: 'Month 4', title: 'Digital Marketing', icon: Megaphone,
    blurb: 'Learn to promote and sell the brand online.',
    classes: [
      { wk: 13, topic: 'Social Media Basics',       covers: 'Instagram and Facebook for business; setting up a business profile.' },
      { wk: 13, topic: 'Content Planning',          covers: 'Creating a simple content calendar; types of posts — product, behind-the-scenes, testimonials.' },
      { wk: 14, topic: 'Content Creation',          covers: 'Shooting and editing simple promotional photos and reels using a phone.' },
      { wk: 14, topic: 'Hashtags & Reach',          covers: 'Using hashtags effectively; understanding likes, shares and reach.' },
      { wk: 15, topic: 'Word-of-Mouth & Local Marketing', covers: 'Leveraging friends, family and school or community networks for first sales.' },
      { wk: 15, topic: 'Intro to Paid Promotion',   covers: 'Basics of boosting posts and running a small budget ad — concept level, with adult supervision.' },
      { wk: 16, topic: 'Influencer & Collaboration Basics', covers: 'Partnering with peers and micro-influencers for shoutouts.' },
      { wk: 16, topic: 'Month 4 Review & Quiz',     covers: 'Recap and mini marketing campaign presentation.' },
    ]
  },
  {
    month: 'Month 5', title: 'Sales, Operations & Finance', icon: Wallet,
    blurb: 'Handle real orders, payments and money management.',
    classes: [
      { wk: 17, topic: 'Taking Orders',             covers: 'Order forms (Google Forms), managing order details, sizes and requests.' },
      { wk: 17, topic: 'Payments',                  covers: 'UPI and digital payment basics; issuing receipts.' },
      { wk: 18, topic: 'Customer Service',          covers: 'Handling questions, delays and complaints professionally.' },
      { wk: 18, topic: 'Delivery & Fulfilment',     covers: 'Packing orders, local delivery vs. courier options, timelines.' },
      { wk: 19, topic: 'Bookkeeping Basics',        covers: 'Tracking income and expenses in Excel or Google Sheets.' },
      { wk: 19, topic: 'Profit & Loss',             covers: 'Calculating profit, understanding break-even, saving vs. reinvesting.' },
      { wk: 20, topic: 'Handling Returns & Feedback', covers: 'Managing exchanges and returns; collecting and using customer feedback.' },
      { wk: 20, topic: 'Month 5 Review & Quiz',     covers: 'Recap; mock order-to-delivery role play.' },
    ]
  },
  {
    month: 'Month 6', title: 'Scaling & Capstone Launch', icon: Rocket,
    blurb: 'Refine the brand and launch it for real, with a final presentation.',
    classes: [
      { wk: 21, topic: 'Scaling Ideas',             covers: 'Expanding the product range (hoodies, mugs, caps); seasonal collections.' },
      { wk: 21, topic: 'Building a Brand Community', covers: 'Loyalty ideas, repeat customers, referral offers.' },
      { wk: 22, topic: 'Legal & Ethical Basics',    covers: 'Simple intro to business ethics, copyright-safe designs and honest advertising.' },
      { wk: 22, topic: 'Building the Business Plan', covers: 'Compiling brand name, designs, pricing and marketing plan into one document.' },
      { wk: 23, topic: 'Capstone Prep I',           covers: 'Finalizing designs, store and marketing materials for launch.' },
      { wk: 23, topic: 'Capstone Prep II',          covers: 'Rehearsing the final brand pitch and presentation.' },
      { wk: 24, topic: 'Launch Day',                covers: 'Live launch of the T-shirt brand; taking first real orders.' },
      { wk: 24, topic: 'Final Presentation & Graduation', covers: 'Student presents the complete T-shirt business to parents and a panel; certificates and feedback.' },
    ]
  },
];

const TRACKS = {
  crash: {
    key: 'crash',
    label: '12-Class Crash Course',
    short: 'Crash Course',
    tagline: 'A short, fast-paced introduction to e-commerce and starting a T-shirt brand.',
    meta: ['12 classes', '60–90 min each', 'Weekly or twice-weekly'],
    detail: 'Ideal as a foundation course — one class per week over 12 weeks, or twice a week over 6 weeks.',
    outcome: 'By the end of 12 classes the student will have chosen a niche, created sample T-shirt designs, understood pricing and printing options, set up a basic online presence, and pitched a complete (if small-scale) T-shirt brand.'
  },
  weekend: {
    key: 'weekend',
    label: '6-Month Weekend Course',
    short: 'Weekend Course',
    tagline: 'An in-depth, hands-on course for students who want to actually build and launch a T-shirt business.',
    meta: ['48 classes', '24 weekends', '2 classes every weekend'],
    detail: 'Runs every weekend for 6 months — Saturday and Sunday, 60–90 minutes per class.',
    outcome: 'By the end of 6 months the student will have researched, designed, branded, priced, marketed and actually launched a working T-shirt business — taking real orders and presenting a complete business plan to parents or a panel.'
  }
};

const EcommerceTshirtCourse = () => {
  const navigate = useNavigate();
  const [track, setTrack] = useState('weekend');
  const [openMonth, setOpenMonth] = useState(0);
  const [pricing, setPricing] = useState(null);
  const [paying, setPaying] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const enrolRef = useRef(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Prices come from the server, so changing a fee doesn't need a rebuild —
  // and the amount charged is decided there regardless of what's rendered here.
  useEffect(() => {
    fetch(`${BASE_URL}/course-payment/catalogue/${COURSE_KEY}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.success) setPricing(d.tracks); })
      .catch(() => {});
  }, []);

  const t = TRACKS[track];
  const price = pricing?.[track];

  const getUser = () => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  };

  // The API accepts a cookie OR a bearer token. The cookie is cross-site
  // (upskale.co → api.upskale.co) and browsers that block third-party cookies
  // drop it, so the token is sent explicitly the way the rest of the app does.
  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  const handleEnroll = async () => {
    const user = getUser();
    if (!user) {
      navigate('/login', { state: { returnTo: '/ecommerce-tshirt-business' } });
      return;
    }
    if (paying) return;
    setPaying(true);

    try {
      const orderRes = await fetch(`${BASE_URL}/course-payment/create-order`, {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({ courseKey: COURSE_KEY, trackKey: track })
      });
      const data = await orderRes.json();
      if (!orderRes.ok || !data.success) {
        // A 401 here means the session has lapsed rather than anything being
        // broken — say so and send them to log in, instead of a dead-end
        // "try again" that will fail identically every time.
        if (orderRes.status === 401) {
          alert('Your session has expired. Please log in again to continue.');
          navigate('/login', { state: { returnTo: '/ecommerce-tshirt-business' } });
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
          if (verify.success) setEnrolled(true);
          else alert('Payment went through but confirmation failed. Please contact support with your payment ID.');
        },
        prefill: { name: user.name, email: user.email, contact: user.phone },
        theme: { color: CLAY },
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

  const CtaButton = ({ label, className = '' }) => (
    <button
      onClick={handleEnroll}
      disabled={paying}
      className={`rounded-xl font-bold text-white transition-transform active:scale-[0.98] inline-flex items-center justify-center gap-2 disabled:opacity-70 ${className}`}
      style={{ background: `linear-gradient(90deg, ${CLAY_DARK}, ${CLAY})` }}
    >
      {paying ? <><Loader2 size={18} className="animate-spin" /> Processing…</> : <>{label} <ArrowRight size={18} /></>}
    </button>
  );

  return (
    <div className="min-h-screen" style={{ background: CREAM, fontFamily: "'Poppins', sans-serif" }}>

      {/* ===== ANNOUNCEMENT BAR ===== */}
      <div className="w-full text-center text-white text-xs sm:text-sm font-semibold py-2 px-4"
        style={{ background: `linear-gradient(90deg, ${CLAY_DARK}, ${CLAY})` }}>
        Built for students of Class 5 – Class 12 · Two course structures to choose from
      </div>

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 backdrop-blur-md" style={{ background: 'rgba(250,249,245,0.85)', borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center">
            <img src={LOGO_URL} alt="UPSKALE" className="h-9 w-auto object-contain" />
          </button>
          <CtaButton label="Enquire Now" className="px-5 py-2.5 text-sm" />
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="px-5 pt-12 pb-10">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5"
              style={{ background: CREAM_ALT, color: CLAY, border: `1px solid ${BORDER}` }}>
              <Sparkles size={13} /> For young entrepreneurs
            </span>
            <h1 className="text-4xl md:text-5xl font-black leading-[1.12] mb-5" style={{ color: INK }}>
              E-Commerce &amp; T-Shirt Business
            </h1>
            <p className="text-lg leading-relaxed mb-7" style={{ color: MUTE }}>
              A hands-on course where students design, brand, price and actually launch
              their own T-shirt label — from first sketch to first real order.
            </p>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mb-8">
              <div className="flex items-center gap-2">
                <GraduationCap size={18} style={{ color: CLAY }} />
                <span className="font-bold" style={{ color: INK }}>Class 5 – Class 12</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} style={{ color: CLAY }} />
                <span className="font-bold" style={{ color: INK }}>60–90 min per class</span>
              </div>
              <div className="flex items-center gap-2">
                <Target size={18} style={{ color: CLAY }} />
                <span className="font-bold" style={{ color: INK }}>Capstone launch</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {['Design real T-shirts', 'Set up an online store', 'Take real customer orders', 'Present a full business plan'].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full shrink-0" style={{ background: CLAY }}>
                    <Check size={13} className="text-white" />
                  </span>
                  <span className="text-sm font-medium" style={{ color: INK }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Track picker card */}
          <div className="lg:sticky lg:top-24">
            {/* Course banner */}
            <div className="rounded-2xl overflow-hidden mb-4" style={{ border: `1px solid ${BORDER}`, boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
              <img
                src="/ecommerce-course-banner.jpg"
                alt="How to start an e-commerce business — step by step guide covering finding a niche, building a store, getting traffic and making sales"
                className="w-full h-auto block"
              />
            </div>

            <div className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: MUTE }}>Choose your structure</p>

              {Object.values(TRACKS).map(opt => {
                const active = opt.key === track;
                return (
                  <button
                    key={opt.key}
                    onClick={() => { setTrack(opt.key); setOpenMonth(0); }}
                    className="w-full text-left rounded-xl p-4 mb-3 transition-all"
                    style={{
                      background: active ? 'rgba(201,100,66,0.06)' : CREAM_ALT,
                      border: `1.5px solid ${active ? CLAY : BORDER}`
                    }}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className="font-black text-[15px]" style={{ color: INK }}>{opt.label}</span>
                      {active && <CheckCircle2 size={18} style={{ color: CLAY }} />}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] font-semibold" style={{ color: CLAY }}>
                      {opt.meta.map((m, i) => <span key={i}>{m}</span>)}
                    </div>
                  </button>
                );
              })}

              <p className="text-[13px] leading-relaxed mt-2 mb-4" style={{ color: MUTE }}>{t.detail}</p>

              {/* Fee — rendered from the server catalogue */}
              <div className="rounded-xl p-4 mb-4 text-center" style={{ background: CREAM_ALT, border: `1px solid ${BORDER}` }}>
                {price ? (
                  <>
                    <div className="flex items-baseline justify-center gap-1.5">
                      <span className="text-3xl font-black" style={{ color: INK }}>₹{price.amount.toLocaleString('en-IN')}</span>
                      {track === 'weekend' && <span className="text-sm font-bold" style={{ color: MUTE }}>/ month</span>}
                    </div>
                    <p className="text-[12px] font-semibold mt-1" style={{ color: MUTE }}>{price.note}</p>
                    {track === 'weekend' && (
                      <p className="text-[11px] mt-1.5" style={{ color: MUTE }}>
                        You pay for Month 1 today — not the full ₹12,000
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-[13px] font-semibold" style={{ color: MUTE }}>Loading fee…</p>
                )}
              </div>

              {enrolled ? (
                <div className="rounded-xl p-5 text-center" style={{ background: 'rgba(21,135,90,0.06)', border: '1px solid rgba(21,135,90,0.3)' }}>
                  <CheckCircle2 size={32} className="mx-auto mb-2" style={{ color: '#15875a' }} />
                  <p className="font-black" style={{ color: INK }}>Enrollment confirmed</p>
                  <p className="text-[13px] mt-1" style={{ color: MUTE }}>We'll be in touch with batch details shortly.</p>
                </div>
              ) : (
                <>
                  <CtaButton label={`Enroll — ₹${price ? price.amount.toLocaleString('en-IN') : '…'}`} className="w-full py-4 text-base" />
                  <p className="text-[11px] text-center mt-3 flex items-center justify-center gap-1.5" style={{ color: MUTE }}>
                    <ShieldCheck size={12} /> Secure payment via Razorpay
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUST STRIP ===== */}
      <section className="py-6" style={{ background: CREAM_ALT, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { v: track === 'crash' ? '12' : '48', l: 'Classes' },
            { v: track === 'crash' ? '12 wks' : '6 months', l: 'Duration' },
            { v: '60–90', l: 'Min per class' },
            { v: '100%', l: 'Hands-on' },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-2xl font-black" style={{ color: CLAY }}>{s.v}</p>
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: MUTE }}>{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CURRICULUM ===== */}
      <section className="py-20 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: CLAY }}>Curriculum</span>
            <h2 className="text-3xl md:text-4xl font-black mt-2 mb-3" style={{ color: INK }}>{t.label}</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: MUTE }}>{t.tagline}</p>
          </div>

          {/* Track switcher */}
          <div className="flex justify-center gap-2 mb-10">
            {Object.values(TRACKS).map(opt => {
              const active = opt.key === track;
              return (
                <button
                  key={opt.key}
                  onClick={() => { setTrack(opt.key); setOpenMonth(0); }}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: active ? CLAY : CARD,
                    color: active ? '#fff' : MUTE,
                    border: `1px solid ${active ? CLAY : BORDER}`
                  }}
                >
                  {opt.short}
                </button>
              );
            })}
          </div>

          {/* 12-class crash course — flat numbered list */}
          {track === 'crash' && (
            <div className="space-y-3">
              {CRASH_COURSE.map(c => (
                <div key={c.n} className="rounded-2xl p-5 flex gap-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm"
                    style={{ background: 'rgba(201,100,66,0.08)', color: CLAY }}>
                    {c.n}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-[16px] mb-1.5" style={{ color: INK }}>{c.topic}</h3>
                    <p className="text-[14px] leading-relaxed" style={{ color: MUTE }}>{c.covers}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 6-month weekend course — collapsible per month */}
          {track === 'weekend' && (
            <div className="space-y-3">
              {WEEKEND_COURSE.map((m, idx) => {
                const Icon = m.icon;
                const open = openMonth === idx;
                return (
                  <div key={m.month} className="rounded-2xl overflow-hidden" style={{ background: CARD, border: `1px solid ${open ? CLAY : BORDER}` }}>
                    <button
                      onClick={() => setOpenMonth(open ? -1 : idx)}
                      className="w-full p-5 flex items-center gap-4 text-left"
                    >
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(201,100,66,0.08)', color: CLAY }}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black uppercase tracking-widest mb-0.5" style={{ color: CLAY }}>{m.month}</p>
                        <h3 className="font-black text-[16px] leading-snug" style={{ color: INK }}>{m.title}</h3>
                        <p className="text-[13px] mt-1" style={{ color: MUTE }}>{m.blurb}</p>
                      </div>
                      <ChevronDown size={20} className={`shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} style={{ color: CLAY }} />
                    </button>

                    {open && (
                      <div className="px-5 pb-5 pt-1 space-y-2.5" style={{ borderTop: `1px solid ${BORDER}` }}>
                        {m.classes.map((c, i) => (
                          <div key={i} className="flex gap-3 pt-3">
                            <span className="text-[11px] font-black shrink-0 mt-0.5 px-2 py-1 rounded-md"
                              style={{ background: CREAM_ALT, color: MUTE }}>
                              Wk {c.wk}
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-[14px]" style={{ color: INK }}>{c.topic}</p>
                              <p className="text-[13px] leading-relaxed mt-0.5" style={{ color: MUTE }}>{c.covers}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ===== OUTCOME ===== */}
      <section className="py-16 px-5" style={{ background: CREAM_ALT, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5"
            style={{ background: CARD, color: CLAY, border: `1px solid ${BORDER}` }}>
            <Rocket size={13} /> What they walk away with
          </span>
          <h2 className="text-2xl md:text-3xl font-black mb-4" style={{ color: INK }}>Outcome</h2>
          <p className="text-lg leading-relaxed" style={{ color: MUTE }}>{t.outcome}</p>
        </div>
      </section>

      {/* ===== WHO IS THIS FOR ===== */}
      <section className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: CLAY }}>Who is this for</span>
            <h2 className="text-3xl md:text-4xl font-black mt-2" style={{ color: INK }}>Built for school students</h2>
            <p className="text-lg mt-3" style={{ color: MUTE }}>No business background needed — just curiosity and a phone.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: GraduationCap, t: 'Class 5 – 8',      d: 'Learn how online businesses work through a fun, creative project.' },
              { icon: Palette,       t: 'Class 9 – 12',     d: 'Build a real brand and take genuine orders before college.' },
              { icon: Users,         t: 'School programmes', d: 'Runs as an after-school or weekend enrichment track.' },
              { icon: Rocket,        t: 'Young founders',   d: 'Anyone who wants to actually launch, not just study theory.' },
            ].map((x, i) => {
              const Icon = x.icon;
              return (
                <div key={i} className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(201,100,66,0.08)', color: CLAY }}>
                    <Icon size={20} />
                  </div>
                  <h3 className="font-black text-[16px] mb-1.5" style={{ color: INK }}>{x.t}</h3>
                  <p className="text-[14px] leading-relaxed" style={{ color: MUTE }}>{x.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== MENTOR ===== */}
      <section className="py-20 px-5" style={{ background: CREAM_ALT, borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div className="relative rounded-[2rem] overflow-hidden flex items-end justify-center order-1"
            style={{ background: `radial-gradient(120% 85% at 50% 100%, ${CLAY}26, ${CARD})`, border: `1px solid ${BORDER}`, minHeight: '340px' }}>
            <div className="absolute bottom-0 w-48 h-48 rounded-full blur-3xl" style={{ background: `${CLAY}30` }} />
            <img src={MENTOR.image} alt={MENTOR.name}
              className="relative z-10 max-h-[420px] w-auto object-contain"
              style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.18))' }} />
          </div>
          <div className="order-2">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5"
              style={{ background: CARD, color: CLAY, border: `1px solid ${BORDER}` }}>
              <Star size={12} className="fill-current" /> Your Mentor
            </span>
            <h2 className="text-3xl md:text-5xl font-black mb-2 leading-tight" style={{ color: INK }}>{MENTOR.name}</h2>
            <p className="font-semibold text-lg mb-5" style={{ color: CLAY }}>{MENTOR.role}</p>
            <p className="text-lg leading-relaxed" style={{ color: MUTE }}>
              Every class is taught live — students design, price and launch alongside the
              mentor rather than watching recordings, with feedback on their own brand as it takes shape.
            </p>
          </div>
        </div>
      </section>

      {/* ===== ACCREDITATIONS ===== */}
      <Accreditations accent={CLAY} />

      {/* ===== FINAL CTA ===== */}
      <section ref={enrolRef} className="py-20 px-5 scroll-mt-20" style={{ background: CREAM_ALT, borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: INK }}>
            Ready to start the T-shirt brand?
          </h2>
          <p className="text-lg mb-8" style={{ color: MUTE }}>
            You've chosen the {t.short.toLowerCase()}. Secure the seat now and we'll share
            batch timings and the next start date.
          </p>
          <div className="rounded-2xl p-6 mb-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Calendar size={18} style={{ color: CLAY }} />
              <span className="font-black" style={{ color: INK }}>{t.label}</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[13px] font-semibold mb-3" style={{ color: MUTE }}>
              {t.meta.map((m, i) => <span key={i}>{m}</span>)}
            </div>
            {price && (
              <p className="text-2xl font-black" style={{ color: INK }}>
                ₹{price.amount.toLocaleString('en-IN')}
                {track === 'weekend' && <span className="text-sm font-bold" style={{ color: MUTE }}> / month</span>}
              </p>
            )}
          </div>
          <CtaButton label={`Enroll — ₹${price ? price.amount.toLocaleString('en-IN') : '…'}`} className="px-8 py-4 text-lg" />
        </div>
      </section>

      <footer className="py-8 text-center text-sm" style={{ color: MUTE, background: CREAM }}>
        © {new Date().getFullYear()} UPSKALE. All rights reserved.
      </footer>

      {/* ===== STICKY BOTTOM CTA (mobile) ===== */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full z-50 backdrop-blur-md"
        style={{ background: 'rgba(255,255,255,0.95)', borderTop: `1px solid ${BORDER}`, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="px-4 py-3">
          <CtaButton label={`Enroll — ₹${price ? price.amount.toLocaleString('en-IN') : '…'}`} className="w-full py-4 text-base" />
        </div>
      </div>
      <div className="lg:hidden h-24" />
    </div>
  );
};

export default EcommerceTshirtCourse;
