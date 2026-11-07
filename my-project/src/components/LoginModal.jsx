import React from 'react';
import { X, Zap, GraduationCap, ShieldCheck, CheckCircle2, Sparkles, Lock, ArrowRight, PlayCircle, Award } from 'lucide-react';
import { BASE_URL } from '../config';

const GoogleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.144 45.789 L -6.734 42.379 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
    </g>
  </svg>
);

const LOGO_URL = "https://res.cloudinary.com/villain/image/upload/v1770662332/20250730_170553_0000_xyfhoc.png";

const PURPLE = '#7C3AED';
const PURPLE_DARK = '#5B21B6';
const PLUM = '#241530';
const GREEN = '#16A34A';

/*
 * Sign-in is Google-only.
 *
 * The phone + WhatsApp OTP flow was retired; the API now answers /send-otp and
 * /verify-otp with 410. The previous multi-step component is preserved next to
 * this one as LoginModal.otp-backup.jsx.bak so it can be restored if needed.
 *
 * Props are unchanged (onSuccess, onClose, isStandalonePage) so every existing
 * caller keeps working. onSuccess is accepted but unused: Google sign-in leaves
 * via a full-page redirect to the API and returns on a fresh page load, so
 * there is no in-page success moment to fire it on.
 */
const LoginModal = ({ onSuccess, onClose, isStandalonePage = false }) => {

  const rememberReturnPath = () => {
    if (!isStandalonePage) {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
    }
  };

  const benefits = [
    { icon: Lock, title: 'Secure Google Sign-In', desc: 'No passwords, no codes to wait for' },
    { icon: GraduationCap, title: 'Live Cohorts & Certificates', desc: 'Your progress follows your account' },
    { icon: Award, title: 'All Your Courses, One Place', desc: 'Recordings, notes and assessments' },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 overflow-y-auto select-none font-sans"
      style={{ background: '#F7F5FF' }}
    >
      {/* ambient blobs */}
      <div className="absolute top-[-10%] left-[-8%] w-[420px] h-[420px] rounded-full pointer-events-none blur-3xl opacity-30"
        style={{ background: `radial-gradient(circle, ${PURPLE}, transparent 70%)` }} />
      <div className="absolute bottom-[-12%] right-[-6%] w-[460px] h-[460px] rounded-full pointer-events-none blur-3xl opacity-25"
        style={{ background: `radial-gradient(circle, #A78BFA, transparent 70%)` }} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.35]"
        style={{ backgroundImage: 'radial-gradient(#7C3AED 1px, transparent 1px)', backgroundSize: '28px 28px', maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)' }} />

      <div className="relative w-full max-w-4xl bg-white rounded-[28px] shadow-[0_24px_80px_-16px_rgba(124,58,237,0.35)] border border-purple-100 overflow-hidden grid md:grid-cols-2 my-auto">

        {!isStandalonePage && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/80 hover:bg-purple-50 border border-purple-100 text-slate-500 hover:text-slate-900 transition-all shadow-sm active:scale-95 cursor-pointer"
            aria-label="Close Login"
          >
            <X size={18} />
          </button>
        )}

        {/* LEFT: BRAND PANEL */}
        <div
          className="relative hidden md:flex flex-col justify-between p-10 text-white overflow-hidden"
          style={{ background: `linear-gradient(150deg, ${PLUM} 0%, #3B1F4D 55%, ${PURPLE_DARK} 130%)` }}
        >
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ background: PURPLE }} />
          <div className="absolute -bottom-28 -left-20 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ background: '#A78BFA' }} />

          <div className="relative">
            <img src={LOGO_URL} alt="UPSKALE Logo" className="h-11 w-auto object-contain brightness-0 invert mb-10" />

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.14em] mb-5"
              style={{ background: 'rgba(124,58,237,0.22)', border: '1px solid rgba(167,139,250,0.4)', color: '#DDD0FE' }}>
              <Zap size={13} />
              Upskale Learning
            </div>

            <h1 className="text-[34px] leading-[1.15] font-black tracking-tight mb-4">
              Your learning journey<br />
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: `linear-gradient(90deg, #C4B5FD, ${PURPLE})` }}>
                continues here.
              </span>
            </h1>
            <p className="text-slate-300/90 text-sm leading-relaxed max-w-[270px]">
              Sign in to pick up right where you left off — courses, cohorts and certificates.
            </p>
          </div>

          <div className="relative space-y-2.5">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <div key={title}
                className="flex items-center gap-3.5 rounded-2xl px-4 py-3 transition-colors hover:bg-white/[0.06]"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>
                <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `linear-gradient(135deg, ${PURPLE}, ${PURPLE_DARK})` }}>
                  <Icon size={18} className="text-white" />
                </span>
                <span>
                  <span className="block text-[13px] font-bold text-white">{title}</span>
                  <span className="block text-[11px] text-slate-400">{desc}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="relative flex items-center justify-between pt-5"
            style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
              <PlayCircle size={14} style={{ color: '#4ADE80' }} /> 20+ hours of content
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
              <ShieldCheck size={14} style={{ color: '#4ADE80' }} /> 100% Secure
            </span>
          </div>
        </div>

        {/* RIGHT: SIGN-IN */}
        <div className="relative p-7 sm:p-10 flex flex-col justify-center">
          <div className="md:hidden mb-8">
            <img src={LOGO_URL} alt="UPSKALE Logo" className="h-10 w-auto object-contain" />
          </div>

          <div className="max-w-[340px] w-full mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.14em] mb-3"
              style={{ background: 'rgba(124,58,237,0.1)', color: PURPLE }}>
              <Sparkles size={12} />
              Upskale Access
            </div>

            <h2 className="text-[28px] font-black text-slate-900 tracking-tight leading-tight">
              Welcome back
            </h2>
            <p className="text-slate-500 text-sm mt-1.5 mb-7">
              Sign in to access your dashboard, courses and certificates.
            </p>

            <a
              href={`${BASE_URL}/auth/google`}
              onClick={rememberReturnPath}
              className="group w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-purple-300 text-slate-800 font-bold py-4 px-4 rounded-2xl transition-all active:scale-[0.98] text-[15px] cursor-pointer"
              style={{ boxShadow: '0 8px 24px -8px rgba(124,58,237,0.25)' }}
            >
              <GoogleIcon className="w-5 h-5 shrink-0" />
              <span>Continue with Google</span>
              <ArrowRight size={17} className="text-slate-300 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
            </a>

            <div className="flex items-center gap-3 my-6">
              <span className="flex-1 h-px bg-purple-100" />
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">One-tap · No password</span>
              <span className="flex-1 h-px bg-purple-100" />
            </div>

            {/* Anyone who registered by phone will look for the mobile option that
                used to be here. Say where it went, and that their account is intact. */}
            <div className="flex items-start gap-2.5 rounded-2xl p-4"
              style={{ background: 'rgba(22,163,74,0.07)', border: '1px solid rgba(22,163,74,0.2)' }}>
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" style={{ color: GREEN }} />
              <p className="text-[12px] leading-relaxed text-slate-600 font-medium">
                Signed up with a mobile number before? Use the same Google address and
                your courses, certificates and subscription carry over automatically.
              </p>
            </div>

            <p className="text-[11px] text-slate-400 text-center mt-6 leading-relaxed">
              Trouble signing in? Contact support and we will link your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
