import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Edit, Save, X, User, CheckCircle, Trash2, 
  Link as LinkIcon, Calendar, HelpCircle, MessageSquare, 
  Users, Eye, EyeOff, Search, UserPlus
} from 'lucide-react';
import { BASE_URL } from '../config';

const MasterclassManager = () => {
  const [masterclasses, setMasterclasses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  
  // --- Temporary Input States ---
  const [tempLearningPoint, setTempLearningPoint] = useState('');
  const [tempTargetAudience, setTempTargetAudience] = useState('');
  const [tempFAQ, setTempFAQ] = useState({ question: '', answer: '' });
  const [tempReview, setTempReview] = useState({ studentName: '', rating: 5, comment: '' });

  // --- Enroll User States ---
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [adminEnrolledUsers, setAdminEnrolledUsers] = useState([]);
  const [enrollMessage, setEnrollMessage] = useState({ text: '', type: '' });
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimerRef = useRef(null);
  const dropdownRef = useRef(null);

  // --- SECURITY HEADERS ---
  const getAdminHeaders = () => {
    return { 'Content-Type': 'application/json' };
  };

  const initialForm = {
    _id: null,
    title: '', tagline: '', bannerImage: '', meetingLink: '',
    expertName: '', expertImage: '', expertDesignation: '', expertBio: '',
    startDate: '', startTime: '', endTime: '',
    priceOriginal: '', priceDiscounted: '',
    totalSeats: 50,
    whatYouWillLearn: [], whoIsThisFor: [], faqs: [], reviews: [],
    manualStatus: 'published'
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => { fetchMasterclasses(); }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchMasterclasses = async () => {
    try {
      const res = await fetch(`${BASE_URL}/masterclasses/admin/all`, { 
          headers: getAdminHeaders(),
          credentials: 'include' 
      });
      const data = await res.json();
      const formatted = (Array.isArray(data) ? data : []).map(m => ({
        ...initialForm, 
        ...m,
        priceOriginal: m.price?.original !== undefined && m.price?.original !== null ? m.price.original : '',
        priceDiscounted: m.price?.discounted !== undefined && m.price?.discounted !== null ? m.price.discounted : '',
        startDate: m.schedule?.startDate ? m.schedule.startDate.split('T')[0] : '',
        startTime: m.schedule?.startTime || '',
        endTime: m.schedule?.endTime || '',
        expertName: m.expert?.name || '',
        expertImage: m.expert?.image || '',
        expertDesignation: m.expert?.designation || '',
        expertBio: m.expert?.bio || '',
      }));
      setMasterclasses(formatted);
    } catch (err) { console.error("Fetch Error:", err); }
  };

  // --- List Handlers ---
  const addPoint = () => { if (!tempLearningPoint.trim()) return; setFormData({ ...formData, whatYouWillLearn: [...formData.whatYouWillLearn, tempLearningPoint] }); setTempLearningPoint(''); };
  const removePoint = (idx) => setFormData({ ...formData, whatYouWillLearn: formData.whatYouWillLearn.filter((_, i) => i !== idx) });
  
  const addTargetAudience = () => { if (!tempTargetAudience.trim()) return; setFormData({ ...formData, whoIsThisFor: [...formData.whoIsThisFor, tempTargetAudience] }); setTempTargetAudience(''); };
  const removeTargetAudience = (idx) => setFormData({ ...formData, whoIsThisFor: formData.whoIsThisFor.filter((_, i) => i !== idx) });
  
  const addFAQ = () => { if (!tempFAQ.question.trim()) return; setFormData({ ...formData, faqs: [...formData.faqs, tempFAQ] }); setTempFAQ({ question: '', answer: '' }); };
  const removeFAQ = (idx) => setFormData({ ...formData, faqs: formData.faqs.filter((_, i) => i !== idx) });
  
  const addReview = () => { if (!tempReview.studentName.trim()) return; setFormData({ ...formData, reviews: [...formData.reviews, tempReview] }); setTempReview({ studentName: '', rating: 5, comment: '' }); };
  const removeReview = (idx) => setFormData({ ...formData, reviews: formData.reviews.filter((_, i) => i !== idx) });

  const handleEdit = (item) => { 
    setFormData(item); 
    setIsEditing(true); 
    setAdminEnrolledUsers([]);
    setUserSearchQuery('');
    setUserSearchResults([]);
    setEnrollMessage({ text: '', type: '' });
  };
  
  const handleDelete = async (id) => {
    if(!window.confirm("Delete this Masterclass?")) return;
    try {
        const res = await fetch(`${BASE_URL}/masterclasses/admin/delete/${id}`, { 
            method: 'DELETE', 
            headers: getAdminHeaders(),
            credentials: 'include' 
        });
        if(res.ok) fetchMasterclasses(); else alert("Failed to delete");
    } catch(err) { alert("Network Error"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
        title: formData.title, tagline: formData.tagline, bannerImage: formData.bannerImage,
        meetingLink: formData.meetingLink, manualStatus: formData.manualStatus,
        expert: { name: formData.expertName, image: formData.expertImage, designation: formData.expertDesignation, bio: formData.expertBio },
        schedule: { startDate: formData.startDate, startTime: formData.startTime, endTime: formData.endTime },
        price: { original: Number(formData.priceOriginal) || 0, discounted: formData.priceDiscounted === '' ? 0 : Number(formData.priceDiscounted) },
        whatYouWillLearn: formData.whatYouWillLearn, whoIsThisFor: formData.whoIsThisFor, faqs: formData.faqs, reviews: formData.reviews,
        totalSeats: Number(formData.totalSeats) || 50
    };
    const url = formData._id ? `${BASE_URL}/masterclasses/admin/update/${formData._id}` : `${BASE_URL}/masterclasses/admin/create`;
    const method = formData._id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, { 
            method, 
            headers: getAdminHeaders(), 
            credentials: 'include', 
            body: JSON.stringify(payload) 
        });
        if (res.ok) { 
          const data = await res.json();
          // If creating new, grab the returned _id so enroll works immediately
          if (!formData._id && data.masterclass?._id) {
            setFormData(prev => ({ ...prev, _id: data.masterclass._id }));
          } else {
            setIsEditing(false); 
            setFormData(initialForm); 
          }
          fetchMasterclasses(); 
        } else { 
          alert("Error saving data"); 
        }
    } catch (err) { alert("Network Error"); }
  };

  // ==========================================
  // ENROLL USER HANDLERS
  // ==========================================
  const handleUserSearch = (query) => {
    setUserSearchQuery(query);
    clearTimeout(searchTimerRef.current);
    setUserSearchResults([]);

    if (!query.trim()) { 
      setShowDropdown(false); 
      return; 
    }

    setIsSearching(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/masterclasses/search?q=${encodeURIComponent(query)}`,
          { credentials: 'include', headers: getAdminHeaders() }
        );
        const data = await res.json();
        setUserSearchResults(Array.isArray(data) ? data : []);
        setShowDropdown(true);
      } catch (err) {
        console.error("User search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const showEnrollMessage = (text, type) => {
    setEnrollMessage({ text, type });
    setTimeout(() => setEnrollMessage({ text: '', type: '' }), 3000);
  };

  const handleAdminEnroll = async (user) => {
    if (!formData._id) {
      showEnrollMessage('Save this masterclass first before enrolling users.', 'error');
      return;
    }

    // Prevent duplicate enroll in local list
    if (adminEnrolledUsers.some(u => u._id === user._id)) {
      showEnrollMessage(`${user.name} is already enrolled.`, 'error');
      setShowDropdown(false);
      setUserSearchQuery('');
      setUserSearchResults([]);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/masterclasses/admin/enroll-user`, {
        method: 'POST',
        headers: getAdminHeaders(),
        credentials: 'include',
        body: JSON.stringify({ userId: user._id, masterclassId: formData._id })
      });
      const data = await res.json();

      if (res.ok) {
        setAdminEnrolledUsers(prev => [...prev, user]);
        showEnrollMessage(`${user.name} enrolled successfully!`, 'success');
      } else {
        showEnrollMessage(data.message || 'Enrollment failed.', 'error');
      }
    } catch (err) {
      showEnrollMessage('Network error. Please try again.', 'error');
    } finally {
      setShowDropdown(false);
      setUserSearchQuery('');
      setUserSearchResults([]);
    }
  };

  const getInitials = (name = '') =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  // --- REUSABLE STYLES ---
  const inputStyle = "w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:border-purple-500 outline-none transition-colors placeholder:text-gray-700";
  const labelStyle = "block text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-wider";
  const sectionCardStyle = "p-4 bg-white/5 rounded-xl border border-white/5 space-y-3";

  return (
    <div className="pb-24 md:pb-0">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-3xl font-black text-white">Masterclass</h2>
        {!isEditing && (
          <button
            onClick={() => { setIsEditing(true); setFormData(initialForm); setAdminEnrolledUsers([]); }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm shadow-lg shadow-purple-900/20"
          >
            <Plus size={16} /> New <span className="hidden md:inline">Masterclass</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
            <h3 className="text-lg font-bold text-purple-400">
              {formData._id ? 'Edit Masterclass' : 'New Masterclass'}
            </h3>
            <button
              onClick={() => { setIsEditing(false); setAdminEnrolledUsers([]); setEnrollMessage({ text: '', type: '' }); }}
              className="bg-white/5 p-2 rounded-full text-gray-400 hover:text-white"
            >
              <X size={18}/>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. MAIN INFO */}
            <div className="space-y-3">
              <div>
                <label className={labelStyle}>Title</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className={inputStyle} placeholder="Masterclass Title" />
              </div>
              <div>
                <label className={labelStyle}>Tagline</label>
                <input type="text" value={formData.tagline} onChange={e => setFormData({ ...formData, tagline: e.target.value })} className={inputStyle} placeholder="Catchy subtitle" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelStyle}>Status</label>
                  <select value={formData.manualStatus} onChange={e => setFormData({ ...formData, manualStatus: e.target.value })} className={inputStyle}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className={labelStyle}>Meeting Link</label>
                  <input type="text" value={formData.meetingLink} onChange={e => setFormData({ ...formData, meetingLink: e.target.value })} className={`${inputStyle} border-purple-500/30 text-purple-300`} placeholder="Zoom/Meet URL" />
                </div>
              </div>
              <div>
                <label className={labelStyle}>Banner URL</label>
                <input type="text" required value={formData.bannerImage} onChange={e => setFormData({ ...formData, bannerImage: e.target.value })} className={inputStyle} placeholder="https://..." />
              </div>
            </div>

            <div className="h-px bg-white/5 my-2"></div>

            {/* 2. EXPERT & SCHEDULE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Expert Card */}
              <div className={sectionCardStyle}>
                <h4 className="text-xs font-bold text-purple-400 uppercase flex items-center gap-2"><User size={14}/> Expert</h4>
                <input type="text" placeholder="Name" required value={formData.expertName} onChange={e => setFormData({...formData, expertName: e.target.value})} className={inputStyle} />
                <input type="text" placeholder="Designation" value={formData.expertDesignation} onChange={e => setFormData({...formData, expertDesignation: e.target.value})} className={inputStyle} />
                <input type="text" placeholder="Image URL" value={formData.expertImage} onChange={e => setFormData({...formData, expertImage: e.target.value})} className={inputStyle} />
                <textarea placeholder="Bio" rows="2" value={formData.expertBio} onChange={e => setFormData({...formData, expertBio: e.target.value})} className={inputStyle}></textarea>
              </div>

              {/* Schedule Card */}
              <div className={sectionCardStyle}>
                <h4 className="text-xs font-bold text-purple-400 uppercase flex items-center gap-2"><Calendar size={14}/> Schedule & Price</h4>
                <input type="date" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className={inputStyle} />
                <div className="grid grid-cols-2 gap-2">
                  <input type="time" required value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className={inputStyle} />
                  <input type="time" required value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className={inputStyle} />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                  <div>
                    <label className={labelStyle}>Original ₹</label>
                    <input type="number" value={formData.priceOriginal} onChange={e => setFormData({...formData, priceOriginal: e.target.value})} className={inputStyle} />
                  </div>
                  <div>
                    <label className={labelStyle}>Discount ₹ (0 = Free)</label>
                    <input type="number" value={formData.priceDiscounted} onChange={e => setFormData({...formData, priceDiscounted: e.target.value})} className={`${inputStyle} text-green-400 font-bold`} placeholder="0 for Free" />
                  </div>
                </div>
                <input type="number" placeholder="Total Seats" value={formData.totalSeats} onChange={e => setFormData({...formData, totalSeats: e.target.value})} className={inputStyle} />
              </div>
            </div>

            <div className="h-px bg-white/5 my-2"></div>

            {/* 3. DYNAMIC CONTENT */}
            <div className="space-y-4">

              {/* What You Learn */}
              <div className={sectionCardStyle}>
                <h4 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2"><CheckCircle size={14}/> Curriculum</h4>
                <div className="flex gap-2">
                  <input type="text" placeholder="Add point..." value={tempLearningPoint} onChange={e => setTempLearningPoint(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addPoint())} className={inputStyle}/>
                  <button type="button" onClick={addPoint} className="bg-purple-600 px-3 rounded-lg text-white"><Plus size={18}/></button>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {formData.whatYouWillLearn.map((pt, i) => (
                    <div key={i} className="flex justify-between items-center bg-black/40 p-2 rounded text-xs text-gray-300">
                      <span>{pt}</span>
                      <button type="button" onClick={() => removePoint(i)}><Trash2 size={12} className="text-red-500"/></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ==========================================
                  ENROLL USER SECTION
              ========================================== */}
              <div className={sectionCardStyle}>
                <h4 className="text-xs font-bold text-purple-400 uppercase flex items-center gap-2">
                  <UserPlus size={14}/> Enroll User (Admin)
                </h4>

                {/* Warning if masterclass not saved yet */}
                {!formData._id && (
                  <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
                    <span className="text-yellow-400 text-sm mt-0.5">⚠</span>
                    <p className="text-[11px] text-yellow-400/90 leading-relaxed">
                      Save this masterclass first to enable user enrollment.
                    </p>
                  </div>
                )}

                {/* Search Input */}
                <div className="relative" ref={dropdownRef}>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search by name, email or phone..."
                      value={userSearchQuery}
                      onChange={e => handleUserSearch(e.target.value)}
                      onFocus={() => userSearchResults.length > 0 && setShowDropdown(true)}
                      disabled={!formData._id}
                      className={`${inputStyle} pl-9 ${!formData._id ? 'opacity-40 cursor-not-allowed' : ''}`}
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-3.5 h-3.5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Search Results Dropdown */}
                  {showDropdown && userSearchResults.length > 0 && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-[#0f0f0f] border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/60">
                      {userSearchResults.map(user => (
                        <div
                          key={user._id}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors group"
                        >
                          {/* Avatar */}
                          <div className="w-8 h-8 rounded-full bg-purple-950 border border-purple-500/20 flex items-center justify-center text-[11px] font-bold text-purple-300 shrink-0">
                            {getInitials(user.name)}
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-semibold truncate leading-tight">{user.name}</p>
                            <p className="text-[11px] text-gray-500 truncate">
                              {user.email}{user.phone ? ` · ${user.phone}` : ''}
                            </p>
                          </div>
                          {/* Enroll Button */}
                          <button
                            type="button"
                            onClick={() => handleAdminEnroll(user)}
                            className="shrink-0 flex items-center gap-1 text-[11px] font-bold bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg transition-colors active:scale-95"
                          >
                            <Plus size={12} /> Enroll
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* No results state */}
                  {showDropdown && !isSearching && userSearchQuery.trim() && userSearchResults.length === 0 && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-3 text-center">
                      <p className="text-xs text-gray-500">No users found for "{userSearchQuery}"</p>
                    </div>
                  )}
                </div>

                {/* Feedback Message */}
                {enrollMessage.text && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    enrollMessage.type === 'success'
                      ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}>
                    <span>{enrollMessage.type === 'success' ? '✓' : '✕'}</span>
                    {enrollMessage.text}
                  </div>
                )}

                {/* Enrolled Users List */}
                {adminEnrolledUsers.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                      Enrolled this session ({adminEnrolledUsers.length})
                    </p>
                    <div className="max-h-36 overflow-y-auto space-y-1">
                      {adminEnrolledUsers.map((u, i) => (
                        <div key={i} className="flex items-center gap-2.5 bg-black/40 border border-white/5 px-2.5 py-2 rounded-lg">
                          <div className="w-7 h-7 rounded-full bg-purple-950 border border-purple-500/20 flex items-center justify-center text-[10px] font-bold text-purple-300 shrink-0">
                            {getInitials(u.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white font-medium truncate leading-tight">{u.name}</p>
                            <p className="text-[10px] text-gray-600 truncate">{u.email}</p>
                          </div>
                          <span className="text-[9px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full shrink-0">
                            Admin enrolled
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* END ENROLL USER SECTION */}

              {/* Target Audience */}
              <div className={sectionCardStyle}>
                <h4 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2"><Users size={14}/> Target Audience</h4>
                <div className="flex gap-2">
                  <input type="text" placeholder="Who is this for?" value={tempTargetAudience} onChange={e => setTempTargetAudience(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTargetAudience())} className={inputStyle}/>
                  <button type="button" onClick={addTargetAudience} className="bg-purple-600 px-3 rounded-lg text-white"><Plus size={18}/></button>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {formData.whoIsThisFor.map((pt, i) => (
                    <div key={i} className="flex justify-between items-center bg-black/40 p-2 rounded text-xs text-gray-300">
                      <span>{pt}</span>
                      <button type="button" onClick={() => removeTargetAudience(i)}><Trash2 size={12} className="text-red-500"/></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQs */}
              <div className={sectionCardStyle}>
                <h4 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2"><HelpCircle size={14}/> FAQs</h4>
                <div className="space-y-2">
                  <input type="text" placeholder="Question" value={tempFAQ.question} onChange={e => setTempFAQ({...tempFAQ, question: e.target.value})} className={inputStyle}/>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Answer" value={tempFAQ.answer} onChange={e => setTempFAQ({...tempFAQ, answer: e.target.value})} className={inputStyle}/>
                    <button type="button" onClick={addFAQ} className="bg-purple-600 px-3 rounded-lg text-white"><Plus size={18}/></button>
                  </div>
                </div>
                <div className="space-y-1 mt-2 max-h-32 overflow-y-auto">
                  {formData.faqs.map((f, i) => (
                    <div key={i} className="bg-black/40 p-2 rounded text-xs text-gray-300 relative">
                      <p className="font-bold text-purple-400 mb-0.5">Q: {f.question}</p>
                      <p className="line-clamp-1">A: {f.answer}</p>
                      <button type="button" onClick={() => removeFAQ(i)} className="absolute top-2 right-2 text-red-500"><Trash2 size={12}/></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div className={sectionCardStyle}>
                <h4 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2"><MessageSquare size={14}/> Reviews</h4>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input type="text" placeholder="Student Name" value={tempReview.studentName} onChange={e => setTempReview({...tempReview, studentName: e.target.value})} className={inputStyle}/>
                    <input type="number" placeholder="5" max="5" min="1" value={tempReview.rating} onChange={e => setTempReview({...tempReview, rating: e.target.value})} className="w-16 bg-[#0a0a0a] border border-white/10 rounded-lg p-2 text-white text-sm outline-none"/>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Comment" value={tempReview.comment} onChange={e => setTempReview({...tempReview, comment: e.target.value})} className={inputStyle}/>
                    <button type="button" onClick={addReview} className="bg-purple-600 px-3 rounded-lg text-white"><Plus size={18}/></button>
                  </div>
                </div>
                <div className="space-y-1 mt-2 max-h-32 overflow-y-auto">
                  {formData.reviews.map((r, i) => (
                    <div key={i} className="bg-black/40 p-2 rounded text-xs text-gray-300 relative">
                      <div className="flex justify-between text-purple-400 font-bold text-[10px] mb-0.5">
                        <span>{r.studentName}</span><span>{r.rating} ★</span>
                      </div>
                      <p className="italic opacity-80">"{r.comment}"</p>
                      <button type="button" onClick={() => removeReview(i)} className="absolute top-2 right-2 text-red-500"><Trash2 size={12}/></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="pt-4 pb-20 md:pb-0">
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-purple-900/20 active:scale-95 transition-transform">
                <Save size={18} /> SAVE MASTERCLASS
              </button>
            </div>
          </form>
        </div>
      ) : (
        // LIST VIEW
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {masterclasses.map(mc => (
            <div key={mc._id} className="bg-[#121212] border border-white/5 p-3 rounded-xl flex gap-3 hover:bg-[#1a1a1a] transition-colors relative">
              <img src={mc.bannerImage} alt="" className="w-20 h-20 rounded-lg object-cover bg-gray-800 shrink-0" />
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <h3 className="font-bold text-white text-sm leading-tight line-clamp-2">{mc.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded"><User size={10}/> {mc.expertName.split(' ')[0]}</span>
                    <span className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded"><Calendar size={10}/> {mc.startDate}</span>
                  </div>
                </div>
                <div className="flex justify-between items-end mt-2">
                  <div className="flex flex-col">
                    <span className="text-purple-400 font-black text-sm">
                      {Number(mc.priceDiscounted) === 0 ? "FREE" : `₹${mc.priceDiscounted}`}
                    </span>
                    <span className={`text-[9px] font-bold uppercase ${mc.manualStatus === 'published' ? 'text-green-500' : 'text-yellow-500'}`}>
                      {mc.manualStatus}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(mc)} className="p-1.5 bg-white/10 text-white rounded-lg hover:bg-white/20"><Edit size={14} /></button>
                    <button onClick={() => handleDelete(mc._id)} className="p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {masterclasses.length === 0 && (
            <div className="text-center py-12 text-gray-500 col-span-full">No masterclasses found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default MasterclassManager;