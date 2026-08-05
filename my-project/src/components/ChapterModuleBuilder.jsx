import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Plus, Trash2, Edit, Save, X, Video, CheckSquare, ChevronDown, ChevronUp,
    Globe,    ArrowLeft, Loader2, GripVertical, BookOpen
} from 'lucide-react';
import { BASE_URL } from '../config';

// ─── Drag-and-Drop Hook ─────────────────────────────────
const useDragReorder = (items, onReorder) => {
    const [dragIndex, setDragIndex] = useState(null);
    const [overIndex, setOverIndex] = useState(null);

    const handleDragStart = (e, index) => {
        setDragIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragIndex !== index) {
            setOverIndex(index);
        }
    };

    const handleDragLeave = (e) => {
        if (e.currentTarget.contains(e.relatedTarget)) return;
        setOverIndex(null);
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
        
        if (fromIndex !== dropIndex && !isNaN(fromIndex)) {
            const newItems = [...items];
            const [moved] = newItems.splice(fromIndex, 1);
            newItems.splice(dropIndex, 0, moved);
            onReorder(newItems);
        }
        
        setDragIndex(null);
        setOverIndex(null);
    };

    const handleDragEnd = () => {
        setDragIndex(null);
        setOverIndex(null);
    };

    const getItemStyle = (index) => {
        const isDragging = dragIndex === index;
        const isOver = overIndex === index && dragIndex !== index;
        return {
            className: `transition-all duration-200 ${
                isDragging ? 'opacity-40 scale-[0.97]' : ''
            } ${
                isOver ? 'ring-2 ring-emerald-500/50 scale-[1.01]' : ''
            }`,
            style: {
                transform: isOver ? 'translateY(4px)' : 'translateY(0)'
            }
        };
    };

    return {
        dragIndex,
        handleDragStart,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleDragEnd,
        getItemStyle
    };
};

// ─── Drag Handle Component ─────────────────────────────
const DragHandle = ({ onDragStart, onDragEnd, index, isCertModule = false }) => (
    <div
        draggable={!isCertModule}
        onDragStart={(e) => !isCertModule && onDragStart(e, index)}
        onDragEnd={() => !isCertModule && onDragEnd?.()}
        className={`p-1.5 rounded-lg transition-colors ${
            isCertModule
                ? 'text-gray-700 cursor-not-allowed'
                : 'text-gray-500 hover:text-white hover:bg-white/10 cursor-grab active:cursor-grabbing'
        }`}
        onMouseDown={(e) => e.stopPropagation()}
        title={isCertModule ? 'Certificate Module cannot be moved' : 'Drag to reorder'}
    >
        <GripVertical size={16} />
    </div>
);

