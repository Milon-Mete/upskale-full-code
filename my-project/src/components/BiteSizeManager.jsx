import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Edit, Save, X, Trash2,
  Settings, Lock, Unlock, Globe, ShieldCheck, Layers
} from 'lucide-react';
import { BASE_URL } from '../config';

const BiteSizeManager = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const getAdminHeaders = () => {
    return { 'Content-Type': 'application/json' };
  };

  const initialForm = {
    _id: null,
    title: '', highlight: '', tag: '', image: '', slug: '', iconName: 'FileSpreadsheet',
    isLocked: false,
    trailerUrl: '',
    chapters: []
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${BASE_URL}/bitesize-courses/admin/all`, {
        headers: getAdminHeaders(),
        credentials: 'include'
      });
      const data = await res.json();
      const formatted = (Array.isArray(data) ? data : []).map(c => ({
        ...initialForm, ...c,
        trailerUrl: c.trailerUrl || '',
        chapters: c.chapters || []
      }));
      setCourses(formatted);
    } catch (err) { console.error("Fetch Error:", err); }
  };

  const handleEdit = (item) => { setFormData(item); setIsEditing(true); };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this Bite-Sized Course? This cannot be undone.")) return;
    try {
      const res = await fetch(`${BASE_URL}/bitesize-courses/admin/delete/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
        credentials: 'include'
      });
      if (res.ok) fetchCourses(); else alert("Failed to delete");
    } catch (err) { alert("Network Error"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const generatedSlug = formData.slug.trim() || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const payload = {
      title: formData.title, highlight: formData.highlight, tag: formData.tag,
      iconName: formData.iconName, image: formData.image, slug: generatedSlug, isLocked: formData.isLocked,
      trailerUrl: formData.trailerUrl
    };

    const url = formData._id ? `${BASE_URL}/bitesize-courses/admin/update/${formData._id}` : `${BASE_URL}/bitesize-courses/admin/create`;
    const method = formData._id ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: getAdminHeaders(),
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const result = await res.json();
        setIsEditing(false);
        setFormData(initialForm);
        fetchCourses();
        if (!formData._id && result.course?._id) {
          navigate(`/admin/bitesize/${result.course._id}/chapters`);
        }
      } else {
        const err = await res.json();
        alert(`Error: ${err.message}`);
      }
    } catch (err) { alert("Network Error"); }
  };

  const openModuleBuilder = (courseId) => {
    navigate(`/admin/bitesize/${courseId}/chapters`);
  };

  const countChapters = (chapters) => {
    if (!chapters) return { total: 0, videos: 0, quizzes: 0 };
    let videos = 0, quizzes = 0;
    chapters.forEach(ch => {
      if (ch.modules) {
        ch.modules.forEach(m => {
          if (m.type === 'video') videos++;
          if (m.type === 'quiz') quizzes++;
        });
      }
    });
    return { total: videos + quizzes, videos, quizzes };
  };

  const inputStyle = "w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:border-emerald-500 outline-none transition-colors placeholder:text-gray-700";
  const labelStyle = "block text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-wider";
  const sectionCardStyle = "p-4 bg-white/5 rounded-xl border border-white/5 space-y-3";

  return (
    <div className="pb-24 md:pb-0 font-sans">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-tight">Bite-Sized <span className="text-emerald-500">Manager</span></h2>
            {!isEditing && (
                <button onClick={() => { setIsEditing(true); setFormData(initialForm); }} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm hover:bg-emerald-500 transition-colors">
                    <Plus size={16} /> New Course
                </button>
            )}
        </div>

        {isEditing ? (
            <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 md:p-6">
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                    <h3 className="text-lg font-bold text-emerald-400">{formData._id ? 'Edit Course' : 'Create Course'}</h3>
                    <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={sectionCardStyle}>
                             <h4 className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-2"><Settings size={14} /> Course Settings</h4>
                             <div>
                                <label className={labelStyle}>Full Title</label>
                                <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className={inputStyle} placeholder="e.g. MS Excel with Generative AI" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className={labelStyle}>Highlight Word</label>
                                    <input type="text" required value={formData.highlight} onChange={e => setFormData({ ...formData, highlight: e.target.value })} className={inputStyle} placeholder="e.g. EXCEL WITH AI" />
                                </div>
                                <div>
                                    <label className={labelStyle}>Tag</label>
                                    <input type="text" required value={formData.tag} onChange={e => setFormData({ ...formData, tag: e.target.value })} className={inputStyle} placeholder="e.g. AI Automation" />
                                </div>
                            </div>
                            <div>
                                <label className={labelStyle}>Main Cover Image URL</label>
                                <input type="text" required value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} className={inputStyle} placeholder="https://res.cloudinary.com/..." />
                            </div>
                            <div>
                                <label className={labelStyle}>Free Preview Trailer URL</label>
                                <input type="text" value={formData.trailerUrl} onChange={e => setFormData({ ...formData, trailerUrl: e.target.value })} className={inputStyle} placeholder="URL for the 10-second trailer..." />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className={labelStyle}>Icon Name</label>
                                    <select value={formData.iconName} onChange={e => setFormData({ ...formData, iconName: e.target.value })} className={inputStyle}>
                                        <option value="FileSpreadsheet">FileSpreadsheet (Excel)</option>
                                        <option value="Presentation">Presentation (PowerBI)</option>
                                                                                <option value="Bot">Bot (Gen AI)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelStyle}>Access Status</label>
                                    <button type="button" onClick={() => setFormData({ ...formData, isLocked: !formData.isLocked })} className={`w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 border ${formData.isLocked ? 'bg-red-900/20 border-red-500/50 text-red-400' : 'bg-emerald-900/20 border-emerald-500/50 text-emerald-400'}`}>
                                        {formData.isLocked ? <><Lock size={16} /> Draft/Locked</> : <><Unlock size={16} /> Live/Public</>}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className={sectionCardStyle}>
                             <h4 className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-2"><Globe size={14} /> Subscription Model</h4>
                             <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-3">
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    This course will automatically be available to all students with an active subscription.
                                    Content is organized through <strong className="text-emerald-400">Modules & Chapters</strong>.
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-bold text-white"><ShieldCheck size={14} className="text-emerald-500" /> ₹1 Trial (3 Days)</div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-white"><ShieldCheck size={14} className="text-emerald-500" /> ₹99 Monthly Pass</div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-white"><ShieldCheck size={14} className="text-emerald-500" /> ₹599 Yearly Masterpass</div>
                                </div>
                             </div>
                        </div>
                    </div>

                    <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                        <p className="text-sm text-emerald-400 font-bold flex items-center justify-center gap-2">
                            <Layers size={18} />
                            After saving, you will be taken to the <strong>Module Builder</strong> to add video and quiz chapters.
                        </p>
                    </div>                        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-95 transition-all mt-6">
                            <Save size={18} /> {formData._id ? 'UPDATE COURSE' : 'CREATE COURSE & BUILD MODULES'}
                    </button>
                </form>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map(c => {
                    const chCount = countChapters(c.chapters);
                    return (
                        <div key={c._id} className="bg-[#121212] border border-white/5 p-4 rounded-2xl flex flex-col hover:bg-[#1a1a1a] transition-colors relative group shadow-lg">
                            <div className="flex gap-4 items-start mb-4">
                                <img src={c.image} alt="" className="w-16 h-16 rounded-xl object-cover bg-gray-800 shrink-0" />
                                <div>
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{c.tag}</div>
                                    <h3 className="font-bold text-white leading-tight">{c.title}</h3>
                                    <p className="text-xs text-emerald-400 font-bold mt-1">
                                        {chCount.videos} Videos • {chCount.quizzes} Quizzes • {c.chapters?.length || 0} Modules
                                    </p>
                                </div>
                            </div>
                            <div className="mt-auto flex justify-between items-center border-t border-white/5 pt-3">
                                <div className="flex items-center gap-2">
                                    {c.isLocked ? <Lock size={14} className="text-red-400" /> : <Unlock size={14} className="text-emerald-400" />}
                                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-500/20 uppercase">Subscription Only</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openModuleBuilder(c._id)} className="p-2 bg-emerald-600/20 text-emerald-400 rounded-lg hover:bg-emerald-600/30 transition-colors" title="Manage Modules & Chapters">
                                        <Layers size={14} />
                                    </button>
                                    <button onClick={() => handleEdit(c)} className="p-2 bg-white/5 text-white rounded-lg hover:bg-white/10"><Edit size={14} /></button>
                                    <button onClick={() => handleDelete(c._id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {courses.length === 0 && <div className="text-center py-12 text-gray-500 col-span-full">No courses created yet.</div>}
            </div>
        )}
    </div>
  );
};

export default BiteSizeManager;
