import React, { useRef, useState, useEffect } from "react";
import { Link } from 'react-router-dom';

import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import CourseCard from '../components/CourseCard';
import SarkariSection from '../components/SarkariSection';
import HiringPartners from '../components/HiringPartners';
import CourseSection from '../components/CourseSection';
import Testimonials from "../components/Testimonials";
import TopBanner from '../components/TopBanner';
import FinalCTA from "../components/FinalCTA";
import MasterclassHighlight from "../components/MasterclassHighlight";
import Footer from '../components/Footer';
import FAQ from '../components/FAQ';
import Certificate from "../components/Certifficate";
import CourseSectionm from "../components/CourseSection1";
import MobileBottomNav from '../components/MobileBottomNav';
import ContinueWatching from '../components/ContinueWatching';
import PremiumGallery from "../components/PremiumGallery";
import StudentBrands from "../components/StudentBrands";

const Home = () => {
  const courseSectionRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); 

    return () => clearTimeout(timer);
  }, []);

  const scrollToCourses = () => {
    courseSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
        <style>
          {`
            .logo-container {
              position: relative;
              width: 180px; /* Base mobile width */
              height: auto;
              /* Smooth breathing animation to replace the jumping letters */
              animation: breathe 2s infinite ease-in-out alternate;
            }

            /* --- DESKTOP SCALE --- */
            @media (min-width: 768px) {
              .logo-container {
                width: 280px; /* Bigger on desktop */
              }
            }

            @keyframes breathe {
              0% { transform: scale(1); }
              100% { transform: scale(1.05); }
            }

            /* The Scanning Laser Mask */
            .logo-sweep {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              object-fit: contain;
              /* This creates the sweeping laser line */
              -webkit-mask-image: linear-gradient(
                -60deg,
                transparent 30%,
                #000 50%,
                transparent 70%
              );
              -webkit-mask-size: 300% 100%;
              animation: sweep-laser 2s infinite ease-in-out;
              /* Adds the glowing aura around the active part */
              filter: drop-shadow(0 0 15px rgba(0, 138, 69, 0.8)); 
            }

            @keyframes sweep-laser {
              0% {
                -webkit-mask-position: 150% 0;
              }
              100% {
                -webkit-mask-position: -50% 0;
              }
            }
          `}
        </style>

        <div className="logo-container">
          {/* 1. Base Logo (Dimmed, Inactive Background) */}
          <img 
            src="https://res.cloudinary.com/dvcs9x8yp/image/upload/v1775412223/20250730_170449_0000_uq4d24.png" 
            alt="Loading..." 
            className="w-full h-auto opacity-20 grayscale blur-[1px]"
          />
          
          {/* 2. Sweeping Highlight Logo (Full Color + Mask + Glow) */}
          <img 
            src="https://res.cloudinary.com/dvcs9x8yp/image/upload/v1775412223/20250730_170449_0000_uq4d24.png" 
            alt="Loading Sweep" 
            className="logo-sweep"
          />
        </div>
      </div>
    );
}

  // --- MAIN PAGE CONTENT ---
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-red-100 selection:text-red-900">
      <Navbar />
      <TopBanner />
      <Hero onDiscoverClick={scrollToCourses} />

      <section
        id="cohortcourse"
        ref={courseSectionRef}
        className="scroll-mt-24 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-4">
            3 Month Live Training Cohort
          </h2>
          <p className="max-w-2xl mx-auto text-xl text-gray-500 font-medium">
            Industry relevant courses designed by experts to launch your tech career.
          </p>
        </div>
        <CourseSectionm/>
      </section>

      <section id="bitesize" className="scroll-mt-24">
        <SarkariSection />
      </section>
      
      <section id="masterclass" className="scroll-mt-24">
        <MasterclassHighlight />
      </section>
      <section id="portfolio" className="scroll-mt-24">
        <PremiumGallery />
      </section>
      <StudentBrands/>
      <HiringPartners />
      <Testimonials />
      <FinalCTA />
      <FAQ />
      <Footer />
      <ContinueWatching />
      <MobileBottomNav />
    </div>
  );
};

export default Home;