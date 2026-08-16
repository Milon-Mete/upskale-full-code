import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, User, Lock, Loader2, Sparkles, Mail, 
  Calendar, Users, ChevronLeft, RefreshCcw, X, 
  ShieldCheck, CheckCircle2, ArrowRight, Zap, GraduationCap, LockKeyhole
} from 'lucide-react';
import { BASE_URL } from '../config';

const WhatsAppIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fill="#25D366" d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.764.459 3.487 1.333 5.006L2 22l5.133-1.336c1.464.799 3.111 1.22 4.876 1.221h.005c5.505 0 9.988-4.478 9.989-9.985 0-2.668-1.037-5.176-2.922-7.062A9.923 9.923 0 0 0 12.012 2z"/>
    <path fill="#FFF" d="M17.472 14.382c-.301-.15-1.781-.878-2.056-.978-.275-.1-.475-.15-.675.15-.2.299-.775.977-.95 1.176-.175.2-.35.225-.65.075-.3-.15-1.268-.467-2.416-1.492-.892-.797-1.494-1.782-1.669-2.082-.175-.3-.018-.462.13-.61.135-.133.3-.35.45-.525.15-.175.2-.299.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.582-.493-.503-.675-.512-.175-.008-.375-.01-.575-.01-.2 0-.525.075-.8.375-.275.3-.1.05 1.05 1.05 1.05 1.05 3.75 1.05 4.5.15.1.3.1.625.075.325-.025.15-1.781-.878-2.056-.978z"/>
  </svg>
);

const GoogleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.144 45.789 L -6.734 42.379 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
    </g>
  </svg>
);

const LOGO_URL = "https://res.cloudinary.com/villain/image/upload/v1770662332/20250730_170553_0000_xyfhoc.png";

