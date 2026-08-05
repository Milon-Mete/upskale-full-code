import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Save, X, DollarSign, LayoutDashboard, Trash2, 
  Video, FolderOpen, Layers, Eye, EyeOff, CreditCard, ChevronDown, CheckSquare
} from 'lucide-react';
import { BASE_URL } from '../config';

const CourseManager = () => {
  const [courses, setCourses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // --- SECURITY HEADERS ---
  const getAdminHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return { 'Content-Type': 'application/json', 'user-id': user._id };
  };

  // --- INITIAL STATE ---
  const initialForm = {
    _id: null,
    title: '', 
    category: 'bitsize', 
    priceRecorded: '', priceOriginal: '', priceLive: '', 
    installmentEnabled: false,
    installmentPricePart1: '', 
    installmentPricePart2: '', 
    thumbnail: '', demoVideoUrl: '', description: '',
    tags: '', level: 'Beginner', language: 'English',
    liveStartDate: '', isPublished: false, 
    content: [] 
  };

  const [formData, setFormData] = useState(initialForm);
  const [tempChapterTitle, setTempChapterTitle] = useState('');
  const [tempLesson, setTempLesson] = useState({ title: '', videoId: '', duration: '', isFreePreview: false });
  const [activeChapterIndex, setActiveChapterIndex] = useState(null); 

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${BASE_URL}/courses/admin/all`, { headers: getAdminHeaders() });
      const data = await res.json();
      const formatted = (Array.isArray(data) ? data : []).map(c => ({
          ...initialForm,
          ...c,
          priceRecorded: c.pricing?.recorded || '',
          priceOriginal: c.pricing?.original || '',
          priceLive: c.pricing?.live || '',
          installmentEnabled: c.pricing?.installment?.enabled || false,
          installmentPricePart1: c.pricing?.installment?.pricePart1 || '',
          installmentPricePart2: c.pricing?.installment?.pricePart2 || '',
          liveStartDate: c.liveStartDate ? c.liveStartDate.split('T')[0] : '',
          tags: c.tags ? c.tags.join(', ') : '', 
          content: c.content || []
      }));
      setCourses(formatted);
    } catch (err) { console.error("Fetch Error", err); }
  };

  const addChapter = () => {
    if (!tempChapterTitle.trim()) return;
    setFormData({ ...formData, content: [...formData.content, { chapterTitle: tempChapterTitle, lessons: [] }] });
    setTempChapterTitle('');
  };
  const removeChapter = (idx) => setFormData({ ...formData, content: formData.content.filter((_, i) => i !== idx) });

  const addLesson = (chapterIndex) => {
    if (!tempLesson.title.trim() || !tempLesson.videoId.trim()) return;
    const newContent = [...formData.content];
    newContent[chapterIndex].lessons.push(tempLesson);
    setFormData({ ...formData, content: newContent });
    setTempLesson({ title: '', videoId: '', duration: '', isFreePreview: false }); 
    setActiveChapterIndex(null); 
  };
  const removeLesson = (chapterIndex, lessonIndex) => {
    const newContent = [...formData.content];
    newContent[chapterIndex].lessons = newContent[chapterIndex].lessons.filter((_, i) => i !== lessonIndex);
    setFormData({ ...formData, content: newContent });
  };

  const handleEdit = (item) => { setFormData(item); setIsEditing(true); };
  const handleDelete = async (id) => {
    if(!window.confirm("Delete this course?")) return;
    try {
        const res = await fetch(`${BASE_URL}/courses/admin/delete/${id}`, { 
            method: 'DELETE', headers: getAdminHeaders() 
        });
        if (res.ok) fetchCourses();
    } catch(err) { alert("Delete failed"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = formData._id ? `${BASE_URL}/courses/admin/update/${formData._id}` : `${BASE_URL}/courses/admin/create`;
    const method = formData._id ? 'PUT' : 'POST';
    const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        pricing: { 
            recorded: Number(formData.priceRecorded) || 0, 
            original: Number(formData.priceOriginal) || 0, 
            live: Number(formData.priceLive) || 0,
            installment: {
                enabled: formData.installmentEnabled,
                pricePart1: Number(formData.installmentPricePart1) || 0,
                pricePart2: Number(formData.installmentPricePart2) || 0,
                totalParts: 2
            }
        }
    };

    try {
        const res = await fetch(url, { method, headers: getAdminHeaders(), body: JSON.stringify(payload) });
        if (res.ok) {
            alert(formData._id ? "Updated!" : "Created!");
            setIsEditing(false);
            setFormData(initialForm);
            fetchCourses();
        } else { alert("Error"); }
    } catch (err) { alert("Network Error"); }
  };

  // --- REUSABLE MOBILE INPUT STYLE ---
  const inputStyle = "w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:border-[#008a45] outline-none transition-colors placeholder:text-gray-700";
  const labelStyle = "block text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-wider";

  return (
    <div className="pb-24 md:pb-0">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-3xl font-black text-white">Manager</h2>
            {!isEditing && (
                <button onClick={() => { setIsEditing(true); setFormData(initialForm); }} className="bg-[#008a45] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm shadow-lg shadow-green-900/20">
                    <Plus size={16} /> New <span className="hidden md:inline">Course</span>
                </button>
            )}
        </div>

        {isEditing ? (
            <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                    <h3 className="text-lg font-bold text-green-500">{formData._id ? 'Edit Course' : 'Create New'}</h3>
                    <button onClick={() => setIsEditing(false)} className="bg-white/5 p-2 rounded-full text-gray-400 hover:text-white"><X size={18}/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* 1. INFO CARD */}
                    <div className="space-y-3">
                        <div>
                            <label className={labelStyle}>Course Title</label>
                            <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className={inputStyle} placeholder="Ex: Full Stack Mastery" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelStyle}>Category</label>
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className={inputStyle}>
                                    <option value="bitsize">Bitsize</option>
                                    <option value="cohort">Cohort</option>
                                    <option value="comprehensive">Bundle</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelStyle}>Level</label>
                                <select value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })} className={inputStyle}>
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Medium</option>
                                    <option value="Advanced">Pro</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className={labelStyle}>Description</label>
                            <textarea rows="2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className={inputStyle} placeholder="Short description..." />
                        </div>

                        <div>
                            <label className={labelStyle}>Tags</label>
                            <input type="text" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} className={inputStyle} placeholder="React, JS, CSS" />
                        </div>
                    </div>

                    <div className="h-px bg-white/5 my-2"></div>

                    {/* 2. MEDIA CARD */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-white flex items-center gap-2 mb-2"><Video size={14} className="text-[#008a45]"/> Media</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className={labelStyle}>Thumbnail URL</label>
                                <input type="text" required value={formData.thumbnail} onChange={e => setFormData({ ...formData, thumbnail: e.target.value })} className={inputStyle} placeholder="https://..." />
                            </div>
                            <div>
                                <label className={labelStyle}>Demo Video URL</label>
                                <input type="text" value={formData.demoVideoUrl} onChange={e => setFormData({ ...formData, demoVideoUrl: e.target.value })} className={inputStyle} placeholder="https://youtube..." />
                            </div>
                        </div>
                        <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5 mt-2">
                            <input type="checkbox" checked={formData.isPublished} onChange={e => setFormData({...formData, isPublished: e.target.checked})} className="w-5 h-5 accent-green-500 rounded"/>
                            <div>
                                <span className="block text-sm font-bold text-white">Publish Now</span>
                                <span className="block text-[10px] text-gray-500">Visible to students</span>
                            </div>
                        </label>
                    </div>

                    <div className="h-px bg-white/5 my-2"></div>

                    {/* 3. PRICING CARD */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-white flex items-center gap-2 mb-2"><DollarSign size={14} className="text-yellow-500"/> Pricing</h4>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className={labelStyle}>Original</label>
                                <input type="number" value={formData.priceOriginal} onChange={e => setFormData({...formData, priceOriginal: e.target.value})} className={inputStyle} placeholder="₹" />
                            </div>
                            <div>
                                <label className={labelStyle}>Selling</label>
                                <input type="number" required value={formData.priceRecorded} onChange={e => setFormData({...formData, priceRecorded: e.target.value})} className={`${inputStyle} border-green-500/30 text-green-400`} placeholder="₹" />
                            </div>
                            <div>
                                <label className={labelStyle}>Live (Opt)</label>
                                <input type="number" value={formData.priceLive} onChange={e => setFormData({...formData, priceLive: e.target.value})} className={inputStyle} placeholder="₹" />
                            </div>
                        </div>

                        {/* Installment Toggle */}
                        <div className="bg-yellow-500/5 rounded-lg border border-yellow-500/20 p-3 mt-2">
                            <label className="flex items-center gap-2 mb-3 cursor-pointer">
                                <input type="checkbox" checked={formData.installmentEnabled} onChange={e => setFormData({...formData, installmentEnabled: e.target.checked})} className="w-4 h-4 accent-yellow-500"/>
                                <span className="text-xs font-bold text-yellow-500">Enable 2-Part Payment</span>
                            </label>
                            
                            {formData.installmentEnabled && (
                                <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                                    <div>
                                        <label className="text-[9px] text-yellow-500/70 uppercase font-bold block mb-1">Part 1 (Now)</label>
                                        <input type="number" value={formData.installmentPricePart1} onChange={e => setFormData({...formData, installmentPricePart1: e.target.value})} className="w-full bg-black border border-yellow-500/30 rounded px-2 py-2 text-sm text-white focus:border-yellow-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[9px] text-yellow-500/70 uppercase font-bold block mb-1">Part 2 (Later)</label>
                                        <input type="number" value={formData.installmentPricePart2} onChange={e => setFormData({...formData, installmentPricePart2: e.target.value})} className="w-full bg-black border border-yellow-500/30 rounded px-2 py-2 text-sm text-white focus:border-yellow-500 outline-none" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="h-px bg-white/5 my-2"></div>

                    {/* 4. CURRICULUM CARD */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Layers size={14} /> Curriculum
                        </h3>
                        
                        {/* Chapters List */}
                        <div className="space-y-3">
                            {formData.content.map((chapter, cIdx) => (
                                <div key={cIdx} className="bg-white/5 border border-white/5 rounded-xl overflow-hidden">
                                    <div className="p-3 flex justify-between items-center bg-white/5">
                                        <h4 className="font-bold text-white text-sm flex items-center gap-2 truncate">
                                            <FolderOpen size={14} className="text-blue-400 shrink-0"/> {chapter.chapterTitle}
                                        </h4>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <button type="button" onClick={() => setActiveChapterIndex(activeChapterIndex === cIdx ? null : cIdx)} className="text-xs text-green-400 font-bold bg-green-500/10 px-2 py-1 rounded border border-green-500/20">+ Add</button>
                                            <button type="button" onClick={() => removeChapter(cIdx)} className="text-red-500"><Trash2 size={14}/></button>
                                        </div>
                                    </div>

                                    {/* Lessons List */}
                                    <div className="space-y-1 p-1">
                                        {chapter.lessons.length === 0 && <p className="text-[10px] text-gray-600 p-2 italic text-center">No lessons yet.</p>}
                                        {chapter.lessons.map((lesson, lIdx) => (
                                            <div key={lIdx} className="flex justify-between items-center p-2 rounded bg-black/40 hover:bg-black/60 text-xs text-gray-300 mx-1">
                                                <div className="flex-1 truncate pr-2">
                                                    <div className="font-bold text-white truncate">{lesson.title}</div>
                                                    <div className="text-[10px] text-gray-500 flex gap-2">
                                                        <span>{lesson.duration}</span>
                                                        {lesson.isFreePreview && <span className="text-blue-400">Preview</span>}
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => removeLesson(cIdx, lIdx)} className="text-gray-600 hover:text-red-500 p-1"><X size={12}/></button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add Lesson Form (Stacked for Mobile) */}
                                    {activeChapterIndex === cIdx && (
                                        <div className="p-3 bg-[#080808] border-t border-white/10 space-y-3 animate-in fade-in">
                                            <p className="text-[10px] uppercase font-bold text-gray-500">New Lesson</p>
                                            <input type="text" placeholder="Lesson Title" value={tempLesson.title} onChange={e => setTempLesson({...tempLesson, title: e.target.value})} className={inputStyle}/>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input type="text" placeholder="Video ID (e.g. dQw4w9WgXcQ)" value={tempLesson.videoId} onChange={e => setTempLesson({...tempLesson, videoId: e.target.value})} className={inputStyle}/>
                                                <input type="text" placeholder="Duration (e.g. 10:05)" value={tempLesson.duration} onChange={e => setTempLesson({...tempLesson, duration: e.target.value})} className={inputStyle}/>
                                            </div>
                                            <div className="flex justify-between items-center pt-1">
                                                <label className="flex items-center gap-2 text-xs text-gray-400">
                                                    <input type="checkbox" checked={tempLesson.isFreePreview} onChange={e => setTempLesson({...tempLesson, isFreePreview: e.target.checked})} className="accent-blue-500"/>
                                                    Free Preview
                                                </label>
                                                <button type="button" onClick={() => addLesson(cIdx)} className="bg-white text-black px-4 py-1.5 rounded-lg text-xs font-bold">Add Lesson</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Add Chapter Input */}
                        <div className="flex gap-2 mt-4">
                            <input type="text" placeholder="New Chapter Name..." value={tempChapterTitle} onChange={e => setTempChapterTitle(e.target.value)} className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#008a45] outline-none" />
                            <button type="button" onClick={addChapter} className="bg-white/10 text-white px-3 rounded-lg flex items-center justify-center hover:bg-white/20"><Plus size={18}/></button>
                        </div>
                    </div>

                    {/* BOTTOM ACTIONS */}
                    <div className="pt-4 pb-20 md:pb-0">
                        <button type="submit" className="w-full bg-[#008a45] hover:bg-[#007038] text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-green-900/20 text-base active:scale-95 transition-transform">
                            <Save size={18} /> SAVE COURSE
                        </button>
                    </div>
                </form>
            </div>
        ) : (
            // --- LIST VIEW (MOBILE CARDS) ---
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {courses.map(course => (
                    <div key={course._id} className="bg-[#121212] border border-white/5 p-3 md:p-4 rounded-xl flex gap-3 hover:bg-[#1a1a1a] transition-colors relative group">
                        <img src={course.thumbnail} alt="" className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover bg-gray-800 shrink-0" />
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                            <div>
                                <h3 className="font-bold text-white text-sm md:text-base leading-tight line-clamp-2">{course.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] bg-white/10 text-gray-300 px-1.5 rounded uppercase">{course.level}</span>
                                    {course.isPublished ? 
                                        <span className="text-[10px] text-green-500 font-bold flex items-center gap-1"><Eye size={10}/> Live</span> : 
                                        <span className="text-[10px] text-yellow-500 font-bold flex items-center gap-1"><EyeOff size={10}/> Draft</span>
                                    }
                                </div>
                            </div>
                            <div className="flex justify-between items-end mt-2">
                                <span className="text-green-400 font-black text-sm md:text-base">₹{course.priceRecorded}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => handleEdit(course)} className="p-1.5 bg-white/10 text-white rounded-lg hover:bg-white/20"><Edit size={14} /></button>
                                    <button onClick={() => handleDelete(course._id)} className="p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {courses.length === 0 && <div className="text-center py-12 text-gray-500 col-span-full">No courses found.</div>}
            </div>
        )}
    </div>
  );
};

export default CourseManager;