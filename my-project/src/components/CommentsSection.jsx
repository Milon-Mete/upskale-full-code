import React, { useState, useEffect } from 'react';
import { Send, Trash2, MessageCircle, Loader2 } from 'lucide-react';
import { BASE_URL } from '../config';

const CommentsSection = ({ courseId, contentId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));

    const fetchComments = async () => {
        if (!courseId || !contentId || !user) return;
        try {
            const res = await fetch(`${BASE_URL}/engagement/comments/${courseId}/${contentId}`, {
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) setComments(data.comments);
        } catch (err) {
            console.error("Failed to fetch comments", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [courseId, contentId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        setSubmitting(true);
        try {
            const res = await fetch(`${BASE_URL}/engagement/comments/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    courseId,
                    contentId,
                    text: newComment.trim()
                })
            });
            const data = await res.json();
            if (data.success) {
                setComments(prev => [data.comment, ...prev]);
                setNewComment('');
            }
        } catch (err) {
            console.error("Failed to submit comment", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        try {
            const res = await fetch(`${BASE_URL}/engagement/comments/${commentId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                setComments(prev => prev.filter(c => c._id !== commentId));
            }
        } catch (err) {
            console.error("Failed to delete comment", err);
        }
    };

    const getInitial = (name) => (name || 'U').charAt(0).toUpperCase();

    return (
        <div className="w-full bg-[#0a0a0a] border-t border-white/5 p-4">
            <div className="max-w-md mx-auto">
                <div className="flex items-center gap-2 mb-4">
                    <MessageCircle size={18} className="text-emerald-500" />
                    <h3 className="text-white font-bold text-sm">Comments ({comments.length})</h3>
                </div>

                {/* Comment Input */}
                {user ? (
                    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {getInitial(user.name)}
                        </div>
                        <div className="flex-1 flex gap-2">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 bg-[#121212] border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:border-emerald-500 outline-none transition-colors placeholder:text-gray-600"
                                maxLength={1000}
                            />
                            <button
                                type="submit"
                                disabled={!newComment.trim() || submitting}
                                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 text-white p-2 rounded-xl transition-colors"
                            >
                                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            </button>
                        </div>
                    </form>
                ) : (
                    <p className="text-gray-500 text-xs mb-6 text-center">Log in to leave a comment</p>
                )}

                {/* Comments List */}
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="animate-spin text-emerald-500" size={24} />
                    </div>
                ) : comments.length === 0 ? (
                    <p className="text-gray-600 text-xs text-center py-8">No comments yet. Be the first!</p>
                ) : (
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                        {comments.map((comment) => (
                            <div key={comment._id} className="flex gap-2 group">
                                <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5">
                                    {getInitial(comment.user?.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-white text-xs font-bold">{comment.user?.name || 'Unknown'}</span>
                                        <span className="text-gray-600 text-[10px]">
                                            {new Date(comment.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <p className="text-gray-300 text-sm mt-0.5 break-words">{comment.text}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-gray-600 text-[10px]">{comment.replyCount || 0} replies</span>
                                        {(user?._id === comment.user?._id || user?.role === 'admin') && (
                                            <button
                                                onClick={() => handleDelete(comment._id)}
                                                className="text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentsSection;