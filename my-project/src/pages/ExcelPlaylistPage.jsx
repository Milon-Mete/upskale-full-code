import React, { useState, useEffect } from 'react';
import { 
  PlayCircle, CheckCircle2, ChevronDown, ChevronUp, 
  FileText, Download, Lock, Menu, X, ArrowLeft, Clock,
  HelpCircle, Award, Users, ArrowRight 
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { BASE_URL } from '../config';

const ExcelPlaylistPage = () => {
  const navigate = useNavigate();
  const { cohortId } = useParams(); 

  // --- STATE MANAGEMENT ---
  const [courseContent, setCourseContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notOwned, setNotOwned] = useState(false);
  
  const [activeModule, setActiveModule] = useState(0);
  const [activeLesson, setActiveLesson] = useState({ moduleIndex: 0, lessonIndex: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- QUIZ & CERTIFICATE STATE ---
  // Questions come from the server, which grades the attempt and issues the
  // certificate, so a pass can't be faked from the browser.
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quiz, setQuiz] = useState([]);
  const [quizError, setQuizError] = useState('');
  const [quizStep, setQuizStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [passMark, setPassMark] = useState(70);
  const [certificateUrl, setCertificateUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const authHeaders = () => {
      const token = localStorage.getItem('token');
      return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  };

  const getEmbedUrl = (videoId) => {
    if (!videoId) return "";
    if (videoId.includes("youtube.com/watch?v=")) {
        const id = videoId.split("v=")[1].split("&")[0];
        return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
    }
    if (videoId.startsWith("http://") || videoId.startsWith("https://")) {
        return videoId;
    }
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  };

  useEffect(() => {
    if (!cohortId) {
      setError("No Course ID provided in the URL.");
      setIsLoading(false);
      return; 
    }

    const fetchCohortData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token') || '';
        
        const response = await fetch(`${BASE_URL}/cohorts/content/${cohortId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '' 
            },
            credentials: 'include' 
        });
        
        // Logins last 7 days. A stale session still looks logged in on the site,
        // so send the student to sign in again and bring them back here.
        if (response.status === 401) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.dispatchEvent(new Event('storage'));
            sessionStorage.setItem('redirectAfterLogin', `/learn/${cohortId}`);
            navigate('/login', { replace: true });
            return;
        }
        if (response.status === 403) {
            setNotOwned(true);
            throw new Error("This account hasn't bought this course yet.");
        }
        if (!response.ok) throw new Error(`Server Error: ${response.status}`);

        const data = await response.json();
        
        if (data && data.content && data.content.length > 0) {
          setCourseContent(data.content);
        } else {
          setError("The videos for this course are being uploaded. They'll appear here as soon as they're ready.");
        }
      } catch (err) {
        setError(err.message || "Could not connect to the server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCohortData();
  }, [cohortId]);

  // --- QUIZ LOGIC HANDLERS ---
  const resetAttempt = (count) => {
      setQuizStep(0);
      setUserAnswers(Array(count).fill(null));
      setScore(0);
  };

  const openQuiz = async () => {
      setIsQuizOpen(true);
      setQuizError('');
      setQuiz([]);
      try {
          const res = await fetch(`${BASE_URL}/cohorts/quiz/${cohortId}`, { headers: authHeaders(), credentials: 'include' });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Could not load the quiz.');
          setPassMark(data.passMark || 70);
          setCertificateUrl(data.certificateUrl);
          setQuiz(data.questions);
          resetAttempt(data.questions.length);
      } catch (err) {
          setQuizError(err.message || 'Could not load the quiz. Please try again.');
      }
  };

  const handleAnswerSelect = (optionIndex) => {
      const newAnswers = [...userAnswers];
      newAnswers[quizStep] = optionIndex;
      setUserAnswers(newAnswers);
  };

  const nextQuestion = async () => {
      if (quizStep < quiz.length - 1) {
          setQuizStep(quizStep + 1);
          return;
      }
      setSubmitting(true);
      setQuizError('');
      try {
          const res = await fetch(`${BASE_URL}/cohorts/certificate/${cohortId}`, {
              method: 'POST', headers: authHeaders(), credentials: 'include',
              body: JSON.stringify({ answers: userAnswers })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Could not submit your answers.');
          setScore(data.score);
          if (data.certificateUrl) setCertificateUrl(data.certificateUrl);
          setQuizStep(quiz.length);
      } catch (err) {
          setQuizError(err.message || 'Could not submit your answers. Please try again.');
      } finally {
          setSubmitting(false);
      }
  };

  const handleLiveUpsell = () => {
      navigate(`/course/ms-excel-with-generative-ai-1771873408075`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-[#008a45] font-bold text-xl animate-pulse">Unlocking Course...</div>
      </div>
    );
  }

  if (error || courseContent.length === 0) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center flex-col gap-4 px-4 text-center">
        <Lock size={48} className="text-red-500 mb-2" />
        <div className="text-white font-bold text-xl max-w-md">{error || "No content found."}</div>
        {notOwned && (
            <p className="text-gray-400 text-sm max-w-md">
                Paid but can't see it? Make sure you're signed in with the same account you paid with, or restore it from your Profile with the payment id from your receipt.
            </p>
        )}
        {notOwned && (
            <button onClick={() => navigate('/profile')} className="px-6 py-2 bg-white text-black font-bold rounded-lg">
                Restore from Profile
            </button>
        )}
        <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-[#008a45] text-white font-bold rounded-lg hover:bg-[#007038] transition-colors">
            Go Back
        </button>
      </div>
    );
  }

  const currentVideo = courseContent[activeLesson.moduleIndex]?.lessons[activeLesson.lessonIndex];
  const quizDone = quiz.length > 0 && quizStep >= quiz.length;
  
  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans flex flex-col h-screen overflow-hidden relative">
      
      {/* --- 1. NAVBAR --- */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-4 md:px-6 bg-[#0a0a0a] z-50 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-400" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-sm md:text-base font-bold text-white tracking-wide">Course Player</h1>
            <span className="text-[10px] text-[#008a45] font-bold uppercase tracking-wider">Upskale Learning</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#008a45]/10 rounded-full border border-[#008a45]/20 text-[#008a45] text-xs font-bold">
            <CheckCircle2 size={14} />
            <span>0% Complete</span>
          </div>
          <button className="md:hidden p-2 text-gray-400 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* --- 2. MAIN LAYOUT --- */}
      <main className="flex-1 flex overflow-hidden relative z-10">
        
        {/* LEFT: Video Player Area */}
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-[#050505] relative w-full">
          
          <div className="w-full bg-black aspect-video relative group">
            {currentVideo?.videoId ? (
              <iframe
                className="absolute inset-0 w-full h-full"
                src={getEmbedUrl(currentVideo.videoId)}
                title={currentVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-2">
                <Lock size={32} />
                <span>No video link provided for this lesson.</span>
              </div>
            )}
          </div>

          <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
             <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 pb-6 border-b border-white/5">
                <div>
                   <h2 className="text-2xl font-bold text-white mb-2">{currentVideo?.title}</h2>
                   <p className="text-gray-400 text-sm">
                      Chapter {activeLesson.moduleIndex + 1} • Lesson {activeLesson.lessonIndex + 1}
                   </p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                    <button className="bg-white/5 hover:bg-[#008a45] hover:text-white border border-white/10 px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2">
                        <CheckCircle2 size={16} /> Mark as Complete
                    </button>
                    <button onClick={openQuiz} className="bg-gradient-to-r from-yellow-500 to-amber-600 text-black px-6 py-2.5 rounded-lg font-black text-sm transition-all flex items-center gap-2 hover:scale-105 shadow-lg shadow-yellow-500/20">
                        <HelpCircle size={16} /> {certificateUrl ? 'View My Certificate' : 'Take Quiz & Certify'}
                    </button>
                </div>
             </div>

             <div className="space-y-8">
                <div>
                   <h3 className="text-lg font-bold text-white mb-3">About this Lesson</h3>
                   <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                      In this module, we dive deep into the core concepts. Make sure to download the resources below to follow along.
                   </p>
                </div>

                {currentVideo?.resources && currentVideo.resources.length > 0 && (
                  <div>
                     <h3 className="text-lg font-bold text-white mb-3">Resources</h3>
                     <div className="grid md:grid-cols-2 gap-4">
                        {currentVideo.resources.map((resource, idx) => (
                          <a href={resource.url} target="_blank" rel="noreferrer" key={idx} className="bg-[#111] border border-white/5 p-4 rounded-xl flex items-center justify-between group hover:border-[#008a45]/50 transition-colors cursor-pointer">
                             <div className="flex items-center gap-3">
                                <div className="bg-green-900/20 p-2 rounded-lg text-green-500"><FileText size={20} /></div>
                                <div><div className="text-sm font-bold text-white">{resource.title}</div></div>
                             </div>
                             <Download size={18} className="text-gray-500 group-hover:text-white" />
                          </a>
                        ))}
                     </div>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* RIGHT: Playlist Sidebar */}
        <aside className={`absolute inset-y-0 right-0 w-full md:w-96 bg-[#0a0a0a] border-l border-white/10 transform transition-transform duration-300 z-40 flex flex-col ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 md:relative`}>
           <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0a0a0a]">
              <h3 className="font-bold text-white">Course Content</h3>
              <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-gray-400"><X /></button>
           </div>
           <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              {courseContent.map((module, mIndex) => (
                 <div key={mIndex} className="mb-2">
                    <button onClick={() => setActiveModule(activeModule === mIndex ? null : mIndex)} className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${activeModule === mIndex ? 'bg-white/5 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
                       <div className="flex flex-col items-start text-left">
                          <span className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">Module {mIndex + 1}</span>
                          <span className="text-sm font-bold line-clamp-1">{module.chapterTitle}</span>
                       </div>
                       {activeModule === mIndex ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {activeModule === mIndex && (
                       <div className="mt-2 space-y-1 pl-2">
                          {module.lessons.map((lesson, lIndex) => {
                             const isActive = activeLesson.moduleIndex === mIndex && activeLesson.lessonIndex === lIndex;
                             return (
                                <div key={lIndex} onClick={() => { setActiveLesson({ moduleIndex: mIndex, lessonIndex: lIndex }); setMobileMenuOpen(false); }} className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer border border-transparent transition-all ${isActive ? 'bg-[#008a45]/10 border-[#008a45]/30' : 'hover:bg-white/5 hover:border-white/5'}`}>
                                   <div className="mt-1">
                                      {isActive ? <PlayCircle size={16} className="text-[#008a45] fill-[#008a45]/20" /> : <div className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center">{lesson.isFreePreview && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>}</div>}
                                   </div>
                                   <div>
                                      <h4 className={`text-sm font-medium leading-snug mb-1 ${isActive ? 'text-[#008a45]' : 'text-gray-300'}`}>{lesson.title}</h4>
                                      <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono"><Clock size={10} /> {lesson.duration || "00:00"}</div>
                                   </div>
                                </div>
                             );
                          })}
                       </div>
                    )}
                 </div>
              ))}
           </div>
        </aside>
      </main>

      {/* --- QUIZ MODAL --- */}
      {isQuizOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsQuizOpen(false)}></div>
              <div className="w-full max-w-2xl bg-[#121212] border border-white/10 rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/50">
                      <div>
                          <h2 className="font-black text-xl text-white">Certification Quiz</h2>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">Score {passMark}% or more to earn your certificate</p>
                      </div>
                      <button onClick={() => setIsQuizOpen(false)} className="text-gray-500 hover:text-white bg-white/5 p-2 rounded-full transition-colors">
                          <X size={20} />
                      </button>
                  </div>

                  <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
                      {quiz.length === 0 ? (
                          <div className="text-center py-10">
                              {quizError ? (
                                  <>
                                      <p className="text-white font-bold mb-4">{quizError}</p>
                                      <button onClick={openQuiz} className="px-6 py-3 bg-yellow-500 text-black font-black rounded-xl">Try again</button>
                                  </>
                              ) : (
                                  <p className="text-gray-400 animate-pulse">Loading quiz...</p>
                              )}
                          </div>
                      ) : certificateUrl && !quizDone && quizStep === 0 && userAnswers.every((a) => a === null) ? (
                          <div className="text-center py-4">
                              <div className="w-24 h-24 bg-[#008a45]/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#008a45]/50">
                                  <Award className="text-[#00d26a]" size={48} />
                              </div>
                              <h3 className="text-2xl font-black text-white mb-2">You're already certified</h3>
                              <p className="text-gray-400 mb-8">Your certificate has its own verification link you can share.</p>
                              <button onClick={() => navigate(certificateUrl)} className="w-full py-4 bg-white text-black font-black rounded-xl hover:bg-gray-200 transition-all active:scale-95">
                                  View &amp; Download Certificate
                              </button>
                          </div>
                      ) : !quizDone ? (
                          <div className="animate-fade-in">
                              <div className="flex justify-between items-center mb-6">
                                  <span className="text-yellow-500 font-bold text-sm tracking-widest uppercase">Question {quizStep + 1} of {quiz.length}</span>
                                  <div className="h-2 w-32 bg-gray-800 rounded-full overflow-hidden">
                                      <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: `${((quizStep + 1) / quiz.length) * 100}%` }}></div>
                                  </div>
                              </div>
                              <h3 className="text-xl md:text-2xl font-semibold text-white mb-8 leading-relaxed">
                                  {quiz[quizStep].question}
                              </h3>
                              <div className="space-y-4">
                                  {quiz[quizStep].options.map((option, idx) => (
                                      <button
                                          key={idx}
                                          onClick={() => handleAnswerSelect(idx)}
                                          className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${userAnswers[quizStep] === idx ? 'border-yellow-500 bg-yellow-500/10 text-white' : 'border-white/10 text-gray-400 hover:border-white/30 hover:bg-white/5'}`}
                                      >
                                          <span className="font-bold mr-4 opacity-50">{['A', 'B', 'C', 'D'][idx]}.</span> {option}
                                      </button>
                                  ))}
                              </div>
                              {quizError && <p className="text-red-400 text-sm mt-4">{quizError}</p>}
                          </div>
                      ) : score >= passMark ? (
                          <div className="text-center animate-fade-in-up py-4">
                              <div className="w-24 h-24 bg-[#008a45]/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#008a45]/50">
                                  <Award className="text-[#00d26a]" size={48} />
                              </div>
                              <h3 className="text-3xl font-black text-white mb-2">You Passed!</h3>
                              <p className="text-gray-400 mb-8">Score: <span className="text-[#00d26a] font-bold">{score}%</span></p>
                              <button onClick={() => navigate(certificateUrl)} disabled={!certificateUrl} className="w-full py-4 bg-white text-black font-black rounded-xl hover:bg-gray-200 transition-all mb-6 active:scale-95 disabled:opacity-50">
                                  View &amp; Download Certificate
                              </button>

                              <div className="h-px w-full border-b border-dashed border-white/10 mb-8 relative">
                                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#121212] px-4 text-xs text-gray-500 font-bold uppercase tracking-widest">Wait, there's more</span>
                              </div>

                              <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-2xl p-6 text-left relative overflow-hidden">
                                  <div className="absolute -right-10 -top-10 opacity-10"><Users size={120}/></div>
                                  <h4 className="text-xl font-bold text-white mb-2 relative z-10">Want 1:1 Live Teaching?</h4>
                                  <p className="text-gray-300 text-sm mb-6 relative z-10">Upgrade to the Live Cohort for personal mentorship, live Q&amp;A, and resume building.</p>
                                  <button onClick={handleLiveUpsell} className="relative z-10 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-purple-600/30 w-full sm:w-auto flex items-center justify-center gap-2">
                                      View Live Course <ArrowRight size={16}/>
                                  </button>
                              </div>
                          </div>
                      ) : (
                          <div className="text-center animate-fade-in-up py-4">
                              <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
                                  <X className="text-red-500" size={48} />
                              </div>
                              <h3 className="text-3xl font-black text-white mb-2">Keep Learning</h3>
                              <p className="text-gray-400 mb-8">Score: <span className="text-red-500 font-bold">{score}%</span> ({passMark}% required to pass)</p>
                              <button onClick={() => resetAttempt(quiz.length)} className="w-full py-4 bg-[#1a1a1a] border border-white/10 text-white font-bold rounded-xl hover:bg-white/5 transition-all">
                                  Retake Quiz
                              </button>
                          </div>
                      )}
                  </div>

                  {quiz.length > 0 && !quizDone && !(certificateUrl && quizStep === 0 && userAnswers.every((a) => a === null)) && (
                      <div className="p-6 border-t border-white/10 bg-black/50">
                          <button
                              onClick={nextQuestion}
                              disabled={userAnswers[quizStep] === null || submitting}
                              className="w-full py-4 bg-yellow-500 text-black font-black rounded-xl hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2 active:scale-95"
                          >
                              {submitting ? 'Checking...' : quizStep === quiz.length - 1 ? 'Submit Final Answers' : 'Next Question'} <ArrowRight size={18} />
                          </button>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default ExcelPlaylistPage;