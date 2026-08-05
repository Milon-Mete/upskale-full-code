import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { LayoutDashboard, Star, ShieldAlert, Loader2, Tag, Users, Award, FilePlus, Menu, Video, X, FolderSearch, BookOpen, MonitorPlay, MessageCircle, Settings, Sparkles } from 'lucide-react';

// --- Components ---
import Navbar from '../components/Navbar';
import CohortManager from '../components/cohotManager';
import MasterclassManager from '../components/MasterclassManager';
import BiteSizeManager from '../components/BiteSizeManager';
import CouponManager from '../components/CouponManager';
import UserDashboard from '../components/UserDashboard'; 
import Certificate from "../components/Certifficate";
import ExternalCertificateGenerator from '../components/ExternalCertificateGenerator';
import CertificateSearchManager from '../components/CertificateSearchManager';
import FeedbackAdmin from '../components/FeedbackAdmin';
import CourseEnrollmentStats from '../components/CourseEnrollmentStats';
import MasterclassEnrollmentStats from '../components/MasterclassEnrollmentStats';
import BiteSizeEnrollmentStats from '../components/BiteSizeEnrollmentStats';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('cohort'); 
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAdminAccess = () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) { navigate('/login'); return; }
      try {
        const user = JSON.parse(storedUser);
        if (user.role !== 'admin') {
          navigate('/'); 
          return;
        }
        setIsAuthorized(true);
      } catch (error) {
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };
    checkAdminAccess();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#008a45] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest animate-pulse">Loading Panel</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'cohort', label: 'Cohort', icon: LayoutDashboard, color: 'text-[#008a45]', bg: 'bg-[#008a45]/10' },
    { id: 'masterclass', label: 'Master', icon: Star, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { id: 'bitesize', label: 'Bite-Sized', icon: MonitorPlay, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: 'coupon', label: 'Coupon', icon: Tag, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { id: 'users', label: 'Users', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' }, 
    { id: 'enrollments', label: 'Enrollments', icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: 'mc-stats', label: 'MC Bookings', icon: Video, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { id: 'bite-starts', label: 'Bite size En', icon: Video, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { id: 'certificate', label: 'Certify', icon: Award, color: 'text-pink-400', bg: 'bg-pink-500/10' }, 
    { id: 'ext-cert', label: 'Quick Cert', icon: FilePlus, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { id: 'search-cert', label: 'Find Cert', icon: FolderSearch, color: 'text-teal-400', bg: 'bg-teal-500/10' },
    { id: 'feedback', label: 'Feedback', icon: MessageCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ];

  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#008a45]/30 relative">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-5%] right-[-15%] w-[400px] h-[400px] bg-[#008a45] opacity-[0.03] blur-[120px] rounded-full" />
      </div>

      <Navbar />

      {/* ── MOBILE HEADER ── */}
      <div className="md:hidden sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
              <ShieldAlert size={13} className="text-red-500" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tight text-red-500/80">Admin Panel</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-gray-600 font-mono">v1.1.0</span>
            {currentTab && (
              <div className={`w-6 h-6 rounded-md ${currentTab.bg} flex items-center justify-center`}>
                <currentTab.icon size={12} className={currentTab.color} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── SIDEBAR BACKDROP ── */}
      {isSidebarOpen && (
        <div 
          className="hidden md:block fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside 
        className={`hidden md:flex fixed top-0 left-0 h-full w-72 bg-[#121212] border-r border-white/10 p-6 z-50 flex-col transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.04]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <ShieldAlert size={16} className="text-red-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Admin Panel</p>
              <p className="text-[9px] text-gray-500 font-mono">Management Dashboard</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-1 flex-1 overflow-y-auto">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsSidebarOpen(false); 
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? `${tab.bg} ${tab.color} shadow-sm` 
                  : 'hover:bg-white/[0.03] text-gray-400 hover:text-gray-200'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>
        <div className="pt-4 mt-4 border-t border-white/[0.04]">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs text-gray-600">
            <Settings size={14} /> Panel v1.1.0
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:px-6 md:py-8">
        <main className="flex-1 w-full p-4 mb-28 md:p-0 overflow-x-hidden relative z-10">

          {/* ── PAGE HEADER ── */}
          <div className="mb-5 md:mb-8 flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="hidden md:flex items-center justify-center w-10 h-10 bg-[#121212] border border-white/10 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all shadow-lg"
            >
              <Menu size={20} />
            </button>

            <div className="flex-1">
              <div className="flex items-center gap-3">
                {currentTab && (
                  <div className={`w-10 h-10 rounded-xl ${currentTab.bg} flex items-center justify-center ${currentTab.color}`}>
                    <currentTab.icon size={20} />
                  </div>
                )}
                <div>
                  <h2 className="text-xl md:text-2xl font-bold capitalize">
                    {currentTab?.label || 'Dashboard'}
                  </h2>
                  <p className="text-[11px] md:text-sm text-gray-500">Manage your digital assets & students</p>
                </div>
              </div>
            </div>

            {/* Quick stats badge */}
            <div className="hidden sm:flex items-center gap-2 bg-[#121212] border border-white/[0.06] rounded-xl px-4 py-2.5">
              <Sparkles size={14} className="text-[#008a45]" />
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Admin</span>
            </div>
          </div>

          {/* ── MANAGER CONTAINER ── */}
          <div className="bg-[#121212] border border-white/[0.06] rounded-xl md:rounded-2xl p-1 md:p-4 shadow-lg overflow-hidden">
            <div className="mobile-admin-form text-sm min-h-[500px]">
              {activeTab === 'cohort' && <CohortManager />}
              {activeTab === 'masterclass' && <MasterclassManager />}
              {activeTab === 'bitesize' && <BiteSizeManager />}
              {activeTab === 'coupon' && <CouponManager />}
              {activeTab === 'users' && <UserDashboard />}
              {activeTab === 'enrollments' && <CourseEnrollmentStats />}
              {activeTab === 'mc-stats' && <MasterclassEnrollmentStats />}
              {activeTab === 'bite-starts' && <BiteSizeEnrollmentStats />}
              {activeTab === 'certificate' && <Certificate />}
              {activeTab === 'ext-cert' && <ExternalCertificateGenerator />}
              {activeTab === 'search-cert' && <CertificateSearchManager />}
              {activeTab === 'feedback' && <FeedbackAdmin />}
            </div>
          </div>
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/[0.04] px-1 py-2 z-50">
        <div className="max-w-lg mx-auto flex justify-around items-center overflow-x-auto gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 min-w-[52px] py-1.5 transition-all rounded-lg shrink-0 px-1 ${
                activeTab === tab.id ? 'opacity-100' : 'opacity-40 hover:opacity-70'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${activeTab === tab.id ? tab.bg : ''}`}>
                <tab.icon size={15} className={activeTab === tab.id ? tab.color : 'text-gray-500'} />
              </div>
              <span className={`text-[7px] font-bold uppercase tracking-tight ${activeTab === tab.id ? tab.color : 'text-gray-500'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* CSS Override for Mobile Responsiveness */}
      <style>{`
        @media (max-width: 768px) {
            .mobile-admin-form input, 
            .mobile-admin-form select, 
            .mobile-admin-form textarea {
                font-size: 14px !important;
                padding: 8px !important;
                border-radius: 8px !important;
            }
            .mobile-admin-form button {
                padding: 8px !important;
                font-size: 12px !important;
            }
            .mobile-admin-form table {
                display: block;
                overflow-x: auto;
                white-space: nowrap;
            }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
