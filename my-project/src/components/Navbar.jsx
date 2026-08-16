import { ChevronRight, User as UserIcon } from 'lucide-react'; 
import React from 'react';
import { Link } from 'react-router-dom'; 
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, openLoginModal } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-lg border-b border-white/5 bg-gradient-to-r from-gray-900/90 via-black/90 to-gray-900/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section - Visible on all devices */}
          <Link to="/" className="flex-shrink-0 flex items-center cursor-pointer group">
            <img
              src="https://res.cloudinary.com/villain/image/upload/v1770662332/20250730_170553_0000_xyfhoc.png"
              alt="UPSKALE Logo"
              className="h-16 w-auto object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-[0_0_15px_rgba(0,138,69,0.3)]"
            />
          </Link>

          {/* Desktop Menu - Hidden on mobile, visible on md and up */}
          <div className="hidden md:flex items-center gap-10">
            {['Cohort Course', 'Bite Size', 'Masterclass'].map((item) => (
              <a 
                key={item}
                href={`#${item.replace(/\s/g, '').toLowerCase()}`}
                className="relative text-sm font-bold text-gray-300 hover:text-white uppercase tracking-widest transition-colors duration-300 group py-2"
              >
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#008a45] to-emerald-400 transition-all duration-300 group-hover:w-full shadow-[0_0_10px_#008a45]"></span>
              </a>
            ))}
            
            {/* Auth Button */}
            {user ? (
                <Link 
                  to="/profile"
                  className="relative group px-6 py-3 rounded-full font-bold text-sm tracking-wide text-white overflow-hidden border border-white/10 hover:border-[#008a45]/50 transition-all hover:shadow-[0_0_20px_rgba(0,138,69,0.2)] bg-white/5 flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#008a45] to-green-800 flex items-center justify-center text-[10px] shadow-inner">
                    <UserIcon size={14} />
                  </div>
                  <span>{user.name?.split(' ')[0] || 'Profile'}</span>
                </Link>
            ) : (
                <button 
                  type="button"
                  onClick={() => openLoginModal()}
                  className="relative group px-8 py-3 rounded-full font-bold text-sm tracking-wide text-white overflow-hidden shadow-[0_0_20px_rgba(0,138,69,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,138,69,0.5)] flex items-center cursor-pointer border-0"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#008a45] to-[#005c2e] transition-all group-hover:brightness-110"></div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent -skew-x-12 translate-x-[-100%] group-hover:animate-shine" />
                  <span className="relative flex items-center gap-2">
                    Log In <ChevronRight size={14} />
                  </span>
                </button>
            )}
          </div>

        </div>
      </div>

      <style>{`
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .animate-shine {
          animation: shine 1s ease-in-out infinite;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;