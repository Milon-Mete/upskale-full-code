import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import axios from 'axios'; // 🔴 1. ADD THIS IMPORT
import LanguageSwitcher from './components/LanguageSwitcher';
import './index.css'

// --- CONTEXT ---
// --- PAGES ---
import Home from './pages/Home';
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PremiumPage = lazy(() => import('./pages/PremiumPage'));

// Course Pages
const PowerBICoursePage = lazy(() => import('./pages/PowerBICoursePage'));
const ExcelCoursePage = lazy(() => import('./pages/ExcelCoursePage'));
const GenAICoursePage = lazy(() => import('./pages/GenAICoursePage'));
const DynamicCoursePage = lazy(() => import('./pages/DynamicCoursePage'));
const ExcelPlaylistPage = lazy(() => import('./pages/ExcelPlaylistPage'));

// Cart & Checkout
const CartPage = lazy(() => import('./pages/CartPage'));
const MasterclassCartPage = lazy(() => import('./pages/MasterclassCartPage'));
const RecartPage = lazy(() => import('./pages/Recordedcartpage'));

// Masterclass & Certificates
const MasterclassLanding = lazy(() => import('./pages/masterclass/MasterclassLanding'));
const EcommerceTshirtCourse = lazy(() => import('./pages/EcommerceTshirtCourse'));
const StudentCertificateView = lazy(() => import('./pages/StudentCertificateView'));

const BiteSizeCoursePage = lazy(() => import('./pages/Bbitsize/BiteSizeCoursePage'));
const ChapterModuleBuilder = lazy(() => import('./components/ChapterModuleBuilder'));
import ErrorBoundary from './components/ErrorBoundary'
const PlanSelectionPage = lazy(() => import('./pages/PlanSelectionPage'));
const BiteSizeCheckout = lazy(() => import('./pages/BiteSizeCheckout'));
const ModernCertificateView = lazy(() => import('./components/ModernCertificateView'));

const MyLibraryPage = lazy(() => import('./pages/MyLibraryPage'));
const RecordedCourseLandingPage = lazy(() => import('./pages/RecordedCourseLandingPage'));
const FestiveOfferPage = lazy(() => import('./pages/FestiveOfferPage'));

const StudentControlCenter = lazy(() => import('./pages/StudentControlCenter'));

// ==========================================
// 🔴 2. GLOBAL SESSION MANAGER
// ==========================================
// Attach the JWT as a Bearer <redacted> on every axios request. The cookie is
// cross-site (upskale.co → api.upskale.co) and browsers that block
// third-party cookies drop it — without this, checkout create-order calls
// 401 and payments never reach the backend.
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
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

// Shown for the moment a page's code is downloading.
const RouteLoader = () => (
  <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
    <div className="w-9 h-9 rounded-full border-2 border-white/15 border-t-[#008a45] animate-spin" />
  </div>
);

function App() {
  return (
      <Router>
        <ScrollToTop />
        <LanguageSwitcher />
        <Suspense fallback={<RouteLoader />}>
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
          <Route path="/festive-offer" element={<FestiveOfferPage />} />
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
        </Suspense>
        <MobileBottomNav />
      </Router>
  );
}

export default App;