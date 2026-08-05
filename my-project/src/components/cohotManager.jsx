import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Save, X, DollarSign, LayoutDashboard, Trash2, 
  Video, FolderOpen, Layers, Eye, EyeOff, BookOpen, Target, CheckSquare, Link
} from 'lucide-react';
import { BASE_URL } from '../config';

const CohortManager = () => {
  const [courses, setCourses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // --- SECURITY HEADERS (FIXED) ---
  const getAdminHeaders = () => {
    // We no longer send user-id from local storage. The backend uses the HttpOnly cookie.
    return { 'Content-Type': 'application/json' };
  };

  // --- INITIAL STATE ---
  const initialForm = {
    _id: null,
    title: '', 
    category: 'cohort',
    
    // Pricing 
    priceRecOrig: '', priceRecDisc: '', 
    priceLiveOrig: '', priceLiveDisc: '', 
    installmentEnabled: false,
    installmentPricePart1: '', 
    installmentPricePart2: '', 
    
    thumbnail: '', demoVideoUrl: '', description: '',
    tags: '', level: 'Beginner', language: 'English',
    liveStartDate: '', isPublished: false, 
    
    // Arrays
    course: [],     // Outline: [{ Title, topic: [] }]
    whatulearn: [], // [{ text, imageurl }]
    content: []     // Curriculum: [{ chapterTitle, lessons: [{ title, videoId, duration, isFreePreview, resources: [] }] }]
  };

  const [formData, setFormData] = useState(initialForm);
  
  // Temp states for nested arrays
const [tempWul, setTempWul] = useState({ text: '', imageurl: '', desc: '' });
  const [tempOutline, setTempOutline] = useState({ Title: '', topicStr: '' }); 
  
  // Curriculum States
  const [tempChapterTitle, setTempChapterTitle] = useState('');
  const [activeChapterIndex, setActiveChapterIndex] = useState(null); 
  const [tempLesson, setTempLesson] = useState({ title: '', videoId: '', duration: '', isFreePreview: false, resources: [] });
  const [tempResource, setTempResource] = useState({ title: '', url: '' });

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      // 🔴 REQUIRED FOR COOKIES
      const res = await fetch(`${BASE_URL}/cohorts/admin/all`, { 
          headers: getAdminHeaders(),
          credentials: 'include' 
      });
      const data = await res.json();
      const formatted = (Array.isArray(data) ? data : []).map(c => ({
          ...initialForm,
          ...c,
          priceRecOrig: c.pricing?.recorded?.original || '',
          priceRecDisc: c.pricing?.recorded?.discount || '',
          priceLiveOrig: c.pricing?.live?.original || '',
          priceLiveDisc: c.pricing?.live?.discount || '',
          installmentEnabled: c.pricing?.installment?.enabled || false,
          installmentPricePart1: c.pricing?.installment?.pricePart1 || '',
          installmentPricePart2: c.pricing?.installment?.pricePart2 || '',
          liveStartDate: c.liveStartDate ? new Date(c.liveStartDate).toISOString().split('T')[0] : '',
          tags: c.tags ? c.tags.join(', ') : '', 
          course: c.course || [],
          whatulearn: c.whatulearn || [],
          content: c.content || []
      }));
      setCourses(formatted);
    } catch (err) { console.error("Fetch Error", err); }
  };

  // --- ARRAY HANDLERS ---
  const addWul = () => {
    if (!tempWul.text.trim() || !tempWul.imageurl.trim()) return;
    setFormData({ ...formData, whatulearn: [...formData.whatulearn, tempWul] });
    setTempWul({ text: '', desc: '',imageurl: '' });
  };
  const removeWul = (idx) => setFormData({ ...formData, whatulearn: formData.whatulearn.filter((_, i) => i !== idx) });

  const addOutline = () => {
    if (!tempOutline.Title.trim()) return;
    const topicsArray = tempOutline.topicStr.split(',').map(t => t.trim()).filter(Boolean);
    setFormData({ ...formData, course: [...formData.course, { Title: tempOutline.Title, topic: topicsArray }] });
    setTempOutline({ Title: '', topicStr: '' });
  };
  const removeOutline = (idx) => setFormData({ ...formData, course: formData.course.filter((_, i) => i !== idx) });

  // --- CURRICULUM HANDLERS ---
  const addChapter = () => {
    if (!tempChapterTitle.trim()) return;
    setFormData({ ...formData, content: [...formData.content, { chapterTitle: tempChapterTitle, lessons: [] }] });
    setTempChapterTitle('');
  };
  const removeChapter = (idx) => setFormData({ ...formData, content: formData.content.filter((_, i) => i !== idx) });

  const addResource = () => {
    if (!tempResource.title.trim() || !tempResource.url.trim()) return;
    setTempLesson({ ...tempLesson, resources: [...tempLesson.resources, tempResource] });
    setTempResource({ title: '', url: '' });
  };
  const removeResource = (idx) => {
    setTempLesson({ ...tempLesson, resources: tempLesson.resources.filter((_, i) => i !== idx) });
  };

  const addLesson = (chapterIndex) => {
    if (!tempLesson.title.trim() || !tempLesson.videoId.trim()) return;
    const newContent = [...formData.content];
    newContent[chapterIndex].lessons.push(tempLesson);
    setFormData({ ...formData, content: newContent });
    setTempLesson({ title: '', videoId: '', duration: '', isFreePreview: false, resources: [] }); 
    setActiveChapterIndex(null); 
  };
  const removeLesson = (chapterIndex, lessonIndex) => {
    const newContent = [...formData.content];
    newContent[chapterIndex].lessons = newContent[chapterIndex].lessons.filter((_, i) => i !== lessonIndex);
    setFormData({ ...formData, content: newContent });
  };

  // --- CRUD HANDLERS ---
  const handleEdit = (item) => { setFormData(item); setIsEditing(true); };
  
  const handleDelete = async (id) => {
    if(!window.confirm("Delete this cohort course?")) return;
    try {
        // 🔴 REQUIRED FOR COOKIES
        const res = await fetch(`${BASE_URL}/cohorts/admin/delete/${id}`, { 
            method: 'DELETE', 
            headers: getAdminHeaders(),
            credentials: 'include' 
        });
        if (res.ok) fetchCourses();
    } catch(err) { alert("Delete failed"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = formData._id ? `${BASE_URL}/cohorts/admin/update/${formData._id}` : `${BASE_URL}/cohorts/admin/create`;
    const method = formData._id ? 'PUT' : 'POST';
    
    const payload = {
        ...formData,
        tags: typeof formData.tags === 'string' ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : formData.tags,
        pricing: { 
            recorded: { original: Number(formData.priceRecOrig) || 0, discount: Number(formData.priceRecDisc) || 0 },
            live: { original: Number(formData.priceLiveOrig) || 0, discount: Number(formData.priceLiveDisc) || 0 },
            installment: {
                enabled: formData.installmentEnabled,
                pricePart1: Number(formData.installmentPricePart1) || 0,
                pricePart2: Number(formData.installmentPricePart2) || 0,
                totalParts: 2
            }
        }
    };

    try {
        // 🔴 REQUIRED FOR COOKIES
        const res = await fetch(url, { 
            method, 
            headers: getAdminHeaders(), 
            credentials: 'include', 
            body: JSON.stringify(payload) 
        });
        if (res.ok) {
            alert(formData._id ? "Updated!" : "Created!");
            setIsEditing(false);
            setFormData(initialForm);
            fetchCourses();
        } else { alert("Error saving course"); }
    } catch (err) { alert("Network Error"); }
  };

  // --- STYLES ---
  const inputStyle = "w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:border-[#008a45] outline-none transition-colors placeholder:text-gray-700";
  const labelStyle = "block text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-wider";

  return (
    <div className="pb-24 md:pb-0">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-3xl font-black text-white">Cohort Manager</h2>
            {!isEditing && (
                <button onClick={() => { setIsEditing(true); setFormData(initialForm); }} className="bg-[#008a45] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm shadow-lg shadow-green-900/20">
                    <Plus size={16} /> New <span className="hidden md:inline">Cohort</span>
                </button>
            )}
        </div>

        {isEditing ? (
            <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                    <h3 className="text-lg font-bold text-green-500">{formData._id ? 'Edit Cohort' : 'Create New Cohort'}</h3>
                    <button onClick={() => setIsEditing(false)} className="bg-white/5 p-2 rounded-full text-gray-400 hover:text-white"><X size={18}/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* 1. BASIC INFO */}
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className={labelStyle}>Course Title</label>
                                <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className={inputStyle} placeholder="Ex: Full Stack Mastery" />
                            </div>
                            <div>
                                <label className={labelStyle}>Live Start Date</label>
                                <input type="date" value={formData.liveStartDate} onChange={e => setFormData({ ...formData, liveStartDate: e.target.value })} className={inputStyle} />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className={labelStyle}>Category</label>
                                <input type="text" readOnly value={formData.category} className={`${inputStyle} text-gray-500 cursor-not-allowed`} />
                            </div>
                            <div>
                                <label className={labelStyle}>Level</label>
                                <select value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })} className={inputStyle}>
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Medium</option>
                                    <option value="Advanced">Pro</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelStyle}>Language</label>
                                <input type="text" value={formData.language} onChange={e => setFormData({ ...formData, language: e.target.value })} className={inputStyle} placeholder="English" />
                            </div>
                        </div>

                        <div>
                            <label className={labelStyle}>Description</label>
                            <textarea rows="2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className={inputStyle} placeholder="Short description..." />
                        </div>
                        <div>
                            <label className={labelStyle}>Tags (Comma separated)</label>
                            <input type="text" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} className={inputStyle} placeholder="React, JS, CSS" />
                        </div>
                    </div>

                    <div className="h-px bg-white/5 my-2"></div>

                    {/* 2. MEDIA */}
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
                        <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5 mt-2 cursor-pointer w-max">
                            <input type="checkbox" checked={formData.isPublished} onChange={e => setFormData({...formData, isPublished: e.target.checked})} className="w-5 h-5 accent-green-500 rounded"/>
                            <div>
                                <span className="block text-sm font-bold text-white">Publish Now</span>
                                <span className="block text-[10px] text-gray-500">Visible to students</span>
                            </div>
                        </label>
                    </div>

                    <div className="h-px bg-white/5 my-2"></div>

                    {/* 3. NEW PRICING SCHEMA */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-white flex items-center gap-2 mb-2"><DollarSign size={14} className="text-yellow-500"/> Pricing Model</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Recorded Pricing */}
                            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                                <span className="text-xs font-bold text-gray-400 block mb-2 uppercase">Recorded Plan</span>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className={labelStyle}>Original ₹</label>
                                        <input type="number" required value={formData.priceRecOrig} onChange={e => setFormData({...formData, priceRecOrig: e.target.value})} className={inputStyle} />
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Discount (Selling) ₹</label>
                                        <input type="number" required value={formData.priceRecDisc} onChange={e => setFormData({...formData, priceRecDisc: e.target.value})} className={`${inputStyle} border-green-500/30 text-green-400`} />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Live Pricing */}
                            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                                <span className="text-xs font-bold text-gray-400 block mb-2 uppercase">Live Plan</span>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className={labelStyle}>Original ₹</label>
                                        <input type="number" required value={formData.priceLiveOrig} onChange={e => setFormData({...formData, priceLiveOrig: e.target.value})} className={inputStyle} />
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Discount (Selling) ₹</label>
                                        <input type="number" required value={formData.priceLiveDisc} onChange={e => setFormData({...formData, priceLiveDisc: e.target.value})} className={`${inputStyle} border-green-500/30 text-green-400`} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Installment Toggle */}
                        <div className="bg-yellow-500/5 rounded-xl border border-yellow-500/20 p-3 mt-2">
                            <label className="flex items-center gap-2 mb-3 cursor-pointer w-max">
                                <input type="checkbox" checked={formData.installmentEnabled} onChange={e => setFormData({...formData, installmentEnabled: e.target.checked})} className="w-4 h-4 accent-yellow-500"/>
                                <span className="text-xs font-bold text-yellow-500">Enable 2-Part Installment (Live)</span>
                            </label>
                            
                            {formData.installmentEnabled && (
                                <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                                    <div>
                                        <label className="text-[9px] text-yellow-500/70 uppercase font-bold block mb-1">Part 1 (Now) ₹</label>
                                        <input type="number" value={formData.installmentPricePart1} onChange={e => setFormData({...formData, installmentPricePart1: e.target.value})} className="w-full bg-black border border-yellow-500/30 rounded px-2 py-2 text-sm text-white focus:border-yellow-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[9px] text-yellow-500/70 uppercase font-bold block mb-1">Part 2 (Later) ₹</label>
                                        <input type="number" value={formData.installmentPricePart2} onChange={e => setFormData({...formData, installmentPricePart2: e.target.value})} className="w-full bg-black border border-yellow-500/30 rounded px-2 py-2 text-sm text-white focus:border-yellow-500 outline-none" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="h-px bg-white/5 my-2"></div>

                    {/* 4. WHAT YOU WILL LEARN */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-white flex items-center gap-2 mb-2"><Target size={14} className="text-purple-400"/> What You Will Learn</h4>
                        
                       <div className="space-y-2 mt-4">
    {formData.whatulearn.map((item, idx) => (
        <div key={idx} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5 group hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3 overflow-hidden pr-4">
                <img 
                    src={item.imageurl} 
                    alt="icon" 
                    className="w-10 h-10 rounded-lg bg-[#1a1a1a] object-cover shrink-0 border border-white/5" 
                    onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
                />
                <div className="min-w-0">
                    {/* Title */}
                    <p className="text-sm font-bold text-white truncate">{item.text}</p>
                    {/* New Description Field */}
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{item.desc}</p>
                </div>
            </div>
            <button 
                type="button" 
                onClick={() => removeWul(idx)} 
                className="text-red-500/50 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-colors shrink-0"
            >
                <Trash2 size={16}/>
            </button>
        </div>
    ))}
</div>

                        <div className="flex flex-col md:flex-row gap-2 mt-2">
    <input type="text" placeholder="Skill Text (e.g. Master React JS)" value={tempWul.text} onChange={e => setTempWul({...tempWul, text: e.target.value})} className={`${inputStyle} flex-1`} />
    <input type="text" placeholder="Short Description" value={tempWul.desc} onChange={e => setTempWul({...tempWul, desc: e.target.value})} className={`${inputStyle} flex-1`} />
    <input type="text" placeholder="Icon Image URL" value={tempWul.imageurl} onChange={e => setTempWul({...tempWul, imageurl: e.target.value})} className={`${inputStyle} flex-1`} />
    <button type="button" onClick={addWul} className="bg-white/10 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-white/20">Add Skill</button>
</div>
                    </div>

                    <div className="h-px bg-white/5 my-2"></div>

                    {/* 5. COURSE OUTLINE (Syllabus summary) */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-white flex items-center gap-2 mb-2"><BookOpen size={14} className="text-blue-400"/> Course Outline (Modules)</h4>
                        
                        <div className="space-y-2">
                            {formData.course.map((module, idx) => (
                                <div key={idx} className="bg-white/5 p-3 rounded-lg border border-white/5 relative">
                                    <button type="button" onClick={() => removeOutline(idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-400"><Trash2 size={14}/></button>
                                    <h5 className="text-sm font-bold text-blue-400 mb-1">{module.Title}</h5>
                                    <div className="flex flex-wrap gap-1">
                                        {module.topic.map((t, i) => <span key={i} className="bg-black text-[10px] text-gray-300 px-2 py-0.5 rounded">{t}</span>)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col md:flex-row gap-2 mt-2 bg-black/30 p-3 rounded-lg border border-white/5">
                            <input type="text" placeholder="Module Title (e.g. Week 1: Basics)" value={tempOutline.Title} onChange={e => setTempOutline({...tempOutline, Title: e.target.value})} className={`${inputStyle} md:w-1/3`} />
                            <input type="text" placeholder="Topics (comma separated)" value={tempOutline.topicStr} onChange={e => setTempOutline({...tempOutline, topicStr: e.target.value})} className={`${inputStyle} flex-1`} />
                            <button type="button" onClick={addOutline} className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg font-bold text-xs hover:bg-blue-500/30">Add Module</button>
                        </div>
                    </div>

                    <div className="h-px bg-white/5 my-2"></div>

                    {/* 6. LMS CURRICULUM (Videos & Resources) */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><Layers size={14} /> Video Curriculum</h3>
                        
                        <div className="space-y-3">
                            {formData.content.map((chapter, cIdx) => (
                                <div key={cIdx} className="bg-white/5 border border-white/5 rounded-xl overflow-hidden">
                                    <div className="p-3 flex justify-between items-center bg-white/5 border-b border-white/5">
                                        <h4 className="font-bold text-white text-sm flex items-center gap-2 truncate">
                                            <FolderOpen size={14} className="text-green-400 shrink-0"/> {chapter.chapterTitle}
                                        </h4>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <button type="button" onClick={() => setActiveChapterIndex(activeChapterIndex === cIdx ? null : cIdx)} className="text-xs text-green-400 font-bold bg-green-500/10 px-2 py-1 rounded border border-green-500/20">+ Video</button>
                                            <button type="button" onClick={() => removeChapter(cIdx)} className="text-red-500"><Trash2 size={14}/></button>
                                        </div>
                                    </div>

                                    <div className="space-y-1 p-2">
                                        {chapter.lessons.length === 0 && <p className="text-[10px] text-gray-600 p-2 italic text-center">No videos yet.</p>}
                                        {chapter.lessons.map((lesson, lIdx) => (
                                            <div key={lIdx} className="flex flex-col p-2 rounded bg-black/40 hover:bg-black/60 mx-1 mb-1">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex-1 truncate pr-2">
                                                        <div className="font-bold text-white text-xs truncate">{lesson.title}</div>
                                                        <div className="text-[10px] text-gray-500 flex gap-2 mt-0.5">
                                                            <span>{lesson.duration}</span>
                                                            {lesson.isFreePreview && <span className="text-blue-400 font-bold">Preview</span>}
                                                        </div>
                                                    </div>
                                                    <button type="button" onClick={() => removeLesson(cIdx, lIdx)} className="text-gray-600 hover:text-red-500 p-1"><X size={12}/></button>
                                                </div>
                                                
                                                {/* Render attached resources for this lesson */}
                                                {lesson.resources && lesson.resources.length > 0 && (
                                                    <div className="mt-2 pl-2 border-l-2 border-white/10 space-y-1">
                                                        {lesson.resources.map((res, rIdx) => (
                                                            <a key={rIdx} href={res.url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 flex items-center gap-1 hover:underline">
                                                                <Link size={10}/> {res.title}
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Video & Resource Add Form */}
                                    {activeChapterIndex === cIdx && (
                                        <div className="p-3 bg-[#080808] border-t border-white/10 space-y-3 animate-in fade-in">
                                            <p className="text-[10px] uppercase font-bold text-gray-500">New Video for {chapter.chapterTitle}</p>
                                            
                                            <input type="text" placeholder="Video Title" value={tempLesson.title} onChange={e => setTempLesson({...tempLesson, title: e.target.value})} className={inputStyle}/>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input type="text" placeholder="Video ID (YT/Vimeo)" value={tempLesson.videoId} onChange={e => setTempLesson({...tempLesson, videoId: e.target.value})} className={inputStyle}/>
                                                <input type="text" placeholder="Duration (e.g. 10:05)" value={tempLesson.duration} onChange={e => setTempLesson({...tempLesson, duration: e.target.value})} className={inputStyle}/>
                                            </div>

                                            {/* Resource Builder Widget */}
                                            <div className="bg-white/5 p-2 rounded border border-white/5">
                                                <label className={labelStyle}>Attach Resources (Optional)</label>
                                                {tempLesson.resources.map((r, i) => (
                                                    <div key={i} className="flex justify-between items-center bg-black p-1.5 rounded mb-1 border border-white/5">
                                                        <span className="text-[10px] text-gray-300 flex items-center gap-1"><Link size={10}/> {r.title}</span>
                                                        <button type="button" onClick={() => removeResource(i)} className="text-red-500"><X size={12}/></button>
                                                    </div>
                                                ))}
                                                <div className="flex gap-2 mt-2">
                                                    <input type="text" placeholder="File Name" value={tempResource.title} onChange={e => setTempResource({...tempResource, title: e.target.value})} className={`${inputStyle} py-1.5 text-xs`} />
                                                    <input type="text" placeholder="File Link" value={tempResource.url} onChange={e => setTempResource({...tempResource, url: e.target.value})} className={`${inputStyle} py-1.5 text-xs`} />
                                                    <button type="button" onClick={addResource} className="bg-blue-500/20 text-blue-400 px-3 rounded text-xs font-bold hover:bg-blue-500/30">Add</button>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                                <label className="flex items-center gap-2 text-xs text-gray-400">
                                                    <input type="checkbox" checked={tempLesson.isFreePreview} onChange={e => setTempLesson({...tempLesson, isFreePreview: e.target.checked})} className="accent-blue-500"/>
                                                    Free Preview
                                                </label>
                                                <button type="button" onClick={() => addLesson(cIdx)} className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-green-500">Save Video</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 mt-4">
                            <input type="text" placeholder="New Video Section Name (e.g. Chapter 1)..." value={tempChapterTitle} onChange={e => setTempChapterTitle(e.target.value)} className={`${inputStyle} flex-1`} />
                            <button type="button" onClick={addChapter} className="bg-white/10 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-bold hover:bg-white/20">
                                <Plus size={14}/> Add Section
                            </button>
                        </div>
                    </div>

                    {/* BOTTOM ACTIONS */}
                    <div className="pt-6 pb-20 md:pb-0">
                        <button type="submit" className="w-full bg-[#008a45] hover:bg-[#007038] text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-green-900/20 text-base active:scale-95 transition-transform">
                            <Save size={18} /> SAVE COHORT
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
                                <div>
                                    <span className="text-gray-500 text-[10px] block">Recorded: ₹{course.priceRecDisc}</span>
                                    <span className="text-green-400 font-black text-sm md:text-base">Live: ₹{course.priceLiveDisc}</span>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleEdit(course)} className="p-1.5 bg-white/10 text-white rounded-lg hover:bg-white/20"><Edit size={14} /></button>
                                    <button onClick={() => handleDelete(course._id)} className="p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {courses.length === 0 && <div className="text-center py-12 text-gray-500 col-span-full">No cohorts found.</div>}
            </div>
        )}
    </div>
  );
};

export default CohortManager;