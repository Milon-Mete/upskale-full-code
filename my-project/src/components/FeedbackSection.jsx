import React, { useState, useEffect } from 'react';
import { Send, Trash2, MessageCircle, Loader2, ChevronLeft } from 'lucide-react';
import { BASE_URL } from '../config';

const FeedbackSection = ({ courseId, onClose }) => {
    const [feedbackText, setFeedbackText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [feedbackList, setFeedbackList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
    const isAdmin = user?.role === 'admin';

    // If admin, fetch all feedback on mount
    useEffect(() => {
        if (isAdmin && courseId) {
            fetchFeedback();
        }
    }, [isAdmin, courseId]);

    const fetchFeedback = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/engagement/feedback/${courseId}`, {
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) setFeedbackList(data.feedback);
        } catch (err) {
            console.error("Failed to fetch feedback", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!feedbackText.trim() || !user) return;

        setSubmitting(true);
        try {
            const res = await fetch(`${BASE_URL}/engagement/feedback/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    courseId,
                    text: feedbackText.trim()
                })
            });
            const data = await res.json();
            if (data.success) {
                setSubmitted(true);
                setFeedbackText('');
            }
        } catch (err) {
            console.error("Failed to submit feedback", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (feedbackId) => {
        try {
            const res = await fetch(`${BASE_URL}/engagement/feedback/${feedbackId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                setFeedbackList(prev => prev.filter(f => f._id !== feedbackId));
            }
        } catch (err) {
            console.error("Failed to delete feedback", err);
        }
    };

    const getInitial = (name) => (name || 'U').charAt(0).toUpperCase();
    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // ── Admin View: See all feedback ──
    if (isAdmin) {
        return (
            <div className="w-full bg-[#0a0a0a] min-h-[50vh]">
                <div className="max-w-md mx-auto p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <MessageCircle size={18} className="text-yellow-500" />
                            <h3 className="text-white font-bold text-sm">
                                Feedback ({feedbackList.length})
                            </h3>
                        </div>
                        {onClose && (
                            <button onClick={onClose} className="p-1.5 rounded-full bg-white/5 text-gray-400 hover:text-white">
                                <ChevronLeft size={18} />
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin text-yellow-500" size={24} />
                        </div>
                    ) : feedbackList.length === 0 ? (
                        <div className="text-center py-12">
                            <MessageCircle size={32} className="mx-auto mb-3 text-gray-700" />
                            <p className="text-gray-500 text-sm font-medium">No feedback yet</p>
                            <p className="text-gray-700 text-xs mt-1">Student feedback will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                            {feedbackList.map((fb) => (
                                <div key={fb._id} className="bg-[#121212] border border-white/5 rounded-xl p-4 group">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-7 h-7 rounded-full bg-yellow-600/30 flex items-center justify-center text-yellow-400 text-[10px] font-bold shrink-0">
                                            {getInitial(fb.user?.name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-white text-xs font-bold">{fb.user?.name || 'Unknown'}</span>
                                            <span className="text-gray-600 text-[10px] ml-2">{formatDate(fb.createdAt)}</span>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(fb._id)}
                                            className="text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                    <p className="text-gray-300 text-sm leading-relaxed">{fb.text}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── Student View: Submit feedback only ──
    if (!user) {
        return (
            <div className="w-full bg-[#0a0a0a] p-4">
                <div className="max-w-md mx-auto text-center py-8">
                    <MessageCircle size={32} className="mx-auto mb-3 text-gray-700" />
                    <p className="text-gray-500 text-sm">Log in to submit feedback</p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="w-full bg-[#0a0a0a] min-h-[40vh] flex items-center justify-center p-4">
                <div className="max-w-sm mx-auto text-center">
                    <div className="w-16 h-16 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center mx-auto mb-4">
                        <MessageCircle size={28} className="text-yellow-400" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">Thank You! 🙏</h3>
                    <p className="text-gray-400 text-sm mb-6">
                        Your feedback has been submitted. It helps us improve the course for everyone.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => {
                                setSubmitted(false);
                                setFeedbackText('');
                            }}
                            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors text-sm"
                        >
                            Send More
                        </button>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl transition-colors text-sm"
                            >
                                Close
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-[#0a0a0a] p-4">
            <div className="max-w-md mx-auto">
                <div className="flex items-center gap-2 mb-4">
                    <MessageCircle size={18} className="text-yellow-500" />
                    <h3 className="text-white font-bold text-sm">Send Feedback</h3>
                </div>

                <p className="text-gray-500 text-xs mb-4 leading-relaxed">
                    Have a suggestion or found an issue? Let us know — your feedback helps us improve!
                </p>

                <form onSubmit={handleSubmit} className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {getInitial(user.name)}
                    </div>
                    <div className="flex-1 flex gap-2">
                        <input
                            type="text"
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            placeholder="Share your feedback..."
                            className="flex-1 bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-yellow-500 outline-none transition-colors placeholder:text-gray-600"
                            maxLength={2000}
                        />
                        <button
                            type="submit"
                            disabled={!feedbackText.trim() || submitting}
                            className="bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-800 text-white p-2.5 rounded-xl transition-colors"
                        >
                            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                    </div>
                </form>

                <p className="text-gray-700 text-[10px] mt-3 text-center">
                    Your feedback is anonymous to other students and only visible to course admins.
                </p>
            </div>
        </div>
    );
};

export default FeedbackSection;
