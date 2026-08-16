import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import axios from 'axios'; // 🔴 1. ADD THIS IMPORT
import LanguageSwitcher from './components/LanguageSwitcher';
import './index.css'

// --- CONTEXT ---
// --- PAGES ---
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import Dashboard from './pages/Dashboard';
import PremiumPage from './pages/PremiumPage';

// Course Pages
import PowerBICoursePage from './pages/PowerBICoursePage';
import ExcelCoursePage from './pages/ExcelCoursePage';
import GenAICoursePage from './pages/GenAICoursePage';
import DynamicCoursePage from './pages/DynamicCoursePage';
import ExcelPlaylistPage from './pages/ExcelPlaylistPage';

// Cart & Checkout
import CartPage from './pages/CartPage';
import MasterclassCartPage from './pages/MasterclassCartPage';
import RecartPage from './pages/Recordedcartpage';

// Masterclass & Certificates
import MasterclassLanding from './pages/masterclass/MasterclassLanding';
import EcommerceTshirtCourse from './pages/EcommerceTshirtCourse';
import StudentCertificateView from './pages/StudentCertificateView';

import BiteSizeCoursePage from './pages/Bbitsize/BiteSizeCoursePage'
import ChapterModuleBuilder from './components/ChapterModuleBuilder'
import ErrorBoundary from './components/ErrorBoundary'
import PlanSelectionPage from './pages/PlanSelectionPage';
import BiteSizeCheckout from './pages/BiteSizeCheckout'
import ModernCertificateView from './components/ModernCertificateView'; 

import MyLibraryPage from './pages/MyLibraryPage';
import RecordedCourseLandingPage from './pages/RecordedCourseLandingPage';

import StudentControlCenter from './pages/StudentControlCenter';

// ==========================================
// 🔴 2. GLOBAL SESSION MANAGER
// ==========================================
axios.interceptors.response.use(
  (response) => response, // Let successful responses pass
  (error) => {
    // Catch dead tokens or unauthorized access platform-wide
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn("Session expired or unauthorized. Purging local state.");
      localStorage.removeItem('user');
      window.dispatchEvent(new Event("storage"));
      
      const currentPath = window.location.pathname;
      const isProtectedRoute = currentPath.startsWith('/profile') || currentPath.startsWith('/dashboard') || currentPath.startsWith('/student-control-center');
      
      if (isProtectedRoute && currentPath !== '/login') {
        window.location.href = '/login'; 
      }
    }
    return Promise.reject(error);
  }
);

// --- HELPER: Scroll To Top ---
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

import MobileBottomNav from './components/MobileBottomNav';

function App() {
  return (
      <Router>
        <ScrollToTop />
        <LanguageSwitcher />
        <Routes>
          {/* Main Website */}
          <Route path="/" element={<Home />} />
          
          {/* Auth & User */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/premium" element={<PremiumPage />} />

          {/* Cart System */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/masterclasscart" element={<MasterclassCartPage />} />
          <Route path="/recart" element={<RecartPage />} />

          {/* Hardcoded Course Pages */}
          <Route path="/power-bi-data-visualization" element={<PowerBICoursePage />} />
          <Route path="/excel-mastery-with-ai-tools" element={<ExcelCoursePage />} />
          <Route path="/generative-ai-toolset-mastery" element={<GenAICoursePage />} />
          
          {/* Dynamic Routes */}
          <Route path="/course/:slug" element={<DynamicCoursePage />} />
          <Route path="/recorded-course/:slug" element={<RecordedCourseLandingPage />} />
          <Route path="/learn/:cohortId" element={<ExcelPlaylistPage />} />
          <Route path="/pro" element={<PlanSelectionPage />} />
          <Route path="/bitesize/:slug" element={<ErrorBoundary><BiteSizeCoursePage /></ErrorBoundary>} />
          <Route path="/bitesize/checkout/:slug" element={<BiteSizeCheckout />} />
          <Route path="/admin/bitesize/:courseId/chapters" element={<ChapterModuleBuilder />} />
          <Route path="/bitesize-certificate/:id" element={<ModernCertificateView />} />
          
          {/* Masterclass & Certificate */}
          <Route path="/masterclass/:slug" element={<MasterclassLanding />} />
          <Route path="/ecommerce-tshirt-business" element={<EcommerceTshirtCourse />} />
          <Route path="/view-certificate/:id" element={<StudentCertificateView />} />
          <Route path="/library" element={<MyLibraryPage />} />

          <Route path="/god" element={<StudentControlCenter />} />
          
          {/* 404 Fallback */}
          <Route path="*" element={<Home />} />
        </Routes>
        <MobileBottomNav />
      </Router>
  );
}

export default App;