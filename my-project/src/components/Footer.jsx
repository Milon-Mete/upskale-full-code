import React from 'react';
import { Facebook, Instagram, Linkedin, Mail, ArrowRight, Heart, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#050505] text-white border-t border-white/10 font-sans relative overflow-hidden">
      
      {/* Background Gradient Glow (Subtle) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-[#008a45] to-transparent opacity-50"></div>
      <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#008a45]/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Brand & Bio */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <img 
                src="https://res.cloudinary.com/villain/image/upload/v1770662332/20250730_170553_0000_xyfhoc.png" 
                alt="Upskale Logo" 
                className="h-12 w-auto object-contain brightness-200 contrast-200 grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering professionals with top-tier skills in AI, Data Science, and Management. Join the revolution of continuous learning.
            </p>
            
            {/* Social Media Buttons */}
            <div className="flex gap-4">
              
              {/* YouTube */}
              <a 
                href="https://youtube.com/@up-skale" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#FF0000] hover:text-white transition-all duration-300 border border-white/5 hover:border-[#FF0000]"
                aria-label="YouTube"
              >
                <Youtube size={18} />
              </a>

              {/* LinkedIn (Placeholder) */}
              <a 
                href="https://www.linkedin.com/company/up-skale/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#0077b5] hover:text-white transition-all duration-300 border border-white/5 hover:border-[#0077b5]"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>

              {/* Instagram */}
              <a 
                href="https://www.instagram.com/upskale.co" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white transition-all duration-300 border border-white/5 hover:border-pink-500"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>

              {/* Facebook */}
              <a 
                href="https://www.facebook.com/share/1Bv3CYX3gh/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#1877F2] hover:text-white transition-all duration-300 border border-white/5 hover:border-[#1877F2]"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>

            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white tracking-wide">Platform</h3>
            <ul className="space-y-4">
              {['Browse Courses', 'Live Masterclasses', 'Corporate Training', 'Mentorship Program'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-[#008a45] text-sm font-medium transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-[#008a45] transition-colors"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white tracking-wide">Company</h3>
            <ul className="space-y-4">
              {['About Us', 'Careers', 'Become an Instructor', 'Success Stories', 'Contact'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white tracking-wide">Stay Ahead</h3>
            <p className="text-gray-400 text-sm mb-4">
              Get the latest AI trends and course updates directly to your inbox.
            </p>
            <form className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#008a45] focus:ring-1 focus:ring-[#008a45] transition-all placeholder:text-gray-600"
                />
              </div>
              <button className="w-full bg-gradient-to-r from-[#008a45] to-[#006030] hover:from-[#00753a] hover:to-[#005028] text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-green-900/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                Subscribe <ArrowRight size={16} />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2026 Upskale || Chakraborty & Banerjee Associates Pvt Ltd. All rights reserved.</p>
          
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>

          <div className="flex items-center gap-1.5 text-xs opacity-70">
            <span>Made with</span>
            <Heart size={12} className="text-red-500 fill-red-500 animate-pulse" />
            <span>in India</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;