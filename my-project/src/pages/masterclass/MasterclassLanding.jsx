import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, CheckCircle2, Star, User,
  ArrowRight, Zap, ShieldCheck, Users,
  Loader2, Trophy, Gift, Layout,
  ChevronDown, Timer, Video, FileText,
  GraduationCap, Check, Sparkles, Award
} from 'lucide-react';
import { BASE_URL } from '../../config';

// ================= THEME TOKENS (Outskill / Claude palette) =================
const CLAY = '#c96442';       // primary accent (terracotta)
const CLAY_DARK = '#b85435';  // hover / gradient end
const CREAM = '#faf9f5';      // page background
const CREAM_ALT = '#f5f2eb';  // alternate section background
const CARD = '#ffffff';       // card background
const BORDER = '#e9e6dc';     // hairline borders
const INK = '#1a1a18';        // primary text
const MUTE = '#6b675f';       // muted text
const GREEN = '#15875a';      // "FREE" highlight
const LOGO_URL = 'https://res.cloudinary.com/villain/image/upload/v1770662332/20250730_170553_0000_xyfhoc.png';

const MasterclassLanding = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(9 * 60 + 59); // evergreen urgency timer

  // --- DUMMY DATA (fallback / demo) ---
  const DEFAULT_DATA = {
    _id: "demo_id_123",
    title: "10X Work Productive Gen AI Workshop",
    tagline: "Master practical AI skills you can use right away to work faster, smarter, and better — even if you're completely new to AI. 🚀",
    bannerImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop",
    expert: {
      name: "Soumyadeep Datta",
      designation: "Gen AI Expert & Workshop Mentor",
      image: "/soumyadeep.png",
      bio: "Soumyadeep has trained thousands of professionals to put AI to work in their day-to-day roles — turning hours of manual effort into minutes with the right tools and workflow."
    },
    schedule: {
      startDate: new Date(new Date().setDate(new Date().getDate() + 5)),
      startTime: "07:00 PM", endTime: "10:00 PM"
    },
    price: { original: 99, discounted: 0 },
    whatYouWillLearn: [
      { title: "The ACE Framework", desc: "A clear system to know exactly which AI to use, when, and why — to 10X your output." },
      { title: "Hands-on Gen AI Mastery", desc: "Prompts, projects, skills and connectors — the right way to get output that actually works." },
      { title: "Data Analysis with AI", desc: "Turn raw data into charts, insights and decisions — kill 80% of your Excel work." },
      { title: "Build Websites & Decks Live", desc: "Ship a landing page and a full presentation with zero code, built live in front of you." }
    ],
    whoIsThisFor: [
      { label: "Working Professionals", icon: <User /> },
      { label: "Founders & Managers", icon: <Layout /> },
      { label: "Freelancers", icon: <Zap /> },
      { label: "Students", icon: <Trophy /> }
    ],
    bonuses: [
      { title: "Complete AI Setup Guide", desc: "Value ₹999 — step-by-step doc to set up AI correctly from day one.", icon: <FileText size={24} /> },
      { title: "Full Session Notes", desc: "Value ₹999 — every prompt, tool, link and framework, yours to keep.", icon: <Video size={24} /> },
      { title: "Completion Certificate", desc: "Official verified badge.", icon: <GraduationCap size={24} /> }
    ],
    faqs: [
      { question: "Is this workshop really free?", answer: "Yes! The workshop is 100% free — you only pay a small ₹9 convenience fee to confirm your seat." },
      { question: "Do I need any coding or technical background?", answer: "Not at all. This session is designed to take you from fundamentals to advanced use with zero code." },
      { question: "Will there be a recording?", answer: "Yes, registered attendees get access to the session recording." }
    ],
    reviews: [
      { studentName: "Rahul Verma", rating: 5, comment: "I learned more in these hours than in a 6-month course. Absolutely insane value!" },
      { studentName: "Priya Sharma", rating: 5, comment: "The bonuses alone were worth it. Highly recommended for any working professional." },
      { studentName: "Amit Patel", rating: 5, comment: "Direct, no-fluff content. I applied it the very next day at work." }
    ],
    totalSeats: 100,
    enrolledCount: 87
  };

  const [data, setData] = useState(DEFAULT_DATA);

  // Evergreen countdown
  useEffect(() => {
    const t = setInterval(() => {
      setSecondsLeft(prev => (prev <= 1 ? 9 * 60 + 59 : prev - 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  // 🔴 SILENT BACKGROUND USER REFRESH
  useEffect(() => {
    const fetchUserProfile = async () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return;
      const localData = JSON.parse(storedUser);
      setUser(localData);
      try {
        const res = await fetch(`${BASE_URL}/user/${localData._id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });
        if (res.ok) {
          const freshUserData = await res.json();
          setUser(freshUserData);
          localStorage.setItem('user', JSON.stringify(freshUserData));
        }
      } catch (error) {
        console.error("Silent user refresh failed", error);
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${BASE_URL}/masterclasses/${slug}`);
        if (!res.ok) throw new Error("Fetch failed");
        const result = await res.json();
        const apiData = result.masterclassData || result;
        setData(prev => ({
          ...prev, ...apiData,
          expert: { ...prev.expert, ...apiData.expert },
          schedule: { ...prev.schedule, ...apiData.schedule },
          price: { ...prev.price, ...apiData.price },
          whatYouWillLearn: apiData.whatYouWillLearn?.length ? apiData.whatYouWillLearn : prev.whatYouWillLearn,
          whoIsThisFor: apiData.whoIsThisFor?.length ? apiData.whoIsThisFor : prev.whoIsThisFor,
        }));
      } catch (err) { console.log("Using Demo Data"); }
      finally { setLoading(false); }
    };
    if (slug) fetchData(); else setLoading(false);
  }, [slug]);

  const checkIsPurchased = () => {
    if (!user || !data._id) return false;
    if (user.role === 'admin') return true;
    const allEnrollments = [
      ...(user.enrolledCourses || []),
      ...(user.enrolledCohorts || [])
    ];
    return allEnrollments.some(e => {
      if (!e || !e.item) return false;
      const itemId = typeof e.item === 'string' ? e.item : e.item._id;
      return itemId.toString() === data._id.toString();
    });
  };
  const isPurchased = checkIsPurchased();

  const handleAuthAction = async () => {
    if (isPurchased) return navigate('/profile');
    // Free workshops still route through the cart so the ₹9 convenience fee is collected.
    navigate('/masterclasscart', {
      state: { item: { id: data._id, title: data.title, plan: "Live Masterclass", image: data.bannerImage, type: "Masterclass", price: data.price?.discounted || 0, originalPrice: data.price?.original || 0, features: ["Live Session", "Certificate", "Q&A"] } }
    });
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
  const isFree = data.price?.discounted === 0;
  const original = data.price?.original || 0;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: CREAM }}>
      <Loader2 className="animate-spin w-10 h-10" style={{ color: CLAY }} />
    </div>
  );

  // Reusable primary button
  const CtaButton = ({ label, className = '' }) => (
    <button
      onClick={handleAuthAction}
      className={`inline-flex items-center justify-center gap-2 font-bold text-white rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg ${className}`}
      style={{ background: `linear-gradient(90deg, ${CLAY_DARK}, ${CLAY})`, boxShadow: '0 10px 25px -10px rgba(201,100,66,0.6)' }}
    >
      {label} <ArrowRight size={18} />
    </button>
  );

  const PriceBlock = ({ compact = false }) => (
    <div className="rounded-2xl p-6 text-center" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
      <p className="text-sm font-semibold" style={{ color: MUTE }}>Total Value:{' '}
        <span className="line-through">₹{original.toLocaleString()}</span>
      </p>
      <p className="text-xs font-bold uppercase tracking-widest mt-3" style={{ color: MUTE }}>Today you can get it for</p>
      <div className="text-6xl font-black mt-1" style={{ color: isFree ? GREEN : INK }}>
        {isFree ? 'FREE' : `₹${data.price?.discounted}`}
      </div>
      <div className="flex items-center justify-center gap-4 mt-5 text-sm" style={{ color: INK }}>
        <span className="inline-flex items-center gap-1.5 font-semibold"><Calendar size={15} style={{ color: CLAY }} /> {formatDate(data.schedule.startDate)}</span>
      </div>
      <div className="flex items-center justify-center gap-1.5 mt-2 text-sm font-semibold" style={{ color: INK }}>
        <Clock size={15} style={{ color: CLAY }} /> {data.schedule.startTime} – {data.schedule.endTime} IST
      </div>
      <CtaButton label={isPurchased ? 'Go to Your Profile' : `Register now for ₹${original} Free`} className="w-full mt-6 py-4 text-lg" />
      {!compact && (
        <>
          <p className="text-xs font-semibold mt-4" style={{ color: MUTE }}>This special offer ends in</p>
          <div className="text-2xl font-black tracking-widest mt-1" style={{ color: CLAY }}>{mm}:{ss}</div>
        </>
      )}
      <div className="mt-4 flex items-center justify-center gap-1.5 text-xs" style={{ color: MUTE }}>
        <ShieldCheck size={13} /> Secure registration • Only ₹9 convenience fee
      </div>
    </div>
  );

  return (
    <div style={{ background: CREAM, color: INK, fontFamily: "'Poppins', sans-serif" }} className="min-h-screen overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .marquee { animation: marquee 30s linear infinite; }
      `}</style>

      {/* ===== ANNOUNCEMENT BAR ===== */}
      <div className="w-full text-center text-white text-xs sm:text-sm font-semibold py-2 px-4"
        style={{ background: `linear-gradient(90deg, ${CLAY_DARK}, ${CLAY})` }}>
        🔥 Almost Full! Claim one of the last free seats — offer ends in {mm}:{ss}
      </div>

      {/* ===== MINIMAL HEADER ===== */}
      <header className="sticky top-0 z-50 backdrop-blur-md" style={{ background: 'rgba(250,249,245,0.85)', borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center">
            <img src={LOGO_URL} alt="UPSKALE" className="h-9 w-auto object-contain" />
          </button>
          <CtaButton label={isPurchased ? 'My Profile' : 'Register Free'} className="px-5 py-2.5 text-sm" />
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="px-5 pt-12 pb-10">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5"
              style={{ background: CREAM_ALT, color: CLAY, border: `1px solid ${BORDER}` }}>
              <Sparkles size={13} /> No coding experience needed
            </span>
            <h1 className="text-4xl md:text-5xl font-black leading-[1.12] mb-5" style={{ color: INK }}>
              {data.title}
            </h1>
            <p className="text-lg leading-relaxed mb-7" style={{ color: MUTE }}>
              {data.tagline}
            </p>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mb-8">
              <div className="flex items-center gap-2">
                <Users size={18} style={{ color: CLAY }} />
                <span className="font-bold" style={{ color: INK }}>{data.enrolledCount > 20 ? data.enrolledCount : 20}+ Enrolled</span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={18} className="fill-current" style={{ color: '#e0a500' }} />
                <span className="font-bold" style={{ color: INK }}>4.9/5 Rated</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={18} style={{ color: CLAY }} />
                <span className="font-bold" style={{ color: INK }}>Certificate</span>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {["Live interactive session", "Real projects built live", "Q&A with the mentor", "Certificate of completion"].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full" style={{ background: CLAY }}>
                    <Check size={13} className="text-white" />
                  </span>
                  <span className="text-sm font-medium" style={{ color: INK }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing card */}
          {!isPurchased ? (
            <div className="lg:sticky lg:top-24">
              <div className="mb-3 text-center text-sm font-bold" style={{ color: CLAY }}>
                Claim one of the last seats for the workshop
              </div>
              <PriceBlock />
            </div>
          ) : (
            <div className="rounded-2xl p-8 text-center" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
              <CheckCircle2 size={40} className="mx-auto mb-3" style={{ color: GREEN }} />
              <h3 className="text-2xl font-black" style={{ color: INK }}>Your Seat Is Confirmed!</h3>
              <p className="mt-2" style={{ color: MUTE }}>Check your profile for the joining details.</p>
              <CtaButton label="Go to Your Profile" className="w-full mt-6 py-4 text-lg" />
            </div>
          )}
        </div>
      </section>

      {/* ===== TRUST STRIP ===== */}
      <section className="py-6 overflow-hidden" style={{ background: CREAM_ALT, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { v: `${data.enrolledCount > 20 ? data.enrolledCount : 20}+`, l: 'Enrolled' },
            { v: '4.9/5', l: 'Avg. Rating' },
            { v: '3 Hrs', l: 'Live Session' },
            { v: '100%', l: 'Actionable' },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-3xl font-black" style={{ color: INK }}>{s.v}</div>
              <div className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: CLAY }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SNEAK PEEK / WHAT YOU GET ===== */}
      <section className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: CLAY }}>Here's a sneak peek</span>
            <h2 className="text-3xl md:text-4xl font-black mt-2" style={{ color: INK }}>What You'll Get When You Register 👇</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {data.whatYouWillLearn.map((item, i) => (
              <div key={i} className="flex gap-4 p-6 rounded-2xl" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full mt-0.5" style={{ background: CLAY }}>
                  <Check size={16} className="text-white" />
                </span>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: INK }}>{typeof item === 'string' ? item : item.title}</h3>
                  {typeof item !== 'string' && item.desc && <p className="text-sm mt-1" style={{ color: MUTE }}>{item.desc}</p>}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10"><CtaButton label={`Register now for ₹${original} Free`} className="px-8 py-4 text-lg" /></div>
        </div>
      </section>

      {/* ===== TESTIMONIAL FEATURE ===== */}
      {data.reviews?.[0] && (
        <section className="py-16 px-5" style={{ background: CREAM_ALT }}>
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center gap-1 mb-5" style={{ color: '#e0a500' }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={20} className="fill-current" />)}
            </div>
            <p className="text-2xl md:text-3xl font-semibold leading-snug" style={{ color: INK }}>
              "{data.reviews[0].comment}"
            </p>
            <p className="mt-6 font-bold" style={{ color: CLAY }}>— {data.reviews[0].studentName}</p>
          </div>
        </section>
      )}

      {/* ===== WHO IS THIS FOR ===== */}
      <section className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: CLAY }}>Who is this for</span>
            <h2 className="text-3xl md:text-4xl font-black mt-2" style={{ color: INK }}>It Doesn't Matter What You Do</h2>
            <p className="mt-3" style={{ color: MUTE }}>Whatever your role or industry — this workshop works for you.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.whoIsThisFor.map((item, i) => (
              <div key={i} className="p-6 rounded-2xl text-center" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center mb-4" style={{ background: CREAM_ALT, color: CLAY }}>
                  {item.icon || <User />}
                </div>
                <h3 className="font-bold" style={{ color: INK }}>{item.label || item}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MENTOR ===== */}
      <section className="py-20 px-5" style={{ background: CREAM_ALT }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          {/* Photo panel */}
          <div className="relative rounded-[2rem] overflow-hidden flex items-end justify-center order-1"
            style={{ background: `radial-gradient(120% 85% at 50% 100%, ${CLAY}26, ${CARD})`, border: `1px solid ${BORDER}`, minHeight: '380px' }}>
            <div className="absolute bottom-0 w-48 h-48 rounded-full blur-3xl" style={{ background: `${CLAY}30` }} />
            <img src={data.expert.image || '/soumyadeep.png'} alt={data.expert.name}
              className="relative z-10 max-h-[460px] w-auto object-contain" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.18))' }} />
          </div>
          {/* Bio */}
          <div className="order-2">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5"
              style={{ background: CARD, color: CLAY, border: `1px solid ${BORDER}` }}>
              <Star size={12} className="fill-current" /> Your Mentor
            </span>
            <h2 className="text-3xl md:text-5xl font-black mb-2 leading-tight" style={{ color: INK }}>{data.expert.name}</h2>
            <p className="font-semibold text-lg mb-5" style={{ color: CLAY }}>{data.expert.designation}</p>
            <p className="text-lg leading-relaxed" style={{ color: MUTE }}>"{data.expert.bio}"</p>
          </div>
        </div>
      </section>

      {/* ===== BONUSES ===== */}
      <section className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: CLAY }}>Free bonuses</span>
            <h2 className="text-3xl md:text-4xl font-black mt-2" style={{ color: INK }}>You Also Get These For FREE</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {data.bonuses.map((bonus, i) => (
              <div key={i} className="p-7 rounded-2xl" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: CREAM_ALT, color: CLAY }}>
                  {typeof bonus === 'string' ? <Gift size={24} /> : (bonus.icon || <Gift size={24} />)}
                </div>
                <h3 className="font-bold text-lg" style={{ color: INK }}>{typeof bonus === 'string' ? bonus : bonus.title}</h3>
                {typeof bonus !== 'string' && bonus.desc && <p className="text-sm mt-2" style={{ color: MUTE }}>{bonus.desc}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== VALUE STACK CTA ===== */}
      <section className="py-16 px-5" style={{ background: CREAM_ALT }}>
        <div className="max-w-md mx-auto"><PriceBlock /></div>
      </section>

      {/* ===== REVIEWS GRID ===== */}
      {data.reviews?.length > 0 && (
      <section className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-12" style={{ color: INK }}>What Students Say</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {data.reviews.map((review, i) => (
              <div key={i} className="p-7 rounded-2xl" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <div className="flex gap-1 mb-4" style={{ color: '#e0a500' }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={15} className="fill-current" />)}
                </div>
                <p className="leading-relaxed mb-6" style={{ color: INK }}>"{review.comment}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ background: CLAY }}>
                    {review.studentName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: INK }}>{review.studentName}</p>
                    <p className="text-xs" style={{ color: MUTE }}>Verified Student</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ===== FAQ ===== */}
      {data.faqs?.length > 0 && (
      <section className="py-20 px-5" style={{ background: CREAM_ALT }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-10" style={{ color: INK }}>FAQs</h2>
          <div className="space-y-3">
            {data.faqs.map((faq, i) => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full p-5 flex items-center justify-between text-left">
                  <span className="font-bold" style={{ color: INK }}>{faq.question}</span>
                  <ChevronDown size={20} className={`transition-transform duration-300 ${activeFaq === i ? 'rotate-180' : ''}`} style={{ color: CLAY }} />
                </button>
                <div className={`px-5 overflow-hidden transition-all duration-300 ${activeFaq === i ? 'max-h-48 pb-5 opacity-100' : 'max-h-0 opacity-0'}`} style={{ color: MUTE }}>
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ===== FINAL CTA ===== */}
      <section className="py-20 px-5 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black mb-4" style={{ color: INK }}>Ready to Become 10X More Productive?</h2>
          <p className="text-lg mb-8" style={{ color: MUTE }}>Join {data.enrolledCount > 20 ? data.enrolledCount : 20}+ professionals. Seats are almost full.</p>
          <div className="max-w-md mx-auto"><PriceBlock /></div>
        </div>
      </section>

      {/* ===== STICKY BOTTOM CTA ===== */}
      <div className="fixed bottom-0 left-0 w-full z-50 backdrop-blur-md"
        style={{ background: 'rgba(255,255,255,0.9)', borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="hidden sm:block">
            {!isPurchased ? (
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black" style={{ color: GREEN }}>{isFree ? 'FREE' : `₹${data.price?.discounted}`}</span>
                <span className="text-sm line-through" style={{ color: MUTE }}>₹{original}</span>
                <span className="text-xs font-semibold ml-2" style={{ color: CLAY }}>Offer ends in {mm}:{ss}</span>
              </div>
            ) : (
              <span className="font-bold text-sm inline-flex items-center gap-1.5" style={{ color: GREEN }}>
                <CheckCircle2 size={16} /> Seat Confirmed
              </span>
            )}
          </div>
          <CtaButton label={isPurchased ? 'Go to Profile' : 'Grab Your Spot For Free'} className="flex-1 sm:flex-none px-6 py-3 text-sm sm:text-base justify-center" />
        </div>
      </div>
      <div className="h-20" />

      {/* ===== SLIM FOOTER ===== */}
      <footer className="py-8 px-5 text-center" style={{ background: INK, color: '#d9d5cc' }}>
        <img src={LOGO_URL} alt="UPSKALE" className="h-8 w-auto object-contain mx-auto" style={{ filter: 'brightness(0) invert(1)' }} />
        <p className="text-xs mt-3 opacity-70">© {new Date().getFullYear()} UPSKALE. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default MasterclassLanding;