const LoginModal = ({ onSuccess, onClose, isStandalonePage = false }) => {
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [formData, setFormData] = useState({ 
    phone: '', otp: '', name: '', email: '', age: '', gender: 'Male' 
  });
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');

  const inputRefs = [
    useRef(null), useRef(null), useRef(null), 
    useRef(null), useRef(null), useRef(null)
  ];

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // 🔒 Lock background body scrolling & touch movement when modal is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = originalOverflow || '';
      document.body.style.touchAction = originalTouchAction || '';
    };
  }, []);


  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, phone: val }));
    setError('');
  };

  const handleOtpDigitChange = (index, value) => {
    const cleanValue = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanValue;
    setOtpDigits(newDigits);
    
    const combinedOtp = newDigits.join('');
    setFormData(prev => ({ ...prev, otp: combinedOtp }));
    setError('');

    // Auto-focus next input
    if (cleanValue && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const digits = pastedData.split('');
    const newDigits = ['', '', '', '', '', ''];
    digits.forEach((d, idx) => {
      if (idx < 6) newDigits[idx] = d;
    });

    setOtpDigits(newDigits);
    setFormData(prev => ({ ...prev, otp: newDigits.join('') }));
    setError('');

    const focusIndex = Math.min(digits.length, 5);
    inputRefs[focusIndex].current?.focus();
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault(); 
    if (!formData.phone || formData.phone.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true); 
    setError('');

    const formattedPhone = formData.phone.startsWith('+') 
      ? formData.phone 
      : `+91${formData.phone}`;

    try {
      const response = await fetch(`${BASE_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', 
        body: JSON.stringify({ phone: formattedPhone }),
      });

      if (response.ok) {
        setStep(2);
        setResendTimer(120);
        setTimeout(() => inputRefs[0].current?.focus(), 150);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to send OTP via WhatsApp");
      }
    } catch (err) {
      console.error("OTP send error:", err);
      setError("Network error: Unable to connect to authentication server.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault(); 
    if (formData.otp.length < 6) {
      setError("Please enter complete 6-digit WhatsApp OTP");
      return;
    }

    setLoading(true); 
    setError('');

    const formattedPhone = formData.phone.startsWith('+') 
      ? formData.phone 
      : `+91${formData.phone}`;

    try {
      const response = await fetch(`${BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', 
        body: JSON.stringify({ phone: formattedPhone, otp: formData.otp }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.isNewUser) {
          setStep(3); 
        } else {
          if (data.token) localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user)); 
          window.dispatchEvent(new Event("storage"));
          if (onSuccess) onSuccess(data.user, data.token);
        }
      } else {
        setError(data.message || "Invalid WhatsApp OTP. Please try again.");
      }
    } catch (err) {
      console.error("Verify Error:", err);
      setError("Network error: Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault(); 
    setLoading(true); 
    setError('');

    const referId = localStorage.getItem('refer');
    const formattedPhone = formData.phone.startsWith('+') 
      ? formData.phone 
      : `+91${formData.phone}`;

    const payload = { 
      ...formData, 
      phone: formattedPhone,
      referredBy: referId || null 
    };

    try {
      const response = await fetch(`${BASE_URL}/complete-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', 
        body: JSON.stringify(payload), 
      });

      const data = await response.json();
      if (response.ok) {
        if (data.token) localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (referId) localStorage.removeItem('refer');
        window.dispatchEvent(new Event("storage"));
        if (onSuccess) onSuccess(data.user, data.token);
      } else {
        setError(data.message || "Failed to save profile details.");
      }
    } catch (err) {
      console.error("Register Error:", err);
      setError("Network error: Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
      className={`fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-950/80 backdrop-blur-xl ${isStandalonePage ? 'p-0 md:p-6 lg:p-10' : 'p-0 sm:p-4 md:p-6 lg:p-10'} overflow-y-auto select-none animate-in fade-in duration-300 font-sans overscroll-contain touch-none`}
    >
      
      {/* AMBIENT GLOW SPOTS */}
      <div className="hidden md:block absolute top-[-10%] left-[-10%] w-[550px] h-[550px] bg-emerald-500/15 blur-[160px] rounded-full pointer-events-none" />
      <div className="hidden md:block absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] bg-teal-500/15 blur-[160px] rounded-full pointer-events-none" />

      {/* MAIN CONTAINER (LUXURY BOTTOM SHEET ON MOBILE, SPLIT STUDIO ON DESKTOP) */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg md:max-w-5xl bg-white border-t sm:border border-slate-200/90 rounded-t-[32px] sm:rounded-3xl shadow-[0_-15px_40px_rgba(0,0,0,0.35)] sm:shadow-2xl relative overflow-hidden flex flex-col md:grid md:grid-cols-12 max-h-[94dvh] md:max-h-[88vh] touch-auto overscroll-contain"
      >

        
        {/* MOBILE TOP DRAG ACCENT PILL */}
        <div className="flex md:hidden justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-slate-300/80" />
        </div>

        {/* CLOSE BUTTON - REFINED FLOATING CIRCLE */}
        {onClose && (
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }} 
            className="absolute top-4 right-4 sm:top-5 sm:right-5 z-[80] p-2.5 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200/90 shadow-sm transition-all active:scale-90 cursor-pointer flex items-center justify-center"
            aria-label="Close Login Modal"
            title="Close (Esc)"
          >
            <X size={18} className="stroke-[2.5]" />
          </button>
        )}

        {/* LEFT COLUMN: BRAND HERO (DESKTOP ONLY - ULTRA PREMIUM DARK STUDIO) */}
        <div className="hidden md:flex md:col-span-5 lg:col-span-5 bg-gradient-to-br from-[#0c0e17] via-[#090b13] to-[#040508] p-8 lg:p-10 pt-10 flex-col justify-between relative overflow-hidden text-white border-r border-white/5">
          
          {/* Ambient Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#25D366_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.05] pointer-events-none" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Brand Header */}
          <div className="relative z-10">
            <div className="mb-8 pt-2">
              <img 
                src={LOGO_URL} 
                alt="UPSKALE Logo" 
                className="h-16 lg:h-20 w-auto object-contain brightness-0 invert drop-shadow-[0_0_20px_rgba(255,255,255,0.35)] transition-transform hover:scale-105 duration-300"
              />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Zap size={14} className="text-emerald-400" />
              <span>UPSKALE LEARNING</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-black leading-tight tracking-tight mb-3">
              Accelerate Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Tech & Career Goals.
              </span>
            </h1>

            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-xs">
              Join 50,000+ professionals mastering cohorts, live projects, and earning industry certificates.
            </p>
          </div>

          {/* Feature List */}
          <div className="space-y-3 relative z-10 my-auto py-6">
            <div className="bg-white/[0.03] border border-white/10 p-3.5 rounded-2xl flex items-center gap-3.5 hover:border-emerald-500/30 transition-all">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <WhatsAppIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Instant WhatsApp Verification</h4>
                <p className="text-[11px] text-gray-400">Single-use instant security code</p>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 p-3.5 rounded-2xl flex items-center gap-3.5 hover:border-white/20 transition-all">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <GraduationCap size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Live Cohorts & Certificates</h4>
                <p className="text-[11px] text-gray-400">Learn from Google & Meta leaders</p>
              </div>
            </div>
          </div>

          {/* Social Proof Footer */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400 font-medium">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold"><CheckCircle2 size={14}/> 50,000+ Active Students</span>
            <span className="flex items-center gap-1 text-gray-400"><ShieldCheck size={14}/> 100% Secure</span>
          </div>
        </div>

        {/* RIGHT COLUMN: AUTHENTICATION FORM (NEXT-LEVEL MOBILE OPTIMIZATION) */}
        <div className="md:col-span-7 lg:col-span-7 bg-white px-5 sm:px-8 lg:px-10 pt-2 pb-6 sm:py-8 flex flex-col justify-between relative overflow-y-auto min-h-0 flex-1">
          
          {/* TOP HEADER SECTION (COMFORTABLY POSITIONED DOWN WITH PROMINENT LOGO & STEP) */}
          <div className="mb-4 sm:mb-6 pt-1">
            
            {/* Top Bar Header */}
            <div className="flex items-center justify-between gap-4 mb-3 pr-12 sm:pr-14">
              
              {/* Official UPSKALE Logo */}
              <div className="flex items-center">
                <img 
                  src={LOGO_URL} 
                  alt="UPSKALE Logo" 
                  className="h-12 sm:h-14 w-auto object-contain drop-shadow-xs transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* Stepper Progress Pill */}
              <div className="flex items-center gap-2 bg-emerald-50/90 px-3.5 py-1.5 rounded-full border border-emerald-200/80 shadow-xs">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3].map((stepNum) => (
                    <div 
                      key={stepNum} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        step === stepNum 
                          ? 'w-4 bg-emerald-600' 
                          : step > stepNum 
                          ? 'w-2 bg-emerald-400/60' 
                          : 'w-1.5 bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-emerald-900 font-mono font-bold uppercase tracking-wider">
                  Step {step}/3
                </span>
              </div>
            </div>
          </div>

          {/* AUTH FORM CONTAINER */}
          <form 
            onSubmit={step === 1 ? handleSendOtp : step === 2 ? handleVerifyOtp : handleRegister} 
            className="space-y-4 my-auto"
          >

            {/* ================= STEP 1: PHONE & GOOGLE ================= */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                
                {/* Heading */}
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-0.5">
                    <Sparkles size={12} className="text-emerald-600" />
                    <span>Instant Login</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Welcome Back 👋
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm font-medium">
                    Sign in to access your dashboard, courses, and cohort access.
                  </p>
                </div>

                {/* Google Sign-In Button */}
                <a
                  href={`${BASE_URL}/auth/google`}
                  onClick={() => {
                    if (!isStandalonePage) {
                      sessionStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
                    }
                  }}
                  className="w-full h-13 sm:h-14 flex items-center justify-center gap-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-800 font-bold px-4 rounded-2xl transition-all active:scale-[0.98] shadow-xs hover:shadow-sm cursor-pointer text-sm"
                >
                  <GoogleIcon className="w-5 h-5 shrink-0" />
                  <span>Continue with Google</span>
                </a>

                {/* Styled Divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-slate-200/80" />
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">OR MOBILE NUMBER</span>
                  <div className="flex-1 h-px bg-slate-200/80" />
                </div>

                {/* Phone Input Box */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    WhatsApp Number
                  </label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-3.5 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono text-xs font-bold shadow-xs pointer-events-none">
                      <span className="text-base leading-none">🇮🇳</span>
                      <span>+91</span>
                    </div>

                    <input 
                      type="tel" 
                      name="phone" 
                      required 
                      maxLength={10}
                      placeholder="98765 43210" 
                      value={formData.phone} 
                      onChange={handlePhoneChange}
                      className="w-full h-13 sm:h-14 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 rounded-2xl pl-26 pr-4 text-slate-900 font-mono text-base font-bold outline-none transition-all placeholder:text-slate-400 shadow-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 2: OTP VERIFICATION ================= */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Enter Code</span> 
                    <span className="text-emerald-600">🔒</span>
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm font-medium">
                    We sent a 6-digit WhatsApp OTP to <span className="font-mono font-bold text-slate-800">+91 {formData.phone}</span>
                  </p>
                </div>

                {/* WhatsApp Info Banner */}
                <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center gap-3 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-xs shrink-0">
                    <WhatsAppIcon className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-emerald-900 font-medium">
                    Check your WhatsApp for the 6-digit security code.
                  </p>
                </div>

                {/* OTP Digit Boxes */}
                <div className="grid grid-cols-6 gap-2 sm:gap-2.5 py-1">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={inputRefs[idx]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className="w-full h-13 sm:h-14 bg-slate-50/90 border border-slate-200/90 rounded-2xl text-center font-mono font-black text-2xl text-emerald-700 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/15 outline-none transition-all shadow-xs"
                    />
                  ))}
                </div>

                {/* Timer / Resend Action */}
                <div className="flex justify-between items-center text-xs px-1">
                  <span className="text-slate-400 font-medium">Valid for 5 minutes</span>
                  {resendTimer > 0 ? (
                    <span className="text-slate-500 font-mono font-bold bg-slate-100 px-2.5 py-1 rounded-lg">
                      Resend in {formatTime(resendTimer)}
                    </span>
                  ) : (
                    <button 
                      type="button" 
                      onClick={() => handleSendOtp(null)}
                      disabled={loading}
                      className="text-emerald-700 font-bold hover:underline flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                      <span>Resend WhatsApp Code</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ================= STEP 3: PROFILE COMPLETION ================= */}
            {step === 3 && (
              <div className="space-y-3.5 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Personalize Profile</span>
                    <span>✨</span>
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm font-medium">
                    A few quick details to prepare your certificates and learning path.
                  </p>
                </div>

                {/* Full Name */}
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    placeholder="Full Name"
                    value={formData.name} 
                    onChange={(e) => { setFormData({...formData, name: e.target.value}); setError(''); }}
                    className="w-full h-13 bg-slate-50/80 focus:bg-white border border-slate-200 rounded-2xl pl-11 pr-4 text-slate-900 text-sm font-medium focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 outline-none transition-all shadow-xs"
                  />
                </div>

                {/* Email Address */}
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    placeholder="Email Address"
                    value={formData.email} 
                    onChange={(e) => { setFormData({...formData, email: e.target.value}); setError(''); }}
                    className="w-full h-13 bg-slate-50/80 focus:bg-white border border-slate-200 rounded-2xl pl-11 pr-4 text-slate-900 text-sm font-medium focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 outline-none transition-all shadow-xs"
                  />
                </div>

                {/* Age & Gender Row */}
                <div className="flex gap-3">
                  <div className="relative group w-1/2">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                    <input 
                      type="number" 
                      name="age" 
                      required 
                      placeholder="Age"
                      value={formData.age} 
                      onChange={(e) => { setFormData({...formData, age: e.target.value}); setError(''); }}
                      className="w-full h-13 bg-slate-50/80 focus:bg-white border border-slate-200 rounded-2xl pl-11 pr-3 text-slate-900 text-sm font-medium focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 outline-none transition-all shadow-xs"
                    />
                  </div>

                  <div className="relative group w-1/2">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                    <select 
                      name="gender" 
                      value={formData.gender} 
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full h-13 bg-slate-50/80 focus:bg-white border border-slate-200 rounded-2xl pl-11 pr-3 text-slate-900 text-sm font-medium focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 outline-none appearance-none shadow-xs cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ERROR DISPLAY */}
            {error && (
              <p className="text-red-600 text-xs font-bold text-center bg-red-50 border border-red-200 py-2.5 px-3 rounded-2xl animate-shake">
                {error}
              </p>
            )}

            {/* PRIMARY ACTION SUBMIT BUTTON */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-13 sm:h-14 bg-gradient-to-r from-[#008a45] via-[#00a854] to-[#007038] hover:brightness-105 text-white font-black px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_8px_25px_rgba(0,138,69,0.3)] active:scale-[0.98] disabled:opacity-50 text-base cursor-pointer tracking-wide"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <span className="flex items-center gap-2 font-sans font-bold">
                  {step === 1 ? (
                    <span>Get WhatsApp OTP</span>
                  ) : step === 2 ? (
                    <>
                      <span>Verify & Continue</span>
                      <ArrowRight size={18} />
                    </>
                  ) : (
                    <>
                      <span>Complete & Enter</span>
                      <CheckCircle2 size={18} />
                    </>
                  )}
                </span>
              )}
            </button>

            {/* WHATSAPP SECURE BADGE FOR STEP 1 */}
            {step === 1 && (
              <div className="flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/60 text-emerald-800 text-xs font-medium shadow-xs">
                <WhatsAppIcon className="w-4 h-4 shrink-0" />
                <span>Instant verification OTP via <strong className="font-bold text-emerald-950">WhatsApp</strong></span>
              </div>
            )}

            {/* GO BACK STEP BUTTON */}
            {step > 1 && (
              <button 
                type="button" 
                onClick={() => { setStep(step - 1); setError(''); }} 
                className="w-full flex items-center justify-center gap-1.5 text-slate-500 text-xs font-bold hover:text-slate-800 py-1 transition-colors cursor-pointer active:scale-95"
              >
                <ChevronLeft size={16} /> Edit Phone Number
              </button>
            )}
          </form>

          {/* MOBILE TRUST PILLS & FOOTER */}
          <div className="pt-3.5 border-t border-slate-100 mt-3">
            <div className="grid grid-cols-3 gap-1.5 text-[11px] text-slate-600 font-semibold text-center">
              <div className="flex items-center justify-center gap-1 bg-slate-50 py-1.5 px-2 rounded-xl border border-slate-100">
                <ShieldCheck size={14} className="text-emerald-600 shrink-0"/> 
                <span className="truncate">256-bit SSL</span>
              </div>
              <div className="flex items-center justify-center gap-1 bg-slate-50 py-1.5 px-2 rounded-xl border border-slate-100">
                <Zap size={14} className="text-amber-500 shrink-0"/> 
                <span className="truncate">Instant OTP</span>
              </div>
              <div className="flex items-center justify-center gap-1 bg-slate-50 py-1.5 px-2 rounded-xl border border-slate-100">
                <GraduationCap size={14} className="text-purple-600 shrink-0"/> 
                <span className="truncate">50K+ Active</span>
              </div>
            </div>
            <div className="text-center text-[10px] text-slate-400 mt-2 font-medium">
              By continuing, you agree to UPSKALE's Terms & Privacy Policy.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginModal;