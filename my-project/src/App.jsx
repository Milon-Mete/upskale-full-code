import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LanguageSwitcher from './components/LanguageSwitcher';
import GlobalLoginModal from './components/GlobalLoginModal';
import { useAuth } from './context/AuthContext';
import './index.css';

// --- PAGES ---
import Home from './pages/Home';
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
import StudentCertificateView from './pages/StudentCertificateView';

import BiteSizeCoursePage from './pages/Bbitsize/BiteSizeCoursePage';
import ChapterModuleBuilder from './components/ChapterModuleBuilder';
import ErrorBoundary from './components/ErrorBoundary';
import PlanSelectionPage from './pages/PlanSelectionPage';
import BiteSizeCheckout from './pages/BiteSizeCheckout';
import ModernCertificateView from './components/ModernCertificateView'; 

import MyLibraryPage from './pages/MyLibraryPage';
import RecordedCourseLandingPage from './pages/RecordedCourseLandingPage';
import StudentControlCenter from './pages/StudentControlCenter';
import MobileBottomNav from './components/MobileBottomNav';

// ==========================================
// 🔴 GLOBAL SESSION MANAGER (INTERCEPTOR)
// ==========================================
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn("Session expired or unauthorized. Triggering login modal.");
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent('trigger-login-modal', {
        detail: { message: "Session expired. Please log in to continue." }
      }));
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

// --- HELPER: /login direct URL fallback (opens modal without page route) ---
const LoginRouteHandler = () => {
  const { openLoginModal } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    openLoginModal();
    navigate('/', { replace: true });
  }, [openLoginModal, navigate]);

  return null;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <LanguageSwitcher />
      <GlobalLoginModal />
      <Routes>
        {/* Main Website */}
        <Route path="/" element={<Home />} />
        
        {/* Direct /login URL fallback */}
        <Route path="/login" element={<LoginRouteHandler />} />
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