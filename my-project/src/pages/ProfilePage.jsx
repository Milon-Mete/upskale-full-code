import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    User, Mail, Phone, Calendar, LogOut, BookOpen,
    Award, Zap, CheckCircle2, LayoutDashboard, Loader2, ShieldCheck,
    Video, ExternalLink, AlertCircle, CreditCard,
    Copy, Check, Users, Smartphone, MessageCircle, Flame, Trophy,
    ChevronRight, Settings, Edit3, Share2, Gift, Clock, Star, ArrowLeft,
    BarChart3, Target, TrendingUp, X, Link2, BadgeCheck
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { BASE_URL } from '../config';
import MobileBottomNav from '../components/MobileBottomNav';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = `${BASE_URL}`;

const ProfilePage = () => {
    const navigate = useNavigate();
    const { openLoginModal } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [showEditSheet, setShowEditSheet] = useState(false);

    // Profile editing
    const [editForm, setEditForm] = useState({ name: '', age: '', gender: '' });
    const [savingEdit, setSavingEdit] = useState(false);
    const [editError, setEditError] = useState('');

    // Google new user profile completion
    const [isNewGoogleUser, setIsNewGoogleUser] = useState(false);
    const [googleProfileForm, setGoogleProfileForm] = useState({ phone: '', age: '', gender: 'Male' });
    const [submittingGoogleProfile, setSubmittingGoogleProfile] = useState(false);
    const [googleProfileError, setGoogleProfileError] = useState('');

    // Streak & Badges state
    const [streak, setStreak] = useState(0);
    const [streakAlive, setStreakAlive] = useState(false);
    const [badges, setBadges] = useState([]);

    const handleCopyLink = () => {
        const link = `${window.location.origin}/register?ref=${user?._id}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

useEffect(() => {
    // Handle Google OAuth redirect
    const urlParams = new URLSearchParams(window.location.search);
    const isGoogleLogin = urlParams.get('googleLogin');
    const newGoogleUser = urlParams.get('isNewGoogleUser');
    const googleToken = urlParams.get('token');

    let isGoogleOAuthRedirect = false;

    if (isGoogleLogin === 'success') {
        isGoogleOAuthRedirect = true;
        if (googleToken) {
            localStorage.setItem('token', googleToken);
        }
        if (newGoogleUser === 'true') {
            setIsNewGoogleUser(true);
        }
        window.history.replaceState({}, document.title, '/profile');
    }

    const fetchUserProfile = async () => {
        const storedUser = localStorage.getItem('user');

        if (!storedUser && !isGoogleOAuthRedirect) {
            setLoading(false);
            return;
        }

        try {
            if (isGoogleOAuthRedirect) {
                const activeToken = googleToken || localStorage.getItem('token');
                const reqHeaders = { 'Content-Type': 'application/json' };
                if (activeToken) reqHeaders['Authorization'] = `Bearer ${activeToken}`;

                const meRes = await fetch(`${API_BASE_URL}/user/me`, {
                    headers: reqHeaders,
                    credentials: 'include'
                });
                if (meRes.ok) {
                    const meData = await meRes.json();
                    const userData = meData.user || meData;
                    if (userData && userData._id) {
                        localStorage.setItem('user', JSON.stringify(userData));
                        window.dispatchEvent(new Event("storage"));
                        setUser(userData);

                        const redirectTarget = sessionStorage.getItem('redirectAfterLogin');
                        if (redirectTarget && redirectTarget !== '/profile' && redirectTarget !== '/login') {
                            sessionStorage.removeItem('redirectAfterLogin');
                            navigate(redirectTarget, { replace: true });
                            return;
                        }
                    }
                    if (userData?.authProvider === 'google' && !userData?.phone) {
                        setIsNewGoogleUser(true);
                    }
                    setLoading(false);
                    return;
                } else if (storedUser) {
                    // Fall back to cached user session
                    const localData = JSON.parse(storedUser);
                    setUser(localData);
                    setLoading(false);
                    return;
                }
            }

            const localData = JSON.parse(storedUser);
            // Immediately render cached profile for instant load
            setUser(localData);
            setLoading(false);

            const token = localStorage.getItem('token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`${API_BASE_URL}/user/${localData._id}`, {
                method: 'GET',
                headers,
                credentials: 'include'
            });

            if (res.ok) {
                const freshUserData = await res.json();
                setUser(freshUserData);
                localStorage.setItem('user', JSON.stringify(freshUserData));
                if (freshUserData.authProvider === 'google' && !freshUserData.phone) {
                    setIsNewGoogleUser(true);
                }
            } else {
                console.warn(`Server returned ${res.status}. Using cached local session.`);
            }
        } catch (error) {
            console.error("Network error fetching fresh profile details. Using local session.", error);
        } finally {
            setLoading(false);
        }
    };

    fetchUserProfile();

    // Fetch streak & badges
    const fetchStreak = async () => {
        try {
            const res = await fetch(`${BASE_URL}/engagement/streak`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setStreak(data.currentStreak);
                setStreakAlive(data.streakAlive);
            }
        } catch (err) { console.log("Streak error", err); }
    };

    const fetchBadges = async () => {
        try {
            const res = await fetch(`${BASE_URL}/engagement/badges`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) setBadges(data.badges || []);
        } catch (err) { console.log("Badges error", err); }
    };

    fetchStreak();
    fetchBadges();

}, [navigate]);

    const handleLogout = async () => {
        try {
            await fetch(`${BASE_URL}/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (err) {
            console.warn("Logout API call failed, clearing local session:", err);
        }
        localStorage.removeItem('user');
        navigate('/');
    };

    const handlePayPart2 = (enrollment) => {
        const item = enrollment.item || {};
        navigate('/cart', {
            state: {
                item: {
                    id: item._id,
                    title: item.title || 'Course',
                    image: item.thumbnail || item.image,
                    itemModel: enrollment.itemModel || 'Course',
                    price: item.pricing?.installment?.pricePart2 || 0,
                    planType: enrollment.planType,
                    paymentType: 'installment',
                    isPart2: true
                }
            }
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return "TBA";
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-[#008a45] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-500 animate-pulse">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    // Handle profile edit
    const startEditing = () => {
        setEditForm({
            name: user.name || '',
            age: user.age?.toString() || '',
            gender: user.gender || 'Male'
        });
        setShowEditSheet(true);
        setEditError('');
    };

    const cancelEditing = () => {
        setShowEditSheet(false);
        setEditForm({ name: '', age: '', gender: '' });
        setEditError('');
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!editForm.name.trim()) {
            setEditError('Name is required');
            return;
        }
        setSavingEdit(true);
        setEditError('');
        try {
            const res = await fetch(`${BASE_URL}/user/${user._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name: editForm.name.trim(),
                    age: editForm.age ? parseInt(editForm.age) : null,
                    gender: editForm.gender
                }),
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
                setShowEditSheet(false);
            } else {
                setEditError(data.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error('Save profile error:', err);
            setEditError('Network error. Please try again.');
        } finally {
            setSavingEdit(false);
        }
    };

    // Handle Google new user profile submission
    const handleCompleteGoogleProfile = async (e) => {
        e.preventDefault();
        setSubmittingGoogleProfile(true);
        try {
            const res = await fetch(`${BASE_URL}/auth/complete-google-profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(googleProfileForm),
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
                setIsNewGoogleUser(false);
                setGoogleProfileError('');
            } else {
                setGoogleProfileError(data.message || 'Failed to save profile');
            }
        } catch (err) {
            console.error('Complete profile error:', err);
            setGoogleProfileError('Network error. Please try again.');
        } finally {
            setSubmittingGoogleProfile(false);
        }
    };

    // --- CERTIFICATE EXTRACTOR ---
    const allEnrollments = [
        ...(user.enrolledCourses || []),
        ...(user.enrolledCohorts || [])
    ];

    const validCertificates = allEnrollments
        .filter(enc => enc.certificateUrl)
        .map(enc => {
            const isBiteSize = enc.itemModel === 'BiteSizeCourse';
            const defaultTitle = isBiteSize ? 'Bite-Sized Premium Course' : 'Completed Course';
            const finalTitle = enc.item?.title ? enc.item.title : defaultTitle;

            return {
                certificateUrl: enc.certificateUrl,
                courseName: finalTitle,
                planType: enc.planType || 'Standard',
                issuedDate: enc.issuedDate
                    ? new Date(enc.issuedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                    : 'Recently Verified'
            };
        });

    if (!loading && !user) {
        return (
            <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 bg-[#008a45]/20 text-[#008a45] rounded-full flex items-center justify-center mb-4">
                        <User size={32} />
                    </div>
                    <h2 className="text-2xl font-black mb-2">Access Your Profile</h2>
                    <p className="text-gray-400 text-sm max-w-sm mb-6">Log in to view your enrolled courses, certificates, and dashboard.</p>
                    <button
                        onClick={() => openLoginModal({ onSuccess: () => fetchUserProfile() })}
                        className="px-8 py-3 bg-[#008a45] hover:bg-[#007038] text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer"
                    >
                        Log In Now
                    </button>
                </div>
                <MobileBottomNav />
            </div>
        );
    }

    const enrolledCount = allEnrollments.length;
    const earnedCertificates = validCertificates.length;
    const totalReferrals = user?.referralHistory?.length || 0;
    const purchasedReferrals = user?.referralHistory?.filter(ref => ref.status === 'successful').length || 0;

    const handleWhatsAppShare = () => {
        const referralLink = `${window.location.origin}/register?ref=${user?._id}`;
        const message = `I just learned Python basics in 60 seconds! 🚀 Try it for just ₹1 here: ${referralLink}`;
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans">
            <Navbar />


            {/* Ambient glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[5%] right-[-20%] w-[400px] h-[400px] bg-[#008a45] opacity-[0.04] blur-[120px] rounded-full" />
                <div className="absolute bottom-[20%] left-[-20%] w-[300px] h-[300px] bg-[#00a84d] opacity-[0.03] blur-[100px] rounded-full" />
            </div>

            {/* ─────────────────────────────────────────────── */}
            {/* GOOGLE NEW USER PROFILE COMPLETION MODAL        */}
            {/* ─────────────────────────────────────────────── */}
            {isNewGoogleUser && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-md mx-4 bg-[#121212] border border-[#008a45]/30 rounded-3xl p-8 shadow-2xl shadow-[#008a45]/10 animate-in fade-in zoom-in-95 duration-300">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#008a45] to-green-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-900/20">
                                <User size={28} className="text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h2>
                            <p className="text-sm text-gray-400">Add your phone number and details to finish setting up your account</p>
                        </div>

                        <form onSubmit={handleCompleteGoogleProfile} className="space-y-4">
                            {googleProfileError && (
                                <p className="text-red-500 text-xs font-bold text-center bg-red-500/10 py-2 rounded-lg">{googleProfileError}</p>
                            )}
                            <div className="relative group">
                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                <input
                                    type="tel"
                                    required
                                    placeholder="Phone Number *"
                                    value={googleProfileForm.phone}
                                    onChange={(e) => setGoogleProfileForm({ ...googleProfileForm, phone: e.target.value })}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-[#008a45] focus:outline-none transition-colors"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="relative group w-1/2">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                    <input
                                        type="number"
                                        required
                                        placeholder="Age *"
                                        value={googleProfileForm.age}
                                        onChange={(e) => setGoogleProfileForm({ ...googleProfileForm, age: e.target.value })}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-[#008a45] focus:outline-none transition-colors"
                                    />
                                </div>
                                <div className="relative group w-1/2">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                    <select
                                        value={googleProfileForm.gender}
                                        onChange={(e) => setGoogleProfileForm({ ...googleProfileForm, gender: e.target.value })}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-[#008a45] focus:outline-none appearance-none"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={submittingGoogleProfile}
                                className="w-full bg-[#008a45] hover:bg-[#007038] text-white font-bold py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                            >
                                {submittingGoogleProfile ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                {submittingGoogleProfile ? 'Saving...' : 'Complete Profile'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ─────────────────────────────────────────────── */}
            {/* EDIT PROFILE BOTTOM SHEET                       */}
            {/* ─────────────────────────────────────────────── */}
            {showEditSheet && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                        onClick={cancelEditing}
                    />
                    {/* Sheet */}
                    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
                        <div className="bg-[#121212] border-t border-white/10 rounded-t-3xl px-6 pt-6 pb-10 shadow-2xl max-w-lg mx-auto">
                            {/* Handle */}
                            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />

                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Edit3 size={18} className="text-[#008a45]" />
                                Edit Profile
                            </h3>

                            <form onSubmit={handleSaveProfile} className="space-y-4">
                                {editError && (
                                    <p className="text-red-500 text-xs font-bold text-center bg-red-500/10 py-2 rounded-lg">{editError}</p>
                                )}
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Full Name"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-[#008a45] focus:outline-none transition-colors text-sm"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <div className="relative group flex-1">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                        <input
                                            type="number"
                                            placeholder="Age"
                                            value={editForm.age}
                                            onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-[#008a45] focus:outline-none transition-colors text-sm"
                                        />
                                    </div>
                                    <div className="relative group flex-1">
                                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                        <select
                                            value={editForm.gender}
                                            onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-[#008a45] focus:outline-none appearance-none text-sm"
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={cancelEditing}
                                        className="flex-1 py-3.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-bold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={savingEdit}
                                        className="flex-1 bg-[#008a45] hover:bg-[#007038] text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                                    >
                                        {savingEdit ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                                        {savingEdit ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {/* ─────────────────────────────────────────────── */}
            {/* MAIN CONTENT (MOBILE-FIRST)                    */}
            {/* ─────────────────────────────────────────────── */}
            <div className="max-w-lg mx-auto px-4 pb-28 pt-6 relative z-10">

                {/* ── BACK + HEADER ── */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft size={18} className="text-gray-300" />
                        </button>
                        <h1 className="text-xl font-bold text-white">Profile</h1>
                    </div>
                    {user.role === 'admin' && (
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3.5 py-2 rounded-xl font-bold text-xs shadow-lg shadow-purple-900/20 transition-all hover:scale-105"
                        >
                            <ShieldCheck size={14} /> Admin
                        </Link>
                    )}
                </div>

                {/* ── PROFILE HERO CARD ── */}
                <div className="bg-gradient-to-b from-[#121212] to-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6 mb-5 relative overflow-hidden">
                    {/* Top green accent */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#008a45] via-[#00a84d] to-transparent" />

                    <div className="flex items-center gap-5">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#008a45] to-green-800 flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-green-900/20 uppercase">
                                {user.name?.charAt(0) || 'U'}
                            </div>
                            {/* Online indicator */}
                            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-[#008a45] border-[3px] border-[#0d0d0d] rounded-full flex items-center justify-center">
                                <CheckCircle2 size={10} className="text-white" />
                            </div>
                        </div>

                        {/* Name & Role */}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-bold text-white truncate">{user.name}</h2>
                            <p className="text-sm text-gray-400 mt-0.5">{user.email || 'No email'}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    user.role === 'admin'
                                        ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400'
                                        : 'bg-[#008a45]/10 border border-[#008a45]/20 text-[#008a45]'
                                }`}>
                                    <BadgeCheck size={10} />
                                    {user.role || 'Student'}
                                </span>
                                {user.authProvider === 'google' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                                        Google
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── STATS ROW ── */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-[#121212] border border-white/[0.06] rounded-xl p-4 text-center hover:border-[#008a45]/30 transition-colors cursor-pointer group"
                        onClick={() => document.getElementById('learning-section')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        <div className="w-8 h-8 bg-[#008a45]/10 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-[#008a45]/20 transition-colors">
                            <BookOpen size={16} className="text-[#008a45]" />
                        </div>
                        <p className="text-xl font-black text-white">{enrolledCount}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Enrolled</p>
                    </div>

                    <div className="bg-[#121212] border border-white/[0.06] rounded-xl p-4 text-center hover:border-orange-500/30 transition-colors cursor-pointer group">
                        <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-orange-500/20 transition-colors">
                            <Flame size={16} className={streak > 0 && streakAlive ? 'text-orange-500' : 'text-gray-500'} />
                        </div>
                        <p className={`text-xl font-black ${streak > 0 && streakAlive ? 'text-orange-500' : 'text-white'}`}>{streak}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Day Streak</p>
                    </div>

                    <div className="bg-[#121212] border border-white/[0.06] rounded-xl p-4 text-center hover:border-yellow-500/30 transition-colors cursor-pointer group"
                        onClick={() => document.getElementById('certificates-section')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-yellow-500/20 transition-colors">
                            <Award size={16} className="text-yellow-500" />
                        </div>
                        <p className="text-xl font-black text-white">{earnedCertificates}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Certs</p>
                    </div>
                </div>

                {/* ── QUICK ACTIONS ── */}
                <div className="bg-[#121212] border border-white/[0.06] rounded-2xl p-4 mb-6">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3 px-1">Quick Actions</p>
                    <div className="grid grid-cols-4 gap-2">
                        <button
                            onClick={startEditing}
                            className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#008a45]/10 flex items-center justify-center group-hover:bg-[#008a45]/20 transition-colors">
                                <Edit3 size={18} className="text-[#008a45]" />
                            </div>
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Edit</span>
                        </button>

                        <button
                            onClick={handleCopyLink}
                            className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                {copied ? <Check size={18} className="text-green-500" /> : <Link2 size={18} className="text-blue-500" />}
                            </div>
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                                {copied ? 'Copied!' : 'Refer'}
                            </span>
                        </button>

                        <button
                            onClick={handleWhatsAppShare}
                            className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                                <MessageCircle size={18} className="text-green-500" fill="currentColor" />
                            </div>
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Share</span>
                        </button>

                        <button
                            onClick={handleLogout}
                            className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                                <LogOut size={18} className="text-red-400" />
                            </div>
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Logout</span>
                        </button>
                    </div>
                </div>

                {/* ── CONTACT INFO CARD ── */}
                <div className="bg-[#121212] border border-white/[0.06] rounded-2xl p-5 mb-6">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Contact Information</p>
                    <div className="space-y-3">
                        {user.authProvider === 'google' ? (
                            <>
                                <div className="flex items-center gap-3 p-3 bg-black/30 rounded-xl border border-white/[0.03]">
                                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                        <Mail size={16} className="text-blue-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase">Email</p>
                                        <p className="text-sm font-medium text-gray-200 truncate">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-black/30 rounded-xl border border-white/[0.03]">
                                    <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                        <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                                            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                                                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                                                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                                                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                                                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.144 45.789 L -6.734 42.379 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                                            </g>
                                        </svg>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase">Connected via</p>
                                        <p className="text-sm font-medium text-gray-200">Google</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 p-3 bg-black/30 rounded-xl border border-white/[0.03]">
                                    <div className="w-9 h-9 rounded-lg bg-[#008a45]/10 flex items-center justify-center shrink-0">
                                        <Phone size={16} className="text-[#008a45]" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase">Phone</p>
                                        <p className="text-sm font-medium text-gray-200">{user.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-black/30 rounded-xl border border-white/[0.03]">
                                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                        <Mail size={16} className="text-blue-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase">Email</p>
                                        <p className="text-sm font-medium text-gray-200 truncate">{user.email || 'Not Provided'}</p>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="flex gap-3">
                            <div className="flex-1 flex items-center gap-3 p-3 bg-black/30 rounded-xl border border-white/[0.03]">
                                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                    <Calendar size={16} className="text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">Age</p>
                                    <p className="text-sm font-medium text-gray-200">{user.age || '—'}</p>
                                </div>
                            </div>
                            <div className="flex-1 flex items-center gap-3 p-3 bg-black/30 rounded-xl border border-white/[0.03]">
                                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                    <Users size={16} className="text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">Gender</p>
                                    <p className="text-sm font-medium text-gray-200">{user.gender || '—'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── MY LEARNING SECTION ── */}
                <div id="learning-section" className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Zap size={18} className="text-[#008a45]" />
                            My Learning
                        </h2>
                        <span className="text-[10px] text-gray-500 font-bold bg-white/5 px-2.5 py-1 rounded-full">{enrolledCount} items</span>
                    </div>

                    {allEnrollments.length > 0 ? (
                        <div className="space-y-4">
                            {allEnrollments.map((enrollment, idx) => {
                                const isMasterclass = enrollment.itemModel === 'Masterclass';
                                const isBiteSize = enrollment.itemModel === 'BiteSizeCourse';
                                const isPartial = enrollment.paymentStatus === 'partial';

                                const title = enrollment.item?.title || (isBiteSize ? "Bite-Sized Premium Course" : "Course");
                                const schedule = (isMasterclass && enrollment.item) ? enrollment.item.schedule : null;
                                const meetingLink = (isMasterclass && enrollment.item) ? enrollment.item.meetingLink : null;

                                const hasCertificate = !!enrollment.certificateUrl;

                                const identifier = enrollment.item?.slug || enrollment.item?._id || 'unknown';
                                const strictId = enrollment.item?._id || enrollment.item || 'unknown';

                                let courseLink = '#';
                                if (isBiteSize) {
                                    courseLink = `/bitesize/${identifier}`;
                                } else if (isMasterclass) {
                                    courseLink = `/masterclass/${identifier}`;
                                } else {
                                    if (enrollment.planType === 'live') {
                                        courseLink = `/course/${identifier}`;
                                    } else {
                                        courseLink = `/learn/${strictId}`;
                                    }
                                }

                                return (
                                    <div
                                        key={idx}
                                        className={`bg-[#121212] border rounded-2xl p-5 transition-all ${
                                            hasCertificate
                                                ? 'border-yellow-500/20 shadow-sm shadow-yellow-900/10'
                                                : isPartial
                                                ? 'border-yellow-500/30'
                                                : 'border-white/[0.06] hover:border-[#008a45]/30'
                                        }`}
                                    >
                                        {/* Header with icon + badge */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                    isMasterclass
                                                        ? 'bg-purple-500/10 text-purple-500'
                                                        : isBiteSize
                                                        ? 'bg-blue-500/10 text-blue-500'
                                                        : 'bg-[#008a45]/10 text-[#008a45]'
                                                }`}>
                                                    {isMasterclass ? <Video size={20} /> :
                                                        isBiteSize ? <Smartphone size={20} /> :
                                                            <LayoutDashboard size={20} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-bold text-white leading-tight line-clamp-2">{title}</h3>
                                                    <p className="text-[10px] text-gray-500 mt-0.5 font-mono">
                                                        {enrollment.planType} • {enrollment.amountPaid === 0 ? "FREE" : `₹${enrollment.amountPaid || 0}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="shrink-0 ml-2">
                                                {isPartial ? (
                                                    <span className="text-[9px] font-black bg-yellow-500 text-black px-2 py-0.5 rounded-md flex items-center gap-1 whitespace-nowrap">
                                                        <AlertCircle size={9} /> PENDING
                                                    </span>
                                                ) : (
                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md whitespace-nowrap ${
                                                        isMasterclass
                                                            ? 'bg-purple-600 text-white'
                                                            : isBiteSize
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-[#008a45] text-white'
                                                    }`}>
                                                        {isMasterclass ? 'LIVE' : isBiteSize ? 'BITE' : 'FULL'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Partial payment warning */}
                                        {isPartial && (
                                            <div className="mb-4 bg-yellow-500/5 border border-yellow-500/20 p-3 rounded-xl">
                                                <p className="text-[11px] text-yellow-500 font-bold mb-2">You have a pending balance for this {enrollment.itemModel?.toLowerCase()}.</p>
                                                <button
                                                    onClick={() => handlePayPart2(enrollment)}
                                                    className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2"
                                                >
                                                    <CreditCard size={14} /> PAY PART 2
                                                </button>
                                            </div>
                                        )}

                                        {/* Certificate or Progress */}
                                        {hasCertificate ? (
                                            <button
                                                onClick={() => navigate(enrollment.certificateUrl)}
                                                className="w-full py-3 bg-gradient-to-r from-yellow-600 to-amber-500 text-black text-sm font-black rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-95"
                                            >
                                                <Award size={16} /> VIEW CERTIFICATE
                                            </button>
                                        ) : null}

                                        {isMasterclass && schedule ? (
                                            <>
                                                <div className="bg-purple-500/5 border border-purple-500/15 rounded-xl p-3 mb-3">
                                                    <p className="text-[9px] text-purple-400 font-bold uppercase mb-1 flex items-center gap-1">
                                                        <Calendar size={10} /> Schedule
                                                    </p>
                                                    <p className="text-sm text-white font-medium">{formatDate(schedule.startDate)}</p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">{schedule.startTime} - {schedule.endTime}</p>
                                                </div>
                                                {meetingLink ? (
                                                    <a
                                                        href={meetingLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center gap-2 w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-purple-900/20 active:scale-95"
                                                    >
                                                        <Video size={16} /> Join Masterclass
                                                    </a>
                                                ) : (
                                                    <button disabled className="w-full py-3.5 bg-white/5 text-gray-500 text-sm font-bold rounded-xl cursor-not-allowed border border-white/5">
                                                        Link Coming Soon
                                                    </button>
                                                )}
                                            </>
                                        ) : !hasCertificate ? (
                                            <div className={isPartial ? "opacity-50 pointer-events-none" : ""}>
                                                {/* Progress bar */}
                                                <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 mb-1.5">
                                                    <span>Progress</span>
                                                    <span>{enrollment.progress || 0}%</span>
                                                </div>
                                                <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden mb-4">
                                                    <div
                                                        className="h-full bg-[#008a45] rounded-full transition-all duration-500"
                                                        style={{ width: `${enrollment.progress || 0}%` }}
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => navigate(courseLink)}
                                                    className="w-full py-3.5 text-sm font-bold rounded-xl border transition-all active:scale-95 bg-white/5 hover:bg-white/10 text-white border-white/10"
                                                >
                                                    {enrollment.progress > 0 ? "Continue Learning" : "Start Learning"}
                                                </button>
                                            </div>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-[#121212] border border-white/[0.06] rounded-2xl p-10 text-center">
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <BookOpen size={28} className="text-gray-500" />
                            </div>
                            <h3 className="text-base font-bold text-white mb-1">No Active Courses</h3>
                            <p className="text-xs text-gray-500 mb-6">Start your learning journey today!</p>
                            <button
                                onClick={() => navigate('/')}
                                className="bg-[#008a45] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#007038] transition-all active:scale-95"
                            >
                                Browse Courses
                            </button>
                        </div>
                    )}
                </div>

                {/* ── MY CERTIFICATES ── */}
                <div id="certificates-section" className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Award size={18} className="text-yellow-500" />
                            Certificates
                        </h2>
                        <span className="text-[10px] text-gray-500 font-bold bg-white/5 px-2.5 py-1 rounded-full">{earnedCertificates} earned</span>
                    </div>

                    {validCertificates.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                            {validCertificates.map((cert, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => navigate(cert.certificateUrl)}
                                    className="bg-gradient-to-b from-[#1a1a1a] to-[#121212] border border-white/[0.06] hover:border-yellow-500/40 p-4 rounded-2xl cursor-pointer transition-all hover:-translate-y-0.5 group relative overflow-hidden"
                                >
                                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-yellow-500/10 blur-xl rounded-full pointer-events-none group-hover:bg-yellow-500/20 transition-all" />

                                    <div className="relative z-10">
                                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-600/20 flex items-center justify-center mb-3 border border-yellow-500/15 group-hover:scale-110 transition-transform">
                                            <Award size={16} className="text-yellow-500" />
                                        </div>
                                        <h3 className="text-[11px] font-bold text-white leading-tight line-clamp-2 mb-2">
                                            {cert.courseName}
                                        </h3>
                                        <p className="text-[8px] text-gray-500 font-mono uppercase tracking-wider flex items-center gap-1">
                                            <Calendar size={8} />
                                            {cert.issuedDate}
                                        </p>
                                        <div className="mt-2 inline-block px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded text-[7px] font-bold text-yellow-500 uppercase tracking-wider">
                                            {cert.planType}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-[#121212] border border-white/[0.06] rounded-2xl p-8 text-center">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <Award size={24} className="text-gray-600" />
                            </div>
                            <h3 className="text-sm font-bold text-white mb-1">No Certificates Yet</h3>
                            <p className="text-[11px] text-gray-500">Complete courses to unlock certificates.</p>
                        </div>
                    )}
                </div>

                {/* ── BADGES ── */}
                {badges.length > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Trophy size={18} className="text-emerald-500" />
                                Badges
                            </h2>
                            <span className="text-[10px] text-gray-500 font-bold bg-white/5 px-2.5 py-1 rounded-full">{badges.length} earned</span>
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                            {badges.map((badge, idx) => (
                                <div
                                    key={idx}
                                    className="bg-[#121212] border border-white/[0.06] rounded-2xl p-3 text-center hover:border-emerald-500/30 transition-all hover:-translate-y-0.5 group"
                                >
                                    <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        {badge.badgeUrl ? (
                                            <img src={badge.badgeUrl} alt="Badge" className="w-7 h-7" />
                                        ) : (
                                            <Award size={20} className="text-emerald-500" />
                                        )}
                                    </div>
                                    <h4 className="text-white text-[9px] font-bold leading-tight line-clamp-2">
                                        {badge.courseId?.title || 'Completed'}
                                    </h4>
                                    <p className="text-[7px] text-gray-500 mt-0.5">
                                        {new Date(badge.completedAt).toLocaleDateString('en-IN', {
                                            month: 'short', day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── REFERRAL NETWORK ── */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Users size={18} className="text-blue-500" />
                            Referrals
                        </h2>
                    </div>

                    <div className="bg-[#121212] border border-white/[0.06] rounded-2xl p-5">
                        {user?.referredBy && (
                            <div className="mb-4 pb-4 border-b border-white/[0.06]">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Referred by</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-[#008a45] font-bold">{user.referredBy.name}</span>
                                    <span className="text-[10px] text-gray-600 font-mono">(ID: {user.referredBy._id})</span>
                                </div>
                            </div>
                        )}

                        {/* WhatsApp Share CTA */}
                        <button
                            onClick={handleWhatsAppShare}
                            className="w-full bg-[#25D366] hover:bg-[#1ebd5c] text-white font-black py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_15px_rgba(37,211,102,0.15)] mb-5"
                        >
                            <MessageCircle size={20} fill="currentColor" />
                            Share to WhatsApp
                        </button>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-black/30 p-3.5 rounded-xl border border-white/[0.03]">
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-1">Total</p>
                                <p className="text-xl font-black text-white">{totalReferrals}</p>
                            </div>
                            <div className="bg-black/30 p-3.5 rounded-xl border border-white/[0.03]">
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-1">Purchased</p>
                                <p className="text-xl font-black text-[#008a45]">{purchasedReferrals}</p>
                            </div>
                        </div>

                        {user?.referralHistory && user.referralHistory.length > 0 ? (
                            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
                                {user.referralHistory.map((ref, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-black/30 p-3 rounded-xl border border-white/[0.03]">
                                        <div className="min-w-0">
                                            <p className="text-white font-bold text-sm truncate">{ref.referredUserId?.name || 'Unknown User'}</p>
                                            <p className="text-[10px] text-gray-500">Joined: {new Date(ref.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className={`shrink-0 text-[9px] font-black px-2.5 py-1 rounded-lg border ${
                                            ref.status === 'successful'
                                                ? 'bg-[#008a45]/10 border-[#008a45]/20 text-[#008a45]'
                                                : 'bg-white/5 border-white/10 text-gray-400'
                                        }`}>
                                            {ref.status === 'successful' ? 'PURCHASED' : 'PENDING'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-black/30 p-5 rounded-xl border border-white/[0.03] text-center">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-2">
                                    <Users size={20} className="text-gray-500" />
                                </div>
                                <p className="text-white font-bold text-sm mb-1">No referrals yet</p>
                                <p className="text-gray-500 text-[11px]">Tap WhatsApp to invite friends.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── ACCOUNT INFO ── */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Settings size={18} className="text-gray-400" />
                            Account
                        </h2>
                    </div>

                    <div className="bg-[#121212] border border-white/[0.06] rounded-2xl p-5 space-y-1">
                        <div className="flex items-center justify-between py-3 px-1">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                    <BadgeCheck size={16} className="text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">Account Type</p>
                                </div>
                            </div>
                            <span className="text-xs text-gray-400 capitalize">{user.role || 'Student'}</span>
                        </div>
                        <div className="h-px bg-white/[0.04]" />
                        <div className="flex items-center justify-between py-3 px-1">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                    <Calendar size={16} className="text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">Member Since</p>
                                </div>
                            </div>
                            <span className="text-xs text-gray-400">
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── LOGOUT ── */}
                <button
                    onClick={handleLogout}
                    className="w-full py-4 rounded-2xl border border-red-500/20 text-red-400 font-bold hover:bg-red-500/10 transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
                >
                    <LogOut size={16} /> Sign Out
                </button>
            </div>

            <MobileBottomNav />
        </div>
    );
};

export default ProfilePage;