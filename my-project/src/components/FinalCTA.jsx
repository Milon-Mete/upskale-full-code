import React from 'react';
import { ArrowRight, CheckCircle2, Zap, Sparkles, Languages, Award, Briefcase, MonitorPlay } from 'lucide-react';

const FinalCTA = () => {
  
  // Defined data array for cleaner mapping with specific icons
  const features = [
    { 
      icon: MonitorPlay,
      title: "Live Interactive Learning", 
      desc: "Learn directly from mentors with real-time doubt solving and live projects." 
    },
    { 
      icon: Languages, // New Icon
      title: "Learn in Your Language", 
      desc: "Complex topics explained simply in Bengali & Hindi to remove language barriers." 
    },
    { 
      icon: Award,
      title: "Smart Certification", 
      desc: "Attendance, progress, and test scores are tracked automatically for certification." 
    },
    { 
      icon: Briefcase,
      title: "Job Ready Programs", 
      desc: "Cohort-based training specifically designed to make you placement ready." 
    }
  ];

  return (
    <section className="relative py-24 px-6 bg-[#050505] overflow-hidden border-t border-white/5">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#008a45]/20 blur-[120px] rounded-full pointer-events-none opacity-60" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto text-center relative z-10">
        
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#008a45]/10 border border-[#008a45]/20 text-[#008a45] text-xs font-bold uppercase tracking-widest mb-8 animate-in slide-in-from-bottom-4 fade-in duration-700">
          <Zap size={12} className="fill-current" />
          Fast-Track Your Career
        </div>

        {/* Main Heading */}
        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
          Start Learning Today. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#008a45] to-emerald-400">
            Get Certified.
          </span>
        </h2>

        {/* Subtext */}
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Join live cohorts, attend masterclasses, and earn automated certificates. 
          Your journey from beginner to <span className="text-white font-semibold">job-ready professional</span> starts here.
        </p>

        {/* Feature Grid - Updated for 4 Columns */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 text-left mb-14">
          {features.map((item, i) => (
            <div 
              key={i} 
              className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#008a45]/50 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.07] flex flex-col h-full"
            >
              <div className="w-10 h-10 bg-[#008a45]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#008a45] transition-colors duration-300 shrink-0">
                {/* Dynamic Icon Rendering */}
                <item.icon size={20} className="text-[#008a45] group-hover:text-white transition-colors" />
              </div>
              <h4 className="font-bold text-white mb-2 text-lg leading-tight">{item.title}</h4>
              <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Buttons Section */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {/* Primary Button */}
          <a
            href="/programs"
            className="group relative px-8 py-4 bg-[#008a45] hover:bg-[#007a3d] text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(0,138,69,0.3)] hover:shadow-[0_0_40px_rgba(0,138,69,0.5)] active:scale-95 flex items-center justify-center gap-2 overflow-hidden"
          >
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-[shine_1s_infinite]" />
             Explore Programs <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>

          {/* Secondary Button */}
          <a
            href="/masterclass"
            className="px-8 py-4 bg-transparent border border-white/10 text-white rounded-xl font-bold text-lg hover:bg-white/5 hover:border-white/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Sparkles size={18} className="text-[#008a45]" />
            Limited Masterclass
          </a>
        </div>

        {/* Trust Indicator */}
        <p className="text-sm text-gray-500 mt-10 flex items-center justify-center gap-2 opacity-80 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008a45] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#008a45]"></span>
          </span>
          500+ students enrolling this week
        </p>
      </div>
    </section>
  );
};

export default FinalCTA;