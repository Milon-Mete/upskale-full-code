import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Crown, User } from 'lucide-react';

const MobileBottomNav = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('user'));
        } catch (e) {
            return null;
        }
    });

    useEffect(() => {
        const syncUser = () => {
            try {
                setUser(JSON.parse(localStorage.getItem('user')));
            } catch (e) {
                setUser(null);
            }
        };
        syncUser();
        window.addEventListener('storage', syncUser);
        return () => window.removeEventListener('storage', syncUser);
    }, []);

    // PRO subscription status check
    const subscription = user?.biteSizeSubscription;
    const isProActive = Boolean(
        subscription?.status === 'active' &&
        subscription?.expiresAt &&
        new Date(subscription.expiresAt) > new Date()
    );

    // Hide bottom nav on video playback views, admin routes, or the masterclass
    // checkout flow (that page has its own sticky pay bar in the same
    // bottom-of-screen spot — the site nav would only compete with it for
    // space, or sit at the same z-index and get visually clipped).
    const isBiteSizeFullView = currentPath.includes('/bitesize/') && !currentPath.includes('/checkout');
    const isAdminView = currentPath.startsWith('/admin') || currentPath.startsWith('/god');
    const isMasterclassCheckout = currentPath.startsWith('/masterclasscart');

    if (isBiteSizeFullView || isAdminView || isMasterclassCheckout) {
        return null;
    }

    const triggerHaptic = () => {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            try { navigator.vibrate(15); } catch (e) {}
        }
    };

    const navItems = [
        { label: 'Home', path: '/', icon: Home },
        { label: 'Library', path: '/library', icon: BookOpen },
        { label: 'Premium', path: '/pro', icon: Crown, isPremium: true },
        { label: 'Profile', path: '/profile', icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#090a0f]/95 backdrop-blur-xl border-t border-white/10 px-3 py-2 flex justify-around items-center shadow-[0_-10px_30px_rgba(0,0,0,0.9)] pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));

                if (item.isPremium) {
                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            onClick={triggerHaptic}
                            className={`relative flex flex-col items-center gap-0.5 text-[11px] font-bold tracking-wider transition-all duration-300 py-1.5 px-3 rounded-2xl ${
                                isProActive
                                    ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-500/20 border border-amber-400/80 text-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.7)] scale-105 font-extrabold'
                                    : isActive
                                    ? 'text-white bg-white/10 border border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.2)] scale-105 font-extrabold'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {/* Gold Aura Indicator Badge for Active PRO */}
                            {isProActive && (
                                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                                </span>
                            )}
                            
                            <Icon 
                                size={20} 
                                className={`transition-all duration-300 ${
                                    isProActive 
                                        ? 'text-amber-400 fill-amber-400/40 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] scale-110' 
                                        : isActive 
                                        ? 'text-white stroke-[2.5px]' 
                                        : 'stroke-[1.8px]'
                                }`} 
                            />
                            <span className={isProActive ? 'text-amber-400 font-black drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]' : ''}>
                                {item.label}
                            </span>
                        </Link>
                    );
                }

                return (
                    <Link
                        key={item.label}
                        to={item.path}
                        onClick={triggerHaptic}
                        className={`flex flex-col items-center gap-0.5 text-[11px] font-bold tracking-wider transition-all duration-300 py-1.5 px-3 rounded-2xl ${
                            isActive
                                ? 'text-[#008a45] scale-105 bg-[#008a45]/10 border border-[#008a45]/20 shadow-[0_0_12px_rgba(0,138,69,0.3)]'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
                        <span>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
};

export default MobileBottomNav;