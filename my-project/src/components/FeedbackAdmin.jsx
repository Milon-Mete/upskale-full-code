import React, { useState, useEffect } from 'react';
import { 
    MessageCircle, Trash2, Loader2, Search, ChevronDown, ChevronUp,
    BookOpen, Clock, User, ExternalLink, Archive, RefreshCw
} from 'lucide-react';
import { BASE_URL } from '../config';

const FeedbackAdmin = () => {
    const [feedbackData, setFeedbackData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalFeedback, setTotalFeedback] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCourse, setExpandedCourse] = useState(null);
    const [expandedFeedback, setExpandedFeedback] = useState(null);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const fetchFeedback = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${BASE_URL}/engagement/feedback/admin/all`, {
                credentials: 'include'
            });
            if (!res.ok) {
                if (res.status === 403) setError("Admin access required.");
                else setError("Failed to load feedback.");
                return;
            }
            const data = await res.json();
            if (data.success) {
                setFeedbackData(data.courses || []);
                setTotalFeedback(data.totalFeedback || 0);
            }
        } catch (err) {
            setError("Network error. Check connection.");
            console.error("Failed to fetch feedback", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, []);

    const handleDelete = async (feedbackId) => {
        if (!window.confirm("Delete this feedback? This cannot be undone.")) return;
        setDeletingId(feedbackId);
        try {
            const res = await fetch(`${BASE_URL}/engagement/feedback/${feedbackId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                // Remove from local state
                setFeedbackData(prev => {
                    const updated = prev.map(group => ({
                        ...group,
                        feedback: group.feedback.filter(f => f._id !== feedbackId)
                    })).filter(group => group.feedback.length > 0);
                    return updated;
                });
                setTotalFeedback(prev => prev - 1);
            }
        } catch (err) {
            console.error("Failed to delete feedback", err);
        } finally {
            setDeletingId(null);
        }
    };

    const toggleCourse = (courseId) => {
        setExpandedCourse(prev => prev === courseId ? null : courseId);
        setExpandedFeedback(null);
    };

    const toggleFeedbackDetail = (fbId) => {
        setExpandedFeedback(prev => prev === fbId ? null : fbId);
    };

    // Filter by course title
    const filteredData = searchQuery.trim()
        ? feedbackData.filter(group => 
            group.course?.title?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : feedbackData;

    const getInitial = (name) => (name || 'U').charAt(0).toUpperCase();
    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { 
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit' 
        });
    };

    return (
        <div className="p-2 md:p-4">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <MessageCircle size={24} className="text-yellow-500" />
                    <h2 className="text-xl md:text-2xl font-black text-white">Student Feedback</h2>
                    <span className="px-2.5 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-bold rounded-full">
                        {totalFeedback} total
                    </span>
                </div>
                <p className="text-gray-500 text-sm">
                    View and manage feedback submitted by students across all courses.
                </p>
            </div>

            {/* Search & Refresh */}
            <div className="flex gap-3 mb-6">
                <div className="flex-1 relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by course name..."
                        className="w-full bg-black border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:border-yellow-500 outline-none transition-all placeholder:text-gray-600"
                    />
                </div>
                <button
                    onClick={fetchFeedback}
                    disabled={loading}
                    className="px-4 py-2.5 bg-[#121212] border border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-white/20 transition-all flex items-center gap-2"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    <span className="hidden sm:inline text-sm font-medium">Refresh</span>
                </button>
            </div>

            {/* Error State */}
            {error && (
                <div className="text-center py-12">
                    <Archive size={40} className="mx-auto mb-3 text-red-500/50" />
                    <p className="text-red-400 font-bold mb-2">{error}</p>
                    <button onClick={fetchFeedback} className="text-sm text-yellow-500 hover:text-yellow-400 underline">
                        Try again
                    </button>
                </div>
            )}

            {/* Loading */}
            {loading && !error && (
                <div className="flex justify-center py-16">
                    <div className="text-center">
                        <Loader2 className="animate-spin text-yellow-500 mx-auto mb-3" size={32} />
                        <p className="text-gray-500 text-sm">Loading feedback...</p>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredData.length === 0 && (
                <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                        <MessageCircle size={28} className="text-yellow-500/50" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">
                        {searchQuery ? 'No matching courses' : 'No feedback yet'}
                    </h3>
                    <p className="text-gray-500 text-sm">
                        {searchQuery 
                            ? 'Try a different search term.'
                            : 'Student feedback will appear here once they submit it.'}
                    </p>
                </div>
            )}

            {/* Feedback List Grouped by Course */}
            {!loading && !error && filteredData.length > 0 && (
                <div className="space-y-4">
                    {filteredData.map((group) => {
                        const course = group.course || {};
                        const isExpanded = expandedCourse === (course._id || 'unknown');
                        const feedbackList = group.feedback || [];

                        return (
                            <div 
                                key={course._id || Math.random()}
                                className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden transition-all hover:border-white/10"
                            >
                                {/* Course Header */}
                                <button
                                    onClick={() => toggleCourse(course._id)}
                                    className="w-full flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors text-left"
                                >
                                    {/* Course Image */}
                                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-[#0a0a0a] border border-white/5">
                                        {course.image ? (
                                            <img src={course.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <BookOpen size={18} className="text-gray-600" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Course Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-bold text-sm truncate">
                                            {course.title || 'Unknown Course'}
                                        </h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1 text-[10px] text-gray-500">
                                                <MessageCircle size={10} />
                                                {feedbackList.length} feedback
                                            </span>
                                            <span className="flex items-center gap-1 text-[10px] text-gray-500">
                                                <User size={10} />
                                                {new Set(feedbackList.map(f => f.user?._id)).size} students
                                            </span>
                                        </div>
                                    </div>

                                    {/* Expand/Collapse */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-xs text-gray-500">
                                            {isExpanded ? 'Hide' : 'View'}
                                        </span>
                                        {isExpanded ? (
                                            <ChevronUp size={16} className="text-gray-500" />
                                        ) : (
                                            <ChevronDown size={16} className="text-gray-500" />
                                        )}
                                    </div>
                                </button>

                                {/* Feedback List */}
                                {isExpanded && (
                                    <div className="border-t border-white/5">
                                        {feedbackList.length === 0 ? (
                                            <p className="text-gray-600 text-xs text-center py-6">No entries</p>
                                        ) : (
                                            <div className="divide-y divide-white/5">
                                                {feedbackList.map((fb) => {
                                                    const isDetailOpen = expandedFeedback === fb._id;
                                                    const isDeleting = deletingId === fb._id;

                                                    return (
                                                        <div key={fb._id} className="group">
                                                            {/* Feedback Summary */}
                                                            <div 
                                                                onClick={() => toggleFeedbackDetail(fb._id)}
                                                                className="flex items-start gap-3 p-4 hover:bg-white/[0.02] cursor-pointer transition-colors"
                                                            >
                                                                {/* User Avatar */}
                                                                <div className="w-8 h-8 rounded-full bg-yellow-600/20 flex items-center justify-center text-yellow-400 text-xs font-bold shrink-0">
                                                                    {getInitial(fb.user?.name)}
                                                                </div>

                                                                {/* Content */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-0.5">
                                                                        <span className="text-white text-xs font-bold">
                                                                            {fb.user?.name || 'Anonymous'}
                                                                        </span>
                                                                        <span className="text-[10px] text-gray-500">
                                                                            {formatDate(fb.createdAt)}
                                                                        </span>
                                                                    </div>
                                                                    <p className={`text-sm text-gray-400 leading-relaxed ${
                                                                        isDetailOpen ? '' : 'line-clamp-2'
                                                                    }`}>
                                                                        {fb.text}
                                                                    </p>
                                                                </div>

                                                                {/* Delete */}
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDelete(fb._id);
                                                                    }}
                                                                    disabled={isDeleting}
                                                                    className="p-1.5 rounded-lg text-gray-600 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                                                                >
                                                                    {isDeleting 
                                                                        ? <Loader2 size={14} className="animate-spin" />
                                                                        : <Trash2 size={14} />
                                                                    }
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Footer Stats */}
            {!loading && feedbackData.length > 0 && (
                <div className="mt-8 p-4 bg-[#121212] border border-white/5 rounded-xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-black text-yellow-500">{totalFeedback}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Feedback</p>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-emerald-400">{feedbackData.length}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Courses</p>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-blue-400">
                                {new Set(feedbackData.flatMap(g => g.feedback.map(f => f.user?._id))).size}
                            </p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Students</p>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-purple-400">
                                {feedbackData.length > 0 
                                    ? Math.round(totalFeedback / feedbackData.length) 
                                    : 0}
                            </p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Avg / Course</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedbackAdmin;
