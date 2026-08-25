import React from 'react';
import { X, Zap, GraduationCap, ShieldCheck, CheckCircle2, Sparkles, Lock } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-xl p-0 md:p-6 lg:p-10 overflow-hidden select-none animate-in fade-in duration-300 font-sans">

      <div className="hidden md:block absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="hidden md:block absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/15 blur-[140px] rounded-full pointer-events-none" />

      <div className="w-full h-full md:h-auto max-w-5xl max-h-[100dvh] md:max-h-[88vh] bg-white border-0 md:border md:border-slate-200/90 rounded-none md:rounded-3xl shadow-2xl relative overflow-hidden flex flex-col md:grid md:grid-cols-12 font-sans">

        {!isStandalonePage && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-slate-100/80 hover:bg-slate-200 border border-slate-200/80 text-slate-600 hover:text-slate-900 transition-all shadow-xs active:scale-95 cursor-pointer"
            aria-label="Close Login"
          >
            <X size={18} />
          </button>
        )}

        {/* LEFT: BRAND PANEL (desktop only) */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-[#0c0e17] via-[#090b13] to-[#040508] p-8 lg:p-10 flex-col justify-between relative overflow-hidden text-white border-r border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(#25D366_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.05] pointer-events-none" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="mb-8">
              <img
                src={LOGO_URL}
                alt="UPSKALE Logo"
                className="h-12 w-auto object-contain brightness-0 invert drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]"
              />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Zap size={14} className="text-emerald-400" />
              <span>UPSKALE LEARNING</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-black leading-tight tracking-tight mb-3 font-sans">
              Accelerate Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Tech &amp; Career Goals.
              </span>
            </h1>

            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-xs font-sans">
              Sign in with Google to reach your dashboard, cohorts and certificates.
            </p>
          </div>

          <div className="space-y-3 relative z-10 my-auto py-6 font-sans">
            <div className="bg-white/[0.03] border border-white/10 p-3.5 rounded-2xl flex items-center gap-3.5 hover:border-emerald-500/30 transition-all">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Lock size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Secure Google Sign-In</h4>
                <p className="text-[11px] text-gray-400">No passwords, no codes to wait for</p>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 p-3.5 rounded-2xl flex items-center gap-3.5 hover:border-white/20 transition-all">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <GraduationCap size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Live Cohorts &amp; Certificates</h4>
                <p className="text-[11px] text-gray-400">Your progress follows your account</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-end text-xs text-gray-400 font-medium font-sans">
            <span className="flex items-center gap-1 text-gray-400"><ShieldCheck size={14} /> 100% Secure</span>
          </div>
        </div>

        {/* RIGHT: SIGN-IN */}
        <div className="md:col-span-7 bg-white p-5 sm:p-8 lg:p-10 flex flex-col justify-center relative overflow-y-auto h-full md:h-auto min-h-0 flex-1 font-sans">

          <div className="md:hidden flex items-center justify-between gap-3 mb-8">
            <img src={LOGO_URL} alt="UPSKALE Logo" className="h-10 w-auto object-contain" />
          </div>

          <div className="max-w-sm w-full mx-auto">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100/60 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles size={12} className="text-emerald-600" />
              <span>UPSKALE Access</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
              Welcome
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 mb-6 font-medium font-sans">
              Sign in to access your learning dashboard and live cohorts.
            </p>

            <a
              href={`${BASE_URL}/auth/google`}
              onClick={rememberReturnPath}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50/90 border border-slate-200/90 hover:border-slate-300 text-slate-800 font-bold py-3.5 px-4 rounded-xl transition-all active:scale-[0.99] shadow-xs hover:shadow-sm cursor-pointer text-sm"
            >
              <GoogleIcon className="w-4 h-4 shrink-0" />
              <span className="font-sans">Continue with Google</span>
            </a>

            {/* Anyone who registered by phone will look for the mobile option that
                used to be here. Say where it went, and that their account is intact. */}
            <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-slate-50 border border-slate-200/80 p-3.5">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-[12px] leading-relaxed text-slate-600 font-medium">
                Signed up with a mobile number before? Use the same Google address and
                your courses, certificates and subscription carry over automatically.
              </p>
            </div>

            <p className="text-[11px] text-slate-400 text-center mt-5 leading-relaxed">
              Trouble signing in? Contact support and we will link your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
