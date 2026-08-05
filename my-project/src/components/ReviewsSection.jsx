import React, { useState, useEffect } from 'react';
import { Star, Loader2, MessageCircle } from 'lucide-react';
import { BASE_URL } from '../config';

const ReviewsSection = ({ courseId }) => {
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [userComment, setUserComment] = useState('');
    const [hoveredStar, setHoveredStar] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));

    const fetchReviews = async () => {
        if (!courseId) return;
        try {
            const res = await fetch(`${BASE_URL}/engagement/reviews/${courseId}`);
            const data = await res.json();
            if (data.success) {
                setReviews(data.reviews || []);
                setAverageRating(data.averageRating || 0);
                setTotalReviews(data.totalReviews || 0);

                // Check if current user already reviewed
                if (user) {
                    const myReview = (data.reviews || []).find(r => r.user?._id === user._id);
                    if (myReview) {
                        setUserRating(myReview.rating);
                        setUserComment(myReview.comment || '');
                        setSubmitted(true);
                    }
                }
            }
        } catch (err) {
            console.error("Failed to fetch reviews", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [courseId]);

    const handleSubmitReview = async () => {
        if (userRating === 0) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${BASE_URL}/engagement/review/${courseId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ rating: userRating, comment: userComment })
            });
            const data = await res.json();
            if (data.success) {
                setSubmitted(true);
                setAverageRating(data.averageRating);
                setTotalReviews(data.totalReviews);
                fetchReviews();
            }
        } catch (err) {
            console.error("Failed to submit review", err);
        } finally {
            setSubmitting(false);
        }
    };

    const getInitial = (name) => (name || 'U').charAt(0).toUpperCase();

    return (
        <div className="w-full bg-[#0a0a0a] border-t border-white/5 p-4 pb-8">
            <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Star size={18} className="text-yellow-500 fill-yellow-500" />
                        <h3 className="text-white font-bold text-sm">Rate this Course</h3>
                    </div>
                    {totalReviews > 0 && (
                        <div className="flex items-center gap-1 text-sm">
                            <span className="text-yellow-500 font-bold">{averageRating}</span>
                            <span className="text-gray-500">({totalReviews})</span>
                        </div>
                    )}
                </div>

                {/* Rating Input */}
                {user && !submitted ? (
                    <div className="bg-[#121212] border border-white/10 rounded-xl p-4 mb-6">
                        {/* Stars */}
                        <div className="flex items-center gap-1 mb-3">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => setUserRating(star)}
                                    onMouseEnter={() => setHoveredStar(star)}
                                    onMouseLeave={() => setHoveredStar(0)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        size={28}
                                        className={`${
                                            (hoveredStar || userRating) >= star
                                                ? 'text-yellow-500 fill-yellow-500'
                                                : 'text-gray-600'
                                        } transition-colors`}
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Comment */}
                        <textarea
                            value={userComment}
                            onChange={(e) => setUserComment(e.target.value)}
                            placeholder="Share your experience (optional)..."
                            rows={2}
                            maxLength={500}
                            className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none transition-colors placeholder:text-gray-600 resize-none mb-3"
                        />

                        <button
                            onClick={handleSubmitReview}
                            disabled={userRating === 0 || submitting}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 text-white font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            {submitting ? <Loader2 size={16} className="animate-spin" /> : <>Submit Rating</>}
                        </button>
                    </div>
                ) : submitted && user ? (
                    <div className="bg-[#121212] border border-emerald-500/20 rounded-xl p-4 mb-6 text-center">
                        <Star size={24} className="text-yellow-500 fill-yellow-500 mx-auto mb-1" />
                        <p className="text-emerald-400 text-sm font-bold">You rated {userRating}/5</p>
                        <p className="text-gray-500 text-xs mt-1">Thanks for your feedback!</p>
                    </div>
                ) : (
                    <p className="text-gray-500 text-xs mb-6 text-center">Log in to rate this course</p>
                )}

                {/* Reviews List */}
                {loading ? (
                    <div className="flex justify-center py-4">
                        <Loader2 className="animate-spin text-emerald-500" size={20} />
                    </div>
                ) : reviews.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                        {reviews.map((review, idx) => (
                            <div key={review._id || idx} className="flex gap-2 bg-[#121212] p-3 rounded-xl border border-white/5">
                                <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5">
                                    {getInitial(review.user?.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-white text-xs font-bold">{review.user?.name || 'Anonymous'}</span>
                                        <div className="flex items-center gap-0.5">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star key={star} size={10} className={star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'} />
                                            ))}
                                        </div>
                                    </div>
                                    {review.comment && (
                                        <p className="text-gray-400 text-xs mt-1">{review.comment}</p>
                                    )}
                                    <p className="text-gray-600 text-[10px] mt-1">
                                        {new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600 text-xs text-center py-4">No reviews yet. Be the first to rate!</p>
                )}
            </div>
        </div>
    );
};

export default ReviewsSection;