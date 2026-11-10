import React from "react";
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Sparkles } from 'lucide-react';

import Navbar from '../components/Navbar';
import TopBanner from '../components/TopBanner';
import MasterclassHighlight from "../components/MasterclassHighlight";
import Footer from '../components/Footer';
import FAQ from '../components/FAQ';
import ContinueWatching from '../components/ContinueWatching';
import { CohortRail, TrendingRail } from '../components/HomeRails';
import DiwaliSky from '../components/DiwaliSky';
import { isFestiveLive } from '../festive';
import { swipesMonths } from '../swipes';
import '../festive.css';

/* Small combo / offer strip — real Swipes Pro pricing, TuteDude-style punchy copy */
const ComboStrip = () => (
  <section className="px-4 md:px-6 py-6">
    <div className="max-w-[1400px] mx-auto rounded-3xl border border-amber-400/20 bg-gradient-to-r from-[#1a1408] via-[#14110a] to-[#1a1408] p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-5 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
      <div className="flex-1 relative">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-400 mb-2">
          Swipes Pro
        </p>
        <h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-snug">
          Learn a new skill every week.
        </h3>
        <p className="text-sm text-gray-400 mt-1.5">
          {swipesMonths() === 18 ? '₹799 for 18 months (6 months free) till 31 Dec' : '₹799 a year'}, then ₹799/year on autopay. Certificates included. Cancel anytime.
        </p>
      </div>
      <Link
        to="/pro"
        className="relative shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-sm px-7 py-3.5 rounded-2xl hover:brightness-110 transition-all active:scale-95 shadow-[0_8px_30px_-6px_rgba(245,158,11,0.6)]"
      >
        <BadgeCheck size={17} />
        Go Pro
        <ArrowRight size={16} />
      </Link>
    </div>
  </section>
);

/* Festive Offer strip — 3-course recorded bundle at ₹199, links to /festive-offer */
const FestiveStrip = () => (
  <section className="px-4 md:px-6 pt-6">
    <div className="max-w-[1400px] mx-auto rounded-3xl border border-yellow-500/30 bg-gradient-to-r from-[#171106] via-[#12100a] to-[#0f1a12] p-5 md:p-7 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-500/10 blur-3xl rounded-full pointer-events-none" />
      <DiwaliSky variant="strip" />
      <div className="flex flex-col md:flex-row md:items-center gap-5 relative">
        <div className="flex items-center gap-4 md:gap-5 flex-1 min-w-0">
          <img
            src="/festive-hero.png"
            alt="Bhai Dooj Offer: Data Analyst Beginner Pack"
            className="w-16 h-[84px] md:w-24 md:h-32 object-cover object-top rounded-2xl border border-yellow-500/30 shrink-0"
          />
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-yellow-400 mb-1.5 flex items-center gap-1.5">
              <Sparkles size={13} /> Bhai Dooj Offer · Limited Time
            </p>
            <h3 className="text-lg md:text-2xl font-black text-white tracking-tight leading-snug">
              Data Analyst Beginner Pack: Excel + AI Tools + Power BI
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              3 recorded courses · Lifetime access · Certificates included
            </p>
            <p className="mt-2 flex items-end gap-2">
              <span className="festive-slam text-2xl md:text-3xl font-black text-white leading-none">₹199</span>
              <span className="festive-strike text-sm text-white/40">₹2,997</span>
              <span className="px-2 py-0.5 bg-[#008a45] text-white text-[10px] font-black rounded-md uppercase tracking-wide">Bhai Dooj Price</span>
            </p>
          </div>
        </div>
        <Link
          to="/festive-offer"
          className="festive-ring relative shrink-0 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-black text-sm px-7 py-3.5 rounded-2xl hover:brightness-110 transition-all active:scale-95"
        >
          Grab the Offer
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  </section>
);

const Home = () => {
  // --- MAIN PAGE CONTENT: dark Netflix-style app, no text hero ---
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-sans selection:bg-red-900 selection:text-white">
      <Navbar />
      <TopBanner />

      <main className="pb-24 md:pb-10">
        {isFestiveLive() && <FestiveStrip />}
        <CohortRail />
        <TrendingRail footer={<ComboStrip />} />

        <section id="masterclass" className="scroll-mt-24">
          <MasterclassHighlight />
        </section>

        <FAQ />
      </main>

      <Footer />
      <ContinueWatching />
    </div>
  );
};

export default Home;
