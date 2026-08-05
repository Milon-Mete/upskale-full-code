import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bookmark, Search, Play, Video, Loader2, Lock, ArrowRight, BookOpen, Sparkles, ChevronRight } from 'lucide-react';
import { BASE_URL } from '../config';
import MobileBottomNav from '../components/MobileBottomNav';

const MyLibraryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [savedCourses, setSavedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLibraryLocked, setIsLibraryLocked] = useState(false);

  useEffect(() => {
    const fetchLibraryData = async () => {
      const savedVideoIds = JSON.parse(localStorage.getItem('saved_short_videos') || '[]');

      if (savedVideoIds.length === 0) {
        setLoading(false);
        return;
      }

      const userObj = JSON.parse(localStorage.getItem('user') || 'null');
      if (!userObj) {
        setLoading(false);
        return;
      }

      const isSubscribed = userObj?.biteSizeSubscription?.status === 'active' && new Date(userObj?.biteSizeSubscription?.expiresAt) > new Date();
      const isAdmin = userObj?.role === 'admin';
      const hasAccess = isSubscribed || isAdmin;

      if (!hasAccess) {
        setIsLibraryLocked(true);
        setLoading(false);
        return;
      }

      try {
        const publicRes = await fetch(`${BASE_URL}/bitesize-courses`);
        const publicCourses = await publicRes.json();

        const groupedData = [];

        for (const course of publicCourses) {
          try {
            const contentRes = await fetch(`${BASE_URL}/bitesize-courses/content/${course._id}`, {
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include'
            });

            if (contentRes.ok) {
              const contentData = await contentRes.json();
              const courseVideos = contentData.content || [];

              const savedInThisCourse = courseVideos
                .map((video, index) => ({ ...video, originalIndex: index }))
                .filter(video => savedVideoIds.includes(video._id));

              if (savedInThisCourse.length > 0) {
                groupedData.push({
                  courseId: course._id,
                  courseTitle: course.title,
                  courseSlug: course.slug,
                  videos: savedInThisCourse
                });
              }
            }
          } catch (err) {
            console.error(`Error fetching content for ${course.title}`, err);
          }
        }

        setSavedCourses(groupedData);
      } catch (err) {
        console.error("Error fetching library data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLibraryData();
  }, []);

  const playSavedVideo = (courseSlug, courseId, videoIndex) => {
    localStorage.setItem(`bitesize_progress_${courseId}`, videoIndex);
    navigate(`/bitesize/${courseSlug}`);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] right-[-20%] w-[350px] h-[350px] bg-[#008a45] opacity-[0.04] blur-[120px] rounded-full" />
      </div>

      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-[#050505]/90 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#008a45]/10 flex items-center justify-center">
              <Bookmark size={18} className="text-[#008a45]" />
            </div>
            <h1 className="text-lg font-bold text-white">My Library</h1>
          </div>
          <button className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <Search size={16} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 pb-28 pt-6 relative z-10">

        {loading ? (
          /* ── LOADING ── */
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="w-10 h-10 border-2 border-[#008a45] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 font-bold text-xs tracking-widest uppercase animate-pulse">Loading Library...</p>
          </div>

        ) : isLibraryLocked ? (

          /* ── LOCKED STATE ── */
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-500/20 to-amber-600/20 rounded-3xl flex items-center justify-center border border-yellow-500/20 shadow-lg shadow-yellow-500/5">
                <Lock size={44} className="text-yellow-500" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/30">
                <Sparkles size={16} className="text-black" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">Library Locked</h2>
            <p className="text-sm text-gray-400 max-w-[280px] leading-relaxed mb-8">
              Your PRO access has expired. Renew your plan to view your saved videos and continue learning.
            </p>
            <button
              onClick={() => navigate('/pro', { state: { returnTo: location.pathname } })}
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-black py-4 px-8 rounded-xl flex items-center justify-center gap-2 hover:from-yellow-400 hover:to-amber-400 transition-all active:scale-95 shadow-[0_0_25px_rgba(234,179,8,0.15)]"
            >
              Unlock PRO Access <ArrowRight size={18} />
            </button>
          </div>

        ) : savedCourses.length === 0 ? (

          /* ── EMPTY STATE ── */
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
            <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/[0.06]">
              <Bookmark size={48} strokeWidth={1.5} className="text-gray-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Your Library is Empty</h2>
            <p className="text-sm text-gray-400 max-w-[250px] leading-relaxed mb-8">
              Watch & save bite-sized content to access it here anytime.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-[#008a45] hover:bg-[#007038] text-white font-bold py-3.5 px-6 rounded-xl transition-all active:scale-95 text-sm"
            >
              Browse Content
            </button>
          </div>

        ) : (

          /* ── POPULATED STATE ── */
          <div className="space-y-8 animate-fade-in-up">
            {savedCourses.map((courseGroup) => (
              <div key={courseGroup.courseId}>
                {/* Course Header */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#008a45]/10 flex items-center justify-center">
                      <Video size={16} className="text-[#008a45]" />
                    </div>
                    <h2 className="text-base font-bold text-white">{courseGroup.courseTitle}</h2>
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold bg-white/5 px-2 py-0.5 rounded-full">
                    {courseGroup.videos.length}
                  </span>
                </div>

                {/* Horizontal Scrolling Video Cards */}
                <div className="flex overflow-x-auto gap-3 pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-4 px-4">
                  {courseGroup.videos.map((video) => (
                    <div
                      key={video._id}
                      onClick={() => playSavedVideo(courseGroup.courseSlug, courseGroup.courseId, video.originalIndex)}
                      className="relative w-40 h-64 md:w-44 md:h-72 rounded-2xl overflow-hidden shrink-0 snap-center cursor-pointer group border border-white/[0.06] hover:border-[#008a45]/40 transition-all duration-300 shadow-lg bg-[#121212]"
                    >
                      {/* Video Thumbnail */}
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] flex items-center justify-center">
                          <Video size={32} className="text-gray-600" />
                        </div>
                      )}

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent pointer-events-none" />

                      {/* Saved Badge */}
                      <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
                        <Bookmark size={12} className="text-white fill-white" />
                      </div>

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-[#008a45] w-12 h-12 rounded-full flex items-center justify-center pl-0.5 shadow-[0_0_25px_rgba(0,138,69,0.6)]">
                          <Play size={20} className="text-white fill-white ml-0.5" />
                        </div>
                      </div>

                      {/* Bottom Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-[9px] text-[#00a84d] font-bold uppercase tracking-wider bg-[#008a45]/10 px-1.5 py-0.5 rounded">
                            Lesson {video.originalIndex + 1}
                          </span>
                        </div>
                        <h3 className="text-white text-sm font-bold leading-tight line-clamp-2 drop-shadow-md">
                          {video.title}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="h-px bg-white/[0.03] w-full mt-6" />
              </div>
            ))}

            {/* Stats footer */}
            <div className="bg-[#121212] border border-white/[0.06] rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#008a45]/10 flex items-center justify-center">
                  <BookOpen size={16} className="text-[#008a45]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{savedCourses.length} Courses</p>
                  <p className="text-[10px] text-gray-500">{savedCourses.reduce((acc, g) => acc + g.videos.length, 0)} Saved Videos</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-500" />
            </div>
          </div>
        )}

      </div>
      <MobileBottomNav />
    </div>
  );
};

export default MyLibraryPage;
