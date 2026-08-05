import React, { useState } from 'react';
import { Search, ShieldAlert, UserCheck, Activity, Key, LogOut, Power } from 'lucide-react';
import { BASE_URL } from '../config';

const StudentControlCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states for manual subscription override
  const [planType, setPlanType] = useState('monthly');
  const [daysToAdd, setDaysToAdd] = useState(30);

  // 1. Search for a specific user
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    setLoading(true);
    try {
      // 🚀 FIXED: Removed the extra /api
      const response = await fetch(`${BASE_URL}/admin/all-users`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        const cleanSearch = searchQuery.replace(/[\s-]/g, '');
        const found = data.users.find(u => 
          u.phone.includes(cleanSearch) || 
          (u.email && u.email.toLowerCase() === cleanSearch.toLowerCase())
        );
        
        if (found) {
          setTargetUser(found);
        } else {
          alert("Student not found.");
          setTargetUser(null);
        }
      }
    } catch (error) {
      console.error("Search failed:", error);
      alert("Error searching database.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Impersonation Execution
  const handleImpersonate = async () => {
    const isConfirmed = window.confirm(
      `CRITICAL: You are about to take over ${targetUser.name}'s account.\nYou will lose admin access until you log out. Proceed?`
    );
    if (!isConfirmed) return;

    try {
      // 🚀 FIXED: Removed the extra /api
      const response = await fetch(`${BASE_URL}/admin/impersonate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ targetPhone: targetUser.phone })
      });

      const data = await response.json();
      if (data.success) {
        window.location.href = '/'; // Hard reload to become the student
      } else {
        alert(`Failed: ${data.message}`);
      }
    } catch (error) {
      alert("Server error during impersonation.");
    }
  };

  // 3. Subscription Override Execution
  const handleForceSubscription = async (action) => {
    let confirmMsg = action === 'terminate' 
      ? `WARNING: You are about to instantly kill access for ${targetUser.name}. Proceed?`
      : `You are about to force ${action} a ${daysToAdd}-day ${planType} plan for ${targetUser.name}. Proceed?`;

    if (!window.confirm(confirmMsg)) return;

    setActionLoading(true);
    try {
      // 🚀 FIXED: Removed the extra /api
      const response = await fetch(`${BASE_URL}/admin/force-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          targetPhone: targetUser.phone,
          action: action,
          planType: planType,
          daysToAdd: Number(daysToAdd)
        })
      });

      const data = await response.json();
      alert(data.message);
      
      if (data.success) {
        // Refresh the user data to show the new status
        document.getElementById('search-btn').click();
      }
    } catch (error) {
      alert("Server error processing subscription override.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 md:p-8 font-sans">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ShieldAlert className="text-red-500" size={32} />
          <h1 className="text-3xl font-bold text-white tracking-wide">God Mode Controls</h1>
        </div>
        <p className="text-gray-400">Absolute system override. Use these tools with extreme caution.</p>
      </div>

      {/* Search Bar */}
      <div className="max-w-4xl mx-auto mb-8 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <input 
              type="text" 
              placeholder="Enter Student Phone Number..." 
              className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-white transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              required
            />
          </div>
          <button 
            id="search-btn"
            type="submit" 
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-semibold tracking-wide transition-colors disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Locate'}
          </button>
        </form>
      </div>

      {/* User Dashboard */}
      {targetUser && (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Status Card */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <UserCheck className="text-blue-400" size={20}/> Target Acquired
                </h2>
                <span className="bg-blue-900/50 text-blue-400 text-xs px-2 py-1 rounded uppercase tracking-wider font-bold border border-blue-800">
                  {targetUser.role}
                </span>
              </div>
              <div className="space-y-3 text-sm">
                <p className="flex justify-between border-b border-gray-700 pb-2">
                  <span className="text-gray-500">Name:</span> 
                  <span className="font-medium text-gray-300">{targetUser.name}</span>
                </p>
                <p className="flex justify-between border-b border-gray-700 pb-2">
                  <span className="text-gray-500">Phone:</span> 
                  <span className="font-medium text-gray-300">{targetUser.phone}</span>
                </p>
                <p className="flex justify-between border-b border-gray-700 pb-2">
                  <span className="text-gray-500">Total Spent:</span> 
                  <span className="font-medium text-emerald-400">₹{targetUser.totalRevenue || 0}</span>
                </p>
                <p className="flex justify-between pt-1">
                  <span className="text-gray-500">Courses Owned:</span> 
                  <span className="font-medium text-gray-300">{targetUser.coursesCount || 0}</span>
                </p>
              </div>
            </div>

            {/* Impersonate Button */}
            <button 
              onClick={handleImpersonate}
              disabled={targetUser.role === 'admin'}
              className="mt-6 w-full bg-gray-700 hover:bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-bold tracking-wide transition-all border border-gray-600 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <Key size={18} className="group-hover:rotate-45 transition-transform"/>
              {targetUser.role === 'admin' ? 'Cannot Impersonate Admin' : 'Login As Student'}
            </button>
          </div>

          {/* Subscription Control Card */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <Activity className="text-emerald-400" size={20}/> Subscription Engine
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Plan Type</label>
                <select 
                  value={planType} 
                  onChange={(e) => setPlanType(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3 outline-none focus:border-emerald-500"
                >
                  <option value="trial">₹1 Trial</option>
                  <option value="monthly">Monthly Plan</option>
                  <option value="yearly">Yearly Plan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Days to Grant</label>
                <input 
                  type="number" 
                  value={daysToAdd}
                  onChange={(e) => setDaysToAdd(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handleForceSubscription('activate')}
                disabled={actionLoading}
                className="w-full bg-emerald-900/50 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-800 py-3 rounded-lg flex items-center justify-center gap-2 font-bold tracking-wide transition-colors"
              >
                <Power size={18} /> Force Activate / Extend
              </button>
              
              <button 
                onClick={() => handleForceSubscription('terminate')}
                disabled={actionLoading}
                className="w-full bg-red-900/30 hover:bg-red-600 text-red-400 hover:text-white border border-red-900 py-3 rounded-lg flex items-center justify-center gap-2 font-bold tracking-wide transition-colors"
              >
                <LogOut size={18} /> Terminate Access
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default StudentControlCenter;