// ─── MAIN COMPONENT ────────────────────────────────────
const ChapterModuleBuilder = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reordering, setReordering] = useState(false);

    // Module state
    const [newModuleTitle, setNewModuleTitle] = useState('');
    const [newModuleDesc, setNewModuleDesc] = useState('');
    const [showNewModule, setShowNewModule] = useState(false);
    const [editingModule, setEditingModule] = useState(null);
    const [expandedModules, setExpandedModules] = useState({});

    // Chapter state
    const [showChapterForm, setShowChapterForm] = useState({ moduleId: null, type: null });
    const [chapterForm, setChapterForm] = useState({
        title: '', description: '', thumbnail: '', videoUrls: { bn: '', en: '', hi: '' },
        questions: []
    });
    const [saving, setSaving] = useState(false);
    
    // Chapter edit state
    const [editingChapter, setEditingChapter] = useState(null);
    const [savingEdit, setSavingEdit] = useState(false);

    // Drag state for chapters (track per module)
    const [chapterDragState, setChapterDragState] = useState({});

    const fetchCourse = useCallback(async () => {
        try {
            const res = await fetch(`${BASE_URL}/bitesize-courses/admin/all`, {
                credentials: 'include'
            });
            const data = await res.json();
            const found = Array.isArray(data) ? data.find(c => c._id === courseId) : null;
            setCourse(found || data);
        } catch (err) {
            console.error("Failed to fetch course:", err);
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => { fetchCourse(); }, [fetchCourse]);

    // ─── Module Reorder ───
    const handleModuleReorder = async (newModules) => {
        setReordering(true);
        const chapterIds = newModules.map(m => m._id);
        try {
            const res = await fetch(`${BASE_URL}/bitesize-courses/admin/${courseId}/chapters/reorder`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ chapterIds })
            });
            if (res.ok) {
                fetchCourse();
            } else {
                const err = await res.json();
                alert(err.message);
                fetchCourse();
            }
        } catch (err) {
            alert("Network error");
            fetchCourse();
        } finally {
            setReordering(false);
        }
    };

    const moduleDrag = useDragReorder(course?.chapters || [], handleModuleReorder);

    // ─── Chapter Reorder ───
    const handleChapterReorder = async (moduleId, newChapters) => {
        setReordering(true);
        const moduleIds = newChapters.map(ch => ch._id);
        try {
            const res = await fetch(`${BASE_URL}/bitesize-courses/admin/${courseId}/chapter/${moduleId}/modules/reorder`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ moduleIds })
            });
            if (res.ok) {
                fetchCourse();
            } else {
                const err = await res.json();
                alert(err.message);
                fetchCourse();
            }
        } catch (err) {
            alert("Network error");
            fetchCourse();
        } finally {
            setReordering(false);
        }
    };

    // Chapter drag handler for a specific module
    const createChapterDrag = (moduleId, chapters) => {
        return {
            handleDragStart: (e, index) => {
                setChapterDragState(prev => ({
                    ...prev,
                    [moduleId]: { dragIndex: index, overIndex: null }
                }));
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', index.toString());
            },
            handleDragOver: (e, index) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                const state = chapterDragState[moduleId];
                if (state && state.dragIndex !== index) {
                    setChapterDragState(prev => ({
                        ...prev,
                        [moduleId]: { ...prev[moduleId], overIndex: index }
                    }));
                }
            },
            handleDragLeave: (e) => {
                if (e.currentTarget.contains(e.relatedTarget)) return;
                setChapterDragState(prev => ({
                    ...prev,
                    [moduleId]: { ...prev[moduleId], overIndex: null }
                }));
            },
            handleDrop: (e, dropIndex) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                
                if (fromIndex !== dropIndex && !isNaN(fromIndex)) {
                    const newItems = [...chapters];
                    const [moved] = newItems.splice(fromIndex, 1);
                    newItems.splice(dropIndex, 0, moved);
                    handleChapterReorder(moduleId, newItems);
                }
                
                setChapterDragState(prev => ({
                    ...prev,
                    [moduleId]: { dragIndex: null, overIndex: null }
                }));
            },
            handleDragEnd: () => {
                setChapterDragState(prev => {
                    const next = { ...prev };
                    delete next[moduleId];
                    return next;
                });
            },
            getChapterStyle: (index) => {
                const state = chapterDragState[moduleId];
                const isDragging = state?.dragIndex === index;
                const isOver = state?.overIndex === index && state?.dragIndex !== index;
                return {
                    className: `transition-all duration-200 ${
                        isDragging ? 'opacity-40 scale-[0.98]' : ''
                    } ${
                        isOver ? 'ring-2 ring-emerald-500/50 scale-[1.01]' : ''
                    }`
                };
            }
        };
    };

    // ─── Module CRUD ───
    const addModule = async () => {
        if (!newModuleTitle.trim()) return alert("Module title required");
        try {
            const res = await fetch(`${BASE_URL}/bitesize-courses/admin/${courseId}/chapter`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ title: newModuleTitle, description: newModuleDesc })
            });
            if (res.ok) {
                setNewModuleTitle('');
                setNewModuleDesc('');
                setShowNewModule(false);
                fetchCourse();
            } else {
                const err = await res.json();
                alert(err.message);
            }
        } catch (err) {
            alert("Network error");
        }
    };

    const updateModule = async (moduleId) => {
        if (!editingModule.title.trim()) return;
        try {
            const res = await fetch(`${BASE_URL}/bitesize-courses/admin/${courseId}/chapter/${moduleId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(editingModule)
            });
            if (res.ok) {
                setEditingModule(null);
                fetchCourse();
            }
        } catch (err) {
            alert("Network error");
        }
    };

    const deleteModule = async (moduleId) => {
        if (!window.confirm("Delete this module and all its chapters?")) return;
        try {
            await fetch(`${BASE_URL}/bitesize-courses/admin/${courseId}/chapter/${moduleId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            fetchCourse();
        } catch (err) {
            alert("Network error");
        }
    };

    // ─── Chapter CRUD ───
    const addQuestionToForm = () => {
        setChapterForm({
            ...chapterForm,
            questions: [...chapterForm.questions, { questionText: '', options: ['', '', '', ''], correctAnswer: '' }]
        });
    };

    const updateQuestion = (idx, field, value) => {
        const qs = [...chapterForm.questions];
        qs[idx][field] = value;
        setChapterForm({ ...chapterForm, questions: qs });
    };

    const updateOption = (qIdx, oIdx, value) => {
        const qs = [...chapterForm.questions];
        qs[qIdx].options[oIdx] = value;
        setChapterForm({ ...chapterForm, questions: qs });
    };

    const removeQuestion = (idx) => {
        setChapterForm({ ...chapterForm, questions: chapterForm.questions.filter((_, i) => i !== idx) });
    };

    const saveChapter = async () => {
        const { moduleId, type } = showChapterForm;
        if (!type) return;

        if (type === 'video') {
            if (!chapterForm.title.trim() || !chapterForm.videoUrls.bn.trim()) {
                return alert("Video title and Bengali URL are required");
            }
        } else if (type === 'quiz') {
            if (chapterForm.questions.length === 0) {
                return alert("Quiz must have at least one question");
            }
            for (let i = 0; i < chapterForm.questions.length; i++) {
                const q = chapterForm.questions[i];
                if (!q.options.filter(Boolean).includes(q.correctAnswer)) {
                    return alert(`Question ${i + 1}: Correct answer must match one of the options`);
                }
            }
        }

        setSaving(true);
        try {
            const body = { type, ...chapterForm };
            const res = await fetch(`${BASE_URL}/bitesize-courses/admin/${courseId}/chapter/${moduleId}/module`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body)
            });
            if (res.ok) {
                setShowChapterForm({ moduleId: null, type: null });
                setChapterForm({ title: '', description: '', thumbnail: '', videoUrls: { bn: '', en: '', hi: '' }, questions: [] });
                fetchCourse();
            } else {
                const err = await res.json();
                alert(err.message);
            }
        } catch (err) {
            alert("Network error");
        } finally {
            setSaving(false);
        }
    };

    const updateChapter = async () => {
        if (!editingChapter) return;
        const { moduleId, chapterId, type, ...data } = editingChapter;

        if (type === 'video') {
            if (!data.title?.trim() || !data.videoUrls?.bn?.trim()) {
                return alert("Video title and Bengali URL are required");
            }
        } else if (type === 'quiz') {
            if (!data.questions || data.questions.length === 0) {
                return alert("Quiz must have at least one question");
            }
            for (let i = 0; i < data.questions.length; i++) {
                const q = data.questions[i];
                if (!q.options?.filter(Boolean).includes(q.correctAnswer)) {
                    return alert(`Question ${i + 1}: Correct answer must match one of the options`);
                }
            }
        }

        setSavingEdit(true);
        try {
            const body = { type, ...data };
            const res = await fetch(`${BASE_URL}/bitesize-courses/admin/${courseId}/chapter/${moduleId}/module/${chapterId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body)
            });
            if (res.ok) {
                setEditingChapter(null);
                fetchCourse();
            } else {
                const err = await res.json();
                alert(err.message);
            }
        } catch (err) {
            alert("Network error");
        } finally {
            setSavingEdit(false);
        }
    };

    const startEditChapter = (ch, moduleId) => {
        setShowChapterForm({ moduleId: null, type: null });
        if (ch.type === 'video') {
            setEditingChapter({
                moduleId,
                chapterId: ch._id,
                type: 'video',
                title: ch.title || '',
                description: ch.description || '',
                thumbnail: ch.thumbnail || '',
                videoUrls: { ...(ch.videoUrls || { bn: '', en: '', hi: '' }) }
            });
        } else if (ch.type === 'quiz') {
            setEditingChapter({
                moduleId,
                chapterId: ch._id,
                type: 'quiz',
                questions: (ch.questions || []).map(q => ({
                    ...q,
                    options: [...(q.options || ['', '', '', ''])]
                }))
            });
        }
    };

    const deleteChapter = async (moduleId, chapterId) => {
        if (!window.confirm("Delete this chapter?")) return;
        try {
            await fetch(`${BASE_URL}/bitesize-courses/admin/${courseId}/chapter/${moduleId}/module/${chapterId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            fetchCourse();
        } catch (err) {
            alert("Network error");
        }
    };

    const toggleModule = (id) => {
        setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const inputStyle = "w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:border-emerald-500 outline-none transition-colors placeholder:text-gray-700";
    const labelStyle = "block text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-wider";

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="animate-spin text-emerald-500" size={40} />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
                <p>Course not found</p>
            </div>
        );
    }

    const modules = course.chapters || [];

    // ─── Render ───
    return (
        <div className={`min-h-screen bg-[#050505] font-sans p-4 md:p-8 pb-24 ${reordering ? 'pointer-events-none opacity-70' : ''}`}>
            {reordering && (
                <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Saving order...
                </div>
            )}

            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors">
                    <ArrowLeft size={18} /> Back to Manager
                </button>
                <div className="flex items-start gap-4">
                    {course.image && (
                        <img src={course.image} alt="" className="w-16 h-16 rounded-xl object-cover bg-gray-800 shrink-0" />
                    )}
                    <div>
                        <h1 className="text-2xl font-black text-white">{course.title}</h1>
                        <p className="text-emerald-400 text-sm font-bold mt-1">{course.highlight}</p>
                        <p className="text-gray-500 text-xs mt-1">
                            {modules.length} Modules • {modules.reduce((sum, mod) => sum + (mod.modules?.length || 0), 0)} Chapters
                        </p>
                        {modules.length > 1 && (
                            <p className="text-gray-600 text-[10px] mt-1 flex items-center gap-1">
                                <GripVertical size={10} /> Drag the grip handle to reorder modules
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Add Module Button */}
                {!showNewModule && (
                    <button onClick={() => setShowNewModule(true)} className="w-full py-4 bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/20 rounded-2xl text-gray-400 hover:text-white font-bold flex items-center justify-center gap-2 transition-all">
                        <Plus size={18} /> Add Module
                    </button>
                )}

                {/* New Module Form */}
                {showNewModule && (
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-emerald-400 font-bold text-sm uppercase tracking-wider">New Module</h3>
                            <button onClick={() => setShowNewModule(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
                        </div>
                        <div className="space-y-3 mb-4">
                            <input type="text" placeholder="Module Title (e.g., Module 1: Foundations)" value={newModuleTitle} onChange={e => setNewModuleTitle(e.target.value)} className={inputStyle} />
                            <textarea placeholder="Module Description (optional)" value={newModuleDesc} onChange={e => setNewModuleDesc(e.target.value)} className={`${inputStyle} min-h-[60px]`} rows={2} />
                        </div>
                        <button onClick={addModule} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors">
                            Create Module
                        </button>
                    </div>
                )}

                {/* Module List */}
                <div className="space-y-3">
                    {modules.map((mod, modIdx) => {
                        const isCertModule = mod.isCertificateModule || (modIdx === modules.length - 1 && modules.length > 0);
                        const { className: moduleClassName, style: moduleStyle } = moduleDrag.getItemStyle(modIdx);
                        const chapterDrag = createChapterDrag(mod._id, mod.modules || []);
                        const chapterState = chapterDragState[mod._id];

                        return (
                            <div
                                key={mod._id}
                                className={`${moduleClassName} bg-[#121212] border rounded-2xl overflow-hidden ${isCertModule ? 'border-yellow-500/30' : 'border-white/10'}`}
                                style={moduleStyle}
                                onDragOver={(e) => moduleDrag.handleDragOver(e, modIdx)}
                                onDragLeave={moduleDrag.handleDragLeave}
                                onDrop={(e) => moduleDrag.handleDrop(e, modIdx)}
                                onDragEnd={moduleDrag.handleDragEnd}
                            >
                                {/* Module Header */}
                                <div
                                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors select-none"
                                    onClick={() => toggleModule(mod._id)}
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        {/* Drag Handle */}
                                        <DragHandle
                                            onDragStart={moduleDrag.handleDragStart}
                                            onDragEnd={moduleDrag.handleDragEnd}
                                            index={modIdx}
                                            isCertModule={isCertModule}
                                        />

                                        {/* Module Number Badge */}
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${isCertModule
                                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        }`}>
                                            {isCertModule ? '🏆' : modIdx + 1}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-white text-base truncate">
                                                    {isCertModule ? 'Certificate Module' : mod.title}
                                                </h3>
                                                {isCertModule && (
                                                    <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center gap-0.5 shrink-0">
                                                        🏆 Certificate
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-500 text-xs mt-0.5">
                                                {mod.modules?.length || 0} {isCertModule ? 'quiz chapters' : 'chapters'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => setEditingModule({ _id: mod._id, title: mod.title, description: mod.description })}
                                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                            title="Edit module"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        {!isCertModule && (
                                            <button
                                                onClick={() => deleteModule(mod._id)}
                                                className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Delete module"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                        <div className={`p-2 transition-colors ${expandedModules[mod._id] ? 'text-emerald-400' : 'text-gray-500'}`}>
                                            {expandedModules[mod._id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </div>
                                    </div>
                                </div>

                                {/* Edit Module Inline */}
                                {editingModule && editingModule._id === mod._id && (
                                    <div className="px-5 pb-4 border-t border-white/5 pt-4" onClick={(e) => e.stopPropagation()}>
                                        <div className="space-y-3 mb-3">
                                            <input type="text" value={editingModule.title} onChange={e => setEditingModule({ ...editingModule, title: e.target.value })} className={inputStyle} placeholder="Module Title" />
                                            <textarea value={editingModule.description} onChange={e => setEditingModule({ ...editingModule, description: e.target.value })} className={`${inputStyle} min-h-[60px]`} rows={2} />
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => updateModule(mod._id)} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg text-sm hover:bg-emerald-500 transition-colors">Save</button>
                                            <button onClick={() => setEditingModule(null)} className="px-6 py-2 bg-white/10 text-gray-300 font-bold rounded-lg text-sm hover:bg-white/20 transition-colors">Cancel</button>
                                        </div>
                                    </div>
                                )}

                                {/* Expanded Chapters */}
                                {expandedModules[mod._id] && (
                                    <div className="border-t border-white/5 bg-black/40 p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
                                        {mod.modules && mod.modules.length > 0 && (
                                            <p className="text-[10px] text-gray-600 flex items-center gap-1 mb-1">
                                                <GripVertical size={10} /> Drag the grip handle to reorder chapters
                                            </p>
                                        )}

                                        {mod.modules && mod.modules.length > 0 ? (
                                            mod.modules.map((ch, chIdx) => {
                                                const { className: chClass } = chapterDrag.getChapterStyle(chIdx);
                                                const isEditingThis = editingChapter?.chapterId === ch._id;

                                                // Edit Mode — show full form
                                                if (isEditingThis) {
                                                    return (
                                                        <div key={ch._id || chIdx} className="bg-[#1a1a1a] border border-emerald-500/40 rounded-xl p-4 space-y-3">
                                                            <div className="flex justify-between items-center">
                                                                <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                                                                    <Edit size={14} /> Edit {editingChapter.type === 'video' ? 'Video' : 'Quiz'} Chapter
                                                                </h4>
                                                                <button onClick={() => setEditingChapter(null)} className="text-gray-400 hover:text-white">
                                                                    <X size={18} />
                                                                </button>
                                                            </div>

                                                            {editingChapter.type === 'video' && (
                                                                <div className="space-y-3">
                                                                    <input type="text" placeholder="Video Title" value={editingChapter.title || ''} onChange={e => setEditingChapter({ ...editingChapter, title: e.target.value })} className={inputStyle} />
                                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                                        <div className="relative">
                                                                            <Globe size={14} className="absolute top-3 left-3 text-emerald-500" />
                                                                            <input type="text" placeholder="Bengali URL *" value={editingChapter.videoUrls?.bn || ''} onChange={e => setEditingChapter({ ...editingChapter, videoUrls: { ...editingChapter.videoUrls, bn: e.target.value } })} className={`${inputStyle} pl-9 border-emerald-500/30`} />
                                                                        </div>
                                                                        <div className="relative">
                                                                            <Globe size={14} className="absolute top-3 left-3 text-blue-500" />
                                                                            <input type="text" placeholder="English URL" value={editingChapter.videoUrls?.en || ''} onChange={e => setEditingChapter({ ...editingChapter, videoUrls: { ...editingChapter.videoUrls, en: e.target.value } })} className={`${inputStyle} pl-9`} />
                                                                        </div>
                                                                        <div className="relative">
                                                                            <Globe size={14} className="absolute top-3 left-3 text-yellow-500" />
                                                                            <input type="text" placeholder="Hindi URL" value={editingChapter.videoUrls?.hi || ''} onChange={e => setEditingChapter({ ...editingChapter, videoUrls: { ...editingChapter.videoUrls, hi: e.target.value } })} className={`${inputStyle} pl-9`} />
                                                                        </div>
                                                                    </div>
                                                                    <input type="text" placeholder="Thumbnail URL" value={editingChapter.thumbnail || ''} onChange={e => setEditingChapter({ ...editingChapter, thumbnail: e.target.value })} className={inputStyle} />
                                                                    <textarea placeholder="Description" value={editingChapter.description || ''} onChange={e => setEditingChapter({ ...editingChapter, description: e.target.value })} className={`${inputStyle} min-h-[50px]`} rows={2} />
                                                                </div>
                                                            )}

                                                            {editingChapter.type === 'quiz' && (
                                                                <div className="space-y-4">
                                                                    {(editingChapter.questions || []).map((q, qIdx) => (
                                                                        <div key={qIdx} className="bg-black/40 border border-white/10 rounded-lg p-4 relative">
                                                                            <button onClick={() => {
                                                                                const qs = editingChapter.questions.filter((_, i) => i !== qIdx);
                                                                                setEditingChapter({ ...editingChapter, questions: qs });
                                                                            }} className="absolute top-3 right-3 text-red-500 hover:text-red-400"><Trash2 size={14} /></button>
                                                                            <label className={labelStyle}>Question {qIdx + 1}</label>
                                                                            <input type="text" value={q.questionText || ''} onChange={e => {
                                                                                const qs = [...editingChapter.questions];
                                                                                qs[qIdx] = { ...qs[qIdx], questionText: e.target.value };
                                                                                setEditingChapter({ ...editingChapter, questions: qs });
                                                                            }} placeholder="Enter question" className={`${inputStyle} mb-2`} />
                                                                            <div className="grid grid-cols-2 gap-2 mb-2">
                                                                                {[0, 1, 2, 3].map(o => (
                                                                                    <input key={o} type="text" value={q.options[o] || ''} onChange={e => {
                                                                                        const qs = [...editingChapter.questions];
                                                                                        qs[qIdx] = { ...qs[qIdx] };
                                                                                        qs[qIdx].options = [...qs[qIdx].options];
                                                                                        qs[qIdx].options[o] = e.target.value;
                                                                                        setEditingChapter({ ...editingChapter, questions: qs });
                                                                                    }} placeholder={`Option ${o + 1}`} className={inputStyle} />
                                                                                ))}
                                                                            </div>
                                                                            <select value={q.correctAnswer || ''} onChange={e => {
                                                                                const qs = [...editingChapter.questions];
                                                                                qs[qIdx] = { ...qs[qIdx], correctAnswer: e.target.value };
                                                                                setEditingChapter({ ...editingChapter, questions: qs });
                                                                            }} className={`${inputStyle} border-emerald-500/50 text-emerald-400`}>
                                                                                <option value="">Select correct answer</option>
                                                                                {q.options.filter(Boolean).map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                                                                            </select>
                                                                        </div>
                                                                    ))}
                                                                    <button onClick={() => {
                                                                        const qs = [...(editingChapter.questions || []), { questionText: '', options: ['', '', '', ''], correctAnswer: '' }];
                                                                        setEditingChapter({ ...editingChapter, questions: qs });
                                                                    }} className="w-full py-2 bg-white/5 hover:bg-white/10 border border-dashed border-white/20 rounded-lg text-sm text-gray-400 hover:text-white font-bold transition-colors flex items-center justify-center gap-2">
                                                                        <Plus size={14} /> Add Question
                                                                    </button>
                                                                </div>
                                                            )}

                                                            <div className="flex gap-2">
                                                                <button onClick={updateChapter} disabled={savingEdit} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                                                    {savingEdit ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                                                    {savingEdit ? 'Saving...' : 'Save Changes'}
                                                                </button>
                                                                <button onClick={() => setEditingChapter(null)} className="px-6 py-3 bg-white/10 text-gray-300 font-bold rounded-xl text-sm hover:bg-white/20 transition-colors">
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                // Normal View — compact chapter card
                                                return (
                                                    <div
                                                        key={ch._id || chIdx}
                                                        data-draggable="true"
                                                        className={`${chClass} bg-[#1a1a1a] border border-white/5 rounded-xl p-3 flex items-center justify-between group hover:border-emerald-500/30 transition-all select-none`}
                                                        draggable
                                                        onDragStart={(e) => chapterDrag.handleDragStart(e, chIdx)}
                                                        onDragOver={(e) => chapterDrag.handleDragOver(e, chIdx)}
                                                        onDragLeave={chapterDrag.handleDragLeave}
                                                        onDrop={(e) => chapterDrag.handleDrop(e, chIdx)}
                                                        onDragEnd={chapterDrag.handleDragEnd}
                                                    >
                                                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                                            {/* Chapter Drag Handle */}
                                                            <div
                                                                className="p-1 rounded text-gray-600 hover:text-white hover:bg-white/10 cursor-grab active:cursor-grabbing transition-colors"
                                                                onMouseDown={(e) => e.stopPropagation()}
                                                            >
                                                                <GripVertical size={14} />
                                                            </div>

                                                            {/* Chapter Icon */}
                                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${ch.type === 'video' ? 'bg-blue-500/10' : 'bg-yellow-500/10'}`}>
                                                                {ch.type === 'video' ? (
                                                                    <Video size={18} className="text-blue-400" />
                                                                ) : (
                                                                    <CheckSquare size={18} className="text-yellow-400" />
                                                                )}
                                                            </div>

                                                            {/* Chapter Info */}
                                                            <div className="min-w-0">
                                                                <p className="text-white font-bold text-sm flex items-center gap-1.5">
                                                                    <span className="truncate">
                                                                        {ch.type === 'video' ? ch.title : `Quiz (${ch.questions?.length || 0} questions)`}
                                                                    </span>
                                                                    <span className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0 ${ch.type === 'video' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                                        {ch.type}
                                                                    </span>
                                                                </p>
                                                                <p className="text-gray-500 text-[10px] mt-0.5">
                                                                    {ch.type === 'video'
                                                                        ? `#${chIdx + 1} • ${ch.videoUrls?.bn ? 'BN ✓' : ''} ${ch.videoUrls?.en ? 'EN ✓' : ''} ${ch.videoUrls?.hi ? 'HI ✓' : ''}`
                                                                        : `#${chIdx + 1} • Pass to continue`
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <button
                                                                onClick={() => startEditChapter(ch, mod._id)}
                                                                className="p-2 text-blue-400/30 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0"
                                                                title="Edit chapter"
                                                            >
                                                                <Edit size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteChapter(mod._id, ch._id)}
                                                                className="p-2 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0"
                                                                title="Delete chapter"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-gray-600 text-sm text-center py-4">No chapters yet. Add one below.</p>
                                        )}

                                        {/* Add Chapter Buttons */}
                                        {showChapterForm.moduleId === mod._id ? (
                                            <div className="bg-black/60 border border-white/10 rounded-xl p-4 mt-4">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-wider">
                                                        {showChapterForm.type === 'video' ? 'Add Video Chapter' : 'Add Quiz Chapter'}
                                                    </h4>
                                                    <button onClick={() => { setShowChapterForm({ moduleId: null, type: null }); setChapterForm({ title: '', description: '', thumbnail: '', videoUrls: { bn: '', en: '', hi: '' }, questions: [] }); }} className="text-gray-400 hover:text-white">
                                                        <X size={18} />
                                                    </button>
                                                </div>

                                                {showChapterForm.type === 'video' && (
                                                    <div className="space-y-3">
                                                        <input type="text" placeholder="Video Title" value={chapterForm.title} onChange={e => setChapterForm({ ...chapterForm, title: e.target.value })} className={inputStyle} />
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                            <div className="relative">
                                                                <Globe size={14} className="absolute top-3 left-3 text-emerald-500" />
                                                                <input type="text" placeholder="Bengali URL *" value={chapterForm.videoUrls.bn} onChange={e => setChapterForm({ ...chapterForm, videoUrls: { ...chapterForm.videoUrls, bn: e.target.value } })} className={`${inputStyle} pl-9 border-emerald-500/30`} />
                                                            </div>
                                                            <div className="relative">
                                                                <Globe size={14} className="absolute top-3 left-3 text-blue-500" />
                                                                <input type="text" placeholder="English URL" value={chapterForm.videoUrls.en} onChange={e => setChapterForm({ ...chapterForm, videoUrls: { ...chapterForm.videoUrls, en: e.target.value } })} className={`${inputStyle} pl-9`} />
                                                            </div>
                                                            <div className="relative">
                                                                <Globe size={14} className="absolute top-3 left-3 text-yellow-500" />
                                                                <input type="text" placeholder="Hindi URL" value={chapterForm.videoUrls.hi} onChange={e => setChapterForm({ ...chapterForm, videoUrls: { ...chapterForm.videoUrls, hi: e.target.value } })} className={`${inputStyle} pl-9`} />
                                                            </div>
                                                        </div>
                                                        <input type="text" placeholder="Thumbnail URL" value={chapterForm.thumbnail} onChange={e => setChapterForm({ ...chapterForm, thumbnail: e.target.value })} className={inputStyle} />
                                                        <textarea placeholder="Description" value={chapterForm.description} onChange={e => setChapterForm({ ...chapterForm, description: e.target.value })} className={`${inputStyle} min-h-[50px]`} rows={2} />
                                                    </div>
                                                )}

                                                {showChapterForm.type === 'quiz' && (
                                                    <div className="space-y-4">
                                                        {chapterForm.questions.map((q, qIdx) => (
                                                            <div key={qIdx} className="bg-black/40 border border-white/10 rounded-lg p-4 relative">
                                                                <button onClick={() => removeQuestion(qIdx)} className="absolute top-3 right-3 text-red-500 hover:text-red-400"><Trash2 size={14} /></button>
                                                                <label className={labelStyle}>Question {qIdx + 1}</label>
                                                                <input type="text" value={q.questionText} onChange={e => updateQuestion(qIdx, 'questionText', e.target.value)} placeholder="Enter question" className={`${inputStyle} mb-2`} />
                                                                <div className="grid grid-cols-2 gap-2 mb-2">
                                                                    {[0, 1, 2, 3].map(o => (
                                                                        <input key={o} type="text" value={q.options[o]} onChange={e => updateOption(qIdx, o, e.target.value)} placeholder={`Option ${o + 1}`} className={inputStyle} />
                                                                    ))}
                                                                </div>
                                                                <select value={q.correctAnswer} onChange={e => updateQuestion(qIdx, 'correctAnswer', e.target.value)} className={`${inputStyle} border-emerald-500/50 text-emerald-400`}>
                                                                    <option value="">Select correct answer</option>
                                                                    {q.options.filter(Boolean).map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                                                                </select>
                                                            </div>
                                                        ))}
                                                        <button onClick={addQuestionToForm} className="w-full py-2 bg-white/5 hover:bg-white/10 border border-dashed border-white/20 rounded-lg text-sm text-gray-400 hover:text-white font-bold transition-colors flex items-center justify-center gap-2">
                                                            <Plus size={14} /> Add Question
                                                        </button>
                                                    </div>
                                                )}

                                                <button onClick={saveChapter} disabled={saving} className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                                    {saving ? 'Saving...' : 'Add Chapter'}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2 mt-4">
                                                {!isCertModule && (
                                                    <button onClick={() => { setShowChapterForm({ moduleId: mod._id, type: 'video' }); setChapterForm({ title: '', description: '', thumbnail: '', videoUrls: { bn: '', en: '', hi: '' }, questions: [] }); }} className="flex-1 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/20 hover:border-blue-500/40 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                                                        <Video size={16} /> + Video
                                                    </button>
                                                )}
                                                <button onClick={() => { setShowChapterForm({ moduleId: mod._id, type: 'quiz' }); setChapterForm({ title: '', description: '', thumbnail: '', videoUrls: { bn: '', en: '', hi: '' }, questions: [] }); }} className={`flex-1 py-3 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 ${
                                                    isCertModule
                                                        ? 'bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border border-yellow-500/20 hover:border-yellow-500/40'
                                                        : 'bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border border-yellow-500/20 hover:border-yellow-500/40'
                                                }`}>
                                                    <CheckSquare size={16} /> + {isCertModule ? 'Quiz Chapter' : 'Quiz'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {modules.length === 0 && !showNewModule && (
                    <div className="text-center py-16 text-gray-500">
                        <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-bold mb-1">No modules yet</p>
                        <p className="text-sm">Create your first module to start adding video and quiz chapters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChapterModuleBuilder;
