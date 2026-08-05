import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, Calendar, DollarSign, Save, X, Zap, Percent, Gift, Settings } from 'lucide-react';
import { BASE_URL } from '../../src/config'; // Adjust path if needed

const CouponManager = () => {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('coupons'); // 'coupons' | 'promotions'
  const [coupons, setCoupons] = useState([]);
  const [promotions, setPromotions] = useState([]);
  
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingPromo, setIsCreatingPromo] = useState(false);

  // Standard Coupon Form
  const initialForm = {
    code: '',
    discountType: 'flat',
    discountValue: '',
    minOrderValue: 0,
    usageLimit: '',
    validUntil: ''
  };
  const [formData, setFormData] = useState(initialForm);

  // Automated Promotion Form (The Rules Engine)
  const initialPromoForm = {
    name: '',
    conditionType: 'COUPON_APPLIED', // Default rule type
    conditionValue: '', // e.g., TCCIAN100
    discountValue: '', // e.g., 9
    uiMessage: '' // e.g., Masterclass Student
  };
  const [promoFormData, setPromoFormData] = useState(initialPromoForm);

  const getAdminHeaders = () => ({ 'Content-Type': 'application/json' });

  // --- FETCHING DATA ---
  useEffect(() => { 
      fetchCoupons(); 
      fetchPromotions();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch(`${BASE_URL}/coupons/admin/all`, { headers: getAdminHeaders(), credentials: 'include' });
      const data = await res.json();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

const fetchPromotions = async () => {
    try {
      // CORRECTED URL: Removed '/coupons'
      const res = await fetch(`${BASE_URL}/promotions/admin/all`, { 
        headers: getAdminHeaders(), 
        credentials: 'include' 
      });
      const data = await res.json();
      setPromotions(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.error("Error fetching promotions:", err); 
    }
  };

const handleDeletePromotion = async (id) => {
    if (!window.confirm("Delete this automated rule?")) return;
    try {
      // CORRECTED URL: Removed '/coupons'
      const res = await fetch(`${BASE_URL}/promotions/admin/delete/${id}`, { 
        method: 'DELETE', 
        headers: getAdminHeaders(), 
        credentials: 'include' 
      });
      if (res.ok) fetchPromotions();
    } catch (err) { 
      alert("Failed to delete rule"); 
    }
  };

  // --- SUBMIT LOGIC ---
  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        validUntil: formData.validUntil || null
      };

      const res = await fetch(`${BASE_URL}/coupons/admin/create`, {
        method: 'POST', headers: getAdminHeaders(), credentials: 'include', body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if(res.ok) {
        alert("Coupon Created!");
        setIsCreating(false);
        setFormData(initialForm);
        fetchCoupons();
      } else { alert("Error: " + data.message); }
    } catch(err) { alert("Server Error"); }
  };

  const handlePromoSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...promoFormData,
        discountValue: Number(promoFormData.discountValue)
      };
// Notice the word 'coupons' is removed and replaced by 'promotions'
      const res = await fetch(`${BASE_URL}/promotions/admin/create`, {
        method: 'POST', headers: getAdminHeaders(), credentials: 'include', body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if(res.ok) {
        alert("Automated Rule Created!");
        setIsCreatingPromo(false);
        setPromoFormData(initialPromoForm);
        fetchPromotions();
      } else { alert("Error: " + data.message); }
    } catch(err) { alert("Server Error"); }
  };

  return (
    <div>
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black text-white">Discounts & Rules</h2>
            
            {/* Dynamic Create Button based on Active Tab */}
            {activeTab === 'coupons' && !isCreating && (
                <button onClick={() => setIsCreating(true)} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg">
                    <Plus size={20} /> Create Coupon
                </button>
            )}
            {activeTab === 'promotions' && !isCreatingPromo && (
                <button onClick={() => setIsCreatingPromo(true)} className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg">
                    <Zap size={20} /> Create Automation Rule
                </button>
            )}
        </div>

        {/* --- TAB SWITCHER --- */}
        <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
            <button 
                onClick={() => { setActiveTab('coupons'); setIsCreatingPromo(false); }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'coupons' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
                <Tag size={18} /> Standard Coupons
            </button>
            <button 
                onClick={() => { setActiveTab('promotions'); setIsCreating(false); }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'promotions' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'text-gray-500 hover:text-yellow-500 hover:bg-white/5'}`}
            >
                <Settings size={18} /> Automated Promotions
            </button>
        </div>

        {/* ========================================== */}
        {/* TAB 1: STANDARD COUPONS UI                 */}
        {/* ========================================== */}
        {activeTab === 'coupons' && (
            <>
                {/* Coupon Create Form */}
                {isCreating && (
                    <div className="bg-[#121212] border border-white/10 rounded-3xl p-8 mb-8 animate-in fade-in slide-in-from-top-4">
                        <div className="flex justify-between mb-6">
                            <h3 className="text-xl font-bold text-green-500">New Standard Coupon</h3>
                            <button onClick={() => setIsCreating(false)} className="text-gray-500 hover:text-white"><X/></button>
                        </div>
                        <form onSubmit={handleCouponSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Coupon Code</label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-3 text-gray-500" size={18}/>
                                        <input type="text" required placeholder="Ex: SUMMER50" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full bg-black border border-white/10 rounded-xl p-3 pl-10 text-white font-bold tracking-widest focus:border-green-500 outline-none uppercase" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Valid Until (Optional)</label>
                                    <input type="date" value={formData.validUntil} onChange={e => setFormData({...formData, validUntil: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-green-500 outline-none" />
                                </div>
                            </div>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Discount Type</label>
                                    <select value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-green-500 outline-none">
                                        <option value="flat">Flat Amount (₹)</option>
                                        <option value="percentage">Percentage (%)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Value</label>
                                    <div className="relative">
                                        {formData.discountType === 'flat' ? <DollarSign className="absolute left-3 top-3 text-gray-500" size={18}/> : <Percent className="absolute left-3 top-3 text-gray-500" size={18}/>}
                                        <input type="number" required placeholder={formData.discountType === 'flat' ? "500" : "10"} value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 pl-10 text-white focus:border-green-500 outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Usage Limit (Optional)</label>
                                    <input type="number" placeholder="Ex: 100 people" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-green-500 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Min Order Value (₹)</label>
                                <input type="number" value={formData.minOrderValue} onChange={e => setFormData({...formData, minOrderValue: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-green-500 outline-none" />
                            </div>
                            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg">
                                <Save size={20} /> Save Coupon
                            </button>
                        </form>
                    </div>
                )}

                {/* Coupon List */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coupons.map(coupon => (
                        <div key={coupon._id} className="bg-[#121212] border border-white/10 rounded-2xl p-6 relative group hover:border-green-500/50 transition-colors">
                            <button onClick={() => handleDeleteCoupon(coupon._id)} className="absolute top-4 right-4 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-green-500/10 text-green-500 p-3 rounded-xl"><Tag size={24} /></div>
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-widest">{coupon.code}</h3>
                                    <p className="text-sm text-green-400 font-bold">{coupon.discountType === 'flat' ? `₹${coupon.discountValue} OFF` : `${coupon.discountValue}% OFF`}</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm text-gray-400">
                                <div className="flex justify-between"><span>Min Order:</span> <span className="text-white">₹{coupon.minOrderValue}</span></div>
                                <div className="flex justify-between"><span>Usage:</span> <span className="text-white">{coupon.usedCount} / {coupon.usageLimit ? coupon.usageLimit : '∞'}</span></div>
                            </div>
                        </div>
                    ))}
                    {coupons.length === 0 && !isCreating && <div className="col-span-full text-center py-12 text-gray-500">No coupons active.</div>}
                </div>
            </>
        )}

        {/* ========================================== */}
        {/* TAB 2: AUTOMATED PROMOTIONS UI             */}
        {/* ========================================== */}
        {activeTab === 'promotions' && (
            <>
                {/* Promotion Create Form */}
                {isCreatingPromo && (
                    <div className="bg-[#121212] border border-yellow-500/30 rounded-3xl p-8 mb-8 animate-in fade-in slide-in-from-top-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 blur-3xl rounded-full pointer-events-none"></div>
                        <div className="flex justify-between mb-6 relative z-10">
                            <div>
                                <h3 className="text-xl font-bold text-yellow-500 flex items-center gap-2"><Zap size={20}/> New Automation Rule</h3>
                                <p className="text-gray-400 text-sm mt-1">These discounts apply automatically behind the scenes when conditions are met.</p>
                            </div>
                            <button onClick={() => setIsCreatingPromo(false)} className="text-gray-500 hover:text-white h-fit"><X/></button>
                        </div>

                        <form onSubmit={handlePromoSubmit} className="space-y-6 relative z-10">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Internal Rule Name</label>
                                    <input type="text" required placeholder="Ex: Masterclass Surprise" value={promoFormData.name} onChange={e => setPromoFormData({...promoFormData, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-yellow-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Condition To Check</label>
                                    <select value={promoFormData.conditionType} onChange={e => setPromoFormData({...promoFormData, conditionType: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-yellow-500 outline-none">
                                        <option value="COUPON_APPLIED">When specific base coupon is applied</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Trigger Value</label>
                                    <input type="text" required placeholder="Ex: TCCIAN100" value={promoFormData.conditionValue} onChange={e => setPromoFormData({...promoFormData, conditionValue: e.target.value.toUpperCase()})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-yellow-500 outline-none uppercase font-bold" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Extra Discount (₹)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-3 text-gray-500" size={18}/>
                                        <input type="number" required placeholder="Ex: 9" value={promoFormData.discountValue} onChange={e => setPromoFormData({...promoFormData, discountValue: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 pl-10 text-white focus:border-yellow-500 outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Message Shown to User</label>
                                    <input type="text" required placeholder="Ex: Masterclass Student" value={promoFormData.uiMessage} onChange={e => setPromoFormData({...promoFormData, uiMessage: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-yellow-500 outline-none" />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg">
                                <Save size={20} /> Save Automation Rule
                            </button>
                        </form>
                    </div>
                )}

                {/* Promotions List */}
                <div className="grid md:grid-cols-2 gap-6">
                    {promotions.map(promo => (
                        <div key={promo._id} className="bg-[#121212] border border-white/10 rounded-2xl p-6 relative group hover:border-yellow-500/50 transition-colors">
                            <button onClick={() => handleDeletePromotion(promo._id)} className="absolute top-4 right-4 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
                            
                            <div className="flex items-start gap-4 mb-4 border-b border-white/5 pb-4">
                                <div className="bg-yellow-500/10 text-yellow-500 p-3 rounded-xl shrink-0"><Gift size={24} /></div>
                                <div>
                                    <h3 className="text-xl font-black text-white">{promo.name}</h3>
                                    <p className="text-sm text-yellow-500 font-bold mt-1">Deducts ₹{promo.discountValue} Extra</p>
                                </div>
                            </div>
                            
                            <div className="space-y-3 text-sm">
                                <div className="bg-black/50 p-3 rounded-xl border border-white/5">
                                    <span className="text-gray-500 block mb-1 text-xs uppercase font-bold tracking-wider">Trigger Condition</span>
                                    <p className="text-white flex items-center gap-2">
                                        If cart has coupon <span className="bg-white/10 px-2 py-0.5 rounded text-yellow-400 font-mono text-xs">{promo.conditionValue}</span>
                                    </p>
                                </div>
                                <div className="bg-black/50 p-3 rounded-xl border border-white/5">
                                    <span className="text-gray-500 block mb-1 text-xs uppercase font-bold tracking-wider">Checkout Message Displayed</span>
                                    <p className="text-[#00d26a] font-medium">"{promo.uiMessage}"</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {promotions.length === 0 && !isCreatingPromo && <div className="col-span-full text-center py-12 text-gray-500">No automation rules active. Create one to surprise your students!</div>}
                </div>
            </>
        )}
    </div>
  );
};

export default CouponManager;