import { ChevronRight, User } from 'lucide-react'; 
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom'; 
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const location = useLocation(); 

  const checkUser = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    checkUser(); 
    
    window.addEventListener('storage', checkUser);

    return () => {
      window.removeEventListener('storage', checkUser);
    };
  }, [location]);

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl border-b border-white/10 bg-[#0A0A0B]/95">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">

          {/* Logo - left */}
          <Link to="/" className="flex-shrink-0 flex items-center cursor-pointer group">
            <img
              src="https://res.cloudinary.com/villain/image/upload/v1770662332/20250730_170553_0000_xyfhoc.png"
              alt="UPSKALE Logo"
              className="h-11 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Cohorts', href: '#cohorts' },
              { label: 'Trending', href: '#trending' },
              { label: 'Masterclass', href: '#masterclass' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="relative text-[13px] font-bold text-gray-400 hover:text-white uppercase tracking-[0.14em] transition-colors duration-300 group py-2"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}

            {/* Auth Button */}
            {user ? (
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full font-bold text-sm text-white border border-white/15 hover:border-white/40 transition-all bg-white/5"
                  title="Your profile"
                >
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-xs font-black shadow-inner overflow-hidden">
                    {user.picture ? (
                      <img src={user.picture} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={15} />
                    )}
                  </span>
                  <span className="max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
                </Link>
            ) : (
                <Link
                  to="/login"
                  className="px-6 py-2.5 rounded-full font-bold text-sm tracking-wide text-white bg-gradient-to-r from-red-700 to-red-500 hover:from-red-600 hover:to-red-400 transition-all hover:scale-[1.03] active:scale-95 flex items-center gap-1.5 shadow-[0_4px_20px_-4px_rgba(220,38,38,0.6)]"
                >
                  Log In <ChevronRight size={14} />
                </Link>
            )}
          </div>

          {/* Mobile: circular profile avatar right */}
          <div className="md:hidden">
            {user ? (
              <Link to="/profile" className="block w-9 h-9 rounded-full overflow-hidden border-2 border-white/20" title="Your profile">
                {user.picture ? (
                  <img src={user.picture} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="w-full h-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </span>
                )}
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2 rounded-full font-bold text-[13px] text-white bg-gradient-to-r from-red-700 to-red-500 active:scale-95 transition-all"
              >
                Log In
              </Link>
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