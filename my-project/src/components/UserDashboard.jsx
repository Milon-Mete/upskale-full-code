import React, { useState, useEffect } from 'react';
import { Search, User, Phone, Mail, Calendar, DollarSign, BookOpen, Copy, Check, ChevronLeft, ChevronRight, TrendingUp, Award } from 'lucide-react';
import { BASE_URL } from '../config';

const UserDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(null); 
  
  // Pagination & Global Stats
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [globalStats, setGlobalStats] = useState({ totalStudents: 0, totalRevenue: 0 });

  const fetchUsers = async (targetPage = 1, currentSearch = '') => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/admin/all-users?page=${targetPage}&limit=50&search=${currentSearch}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include' 
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
        setPagination(data.pagination);
        setGlobalStats(data.globalStats);
      } else {
        console.error("Failed to load users:", data.message);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced Search Effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1); 
      fetchUsers(1, searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // Derived Analytical Stats
  const averageSpend = globalStats.totalStudents > 0 
    ? Math.round(globalStats.totalRevenue / globalStats.totalStudents) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      
      {/* Header */}
      <div className="max-w-[1400px] mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Analytics</h1>
        <p className="text-gray-500">Deep-dive into student purchasing behavior, revenue distribution, and product engagement.</p>
      </div>

      {/* Top-Level Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1400px] mx-auto mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><User size={24} /></div>
          <div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Total Users</div>
            <div className="text-3xl font-black text-gray-900">{globalStats.totalStudents.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 border-l-green-500">
          <div className="p-3 bg-green-50 text-green-600 rounded-full"><DollarSign size={24} /></div>
          <div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Gross Revenue</div>
            <div className="text-3xl font-black text-gray-900">₹{globalStats.totalRevenue.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 border-l-purple-500">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-full"><TrendingUp size={24} /></div>
          <div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Avg Spend Per User</div>
            <div className="text-3xl font-black text-gray-900">₹{averageSpend.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Main Analytical Table */}
      <div className="max-w-[1400px] mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Database Search Bar */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center bg-gray-50/50 gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search global database by name, phone, or email..." 
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-500 font-medium bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
            {loading ? 'Querying Database...' : `Found ${globalStats.totalStudents} Matches`}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto relative min-h-[500px]">
          {loading && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-[11px] uppercase tracking-widest border-b border-gray-200">
                <th className="p-4 font-bold">Student Identity</th>
                <th className="p-4 font-bold">Joined Date</th>
                <th className="p-4 font-bold">Financials (LTV)</th>
                <th className="p-4 font-bold w-[40%]">Product Portfolio & Engagement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                    
                    {/* Identity Column */}
                    <td className="p-4 align-top">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-base">{user.name}</span>
                            {user.role === 'admin' && <span className="bg-red-100 text-red-700 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold">Admin</span>}
                        </div>
                        <div className="flex flex-col gap-1 mt-1.5">
                            <div className="flex items-center gap-2 group w-fit">
                                <span className="text-gray-500 flex items-center gap-1.5 text-xs font-medium"><Phone size={13} /> {user.phone}</span>
                                <button onClick={() => handleCopy(user.phone, `phone-${user.id}`)} className="text-gray-300 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100">
                                    {copied === `phone-${user.id}` ? <Check size={13} className="text-green-500"/> : <Copy size={13}/>}
                                </button>
                            </div>
                            {user.email && user.email !== 'N/A' && (
                                <span className="text-gray-400 flex items-center gap-1.5 text-xs"><Mail size={13} /> {user.email}</span>
                            )}
                        </div>
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td className="p-4 align-top text-gray-500">
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(user.joinedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>

                    {/* Financials (Lifetime Value) */}
                    <td className="p-4 align-top">
                      <div className="flex flex-col gap-1">
                          <span className={`text-lg font-black tracking-tight ${user.totalRevenue > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                            {user.totalRevenue > 0 ? `₹${user.totalRevenue.toLocaleString()}` : '₹0'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Lifetime Value</span>
                      </div>
                    </td>

                    {/* Exposed Analytical Course Portfolio */}
                    <td className="p-4 align-top">
                      {user.courseList && user.courseList.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {user.courseList.map((course, idx) => {
                            // Determine Color Based on Type
                            let colorClass = "bg-gray-50 border-gray-200 text-gray-700";
                            if (course.type === 'Cohort') colorClass = "bg-blue-50 border-blue-200 text-blue-700";
                            if (course.type === 'Masterclass') colorClass = "bg-purple-50 border-purple-200 text-purple-700";
                            if (course.type === 'BiteSizeCourse') colorClass = "bg-emerald-50 border-emerald-200 text-emerald-700";
                            
                            return (
                                <div key={idx} className={`flex flex-col border rounded-md p-2 text-xs w-full max-w-[280px] ${colorClass}`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold truncate pr-2">{course.title}</span>
                                        {course.score === 100 && <Award size={14} className="text-yellow-500 shrink-0" title="Certified"/>}
                                    </div>
                                    <div className="flex gap-1.5 mt-auto">
                                        <span className="text-[9px] uppercase tracking-wider font-bold opacity-70 border-r border-current pr-1.5">{course.type || 'Course'}</span>
                                        <span className="text-[9px] uppercase tracking-wider font-bold opacity-70">{course.planType}</span>
                                    </div>
                                </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm italic flex items-center gap-1.5 bg-gray-50 w-fit px-3 py-1 rounded">
                            <BookOpen size={14}/> No active enrollments
                        </span>
                      )}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-16 text-center">
                     <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                        <Search className="text-gray-300" size={24} />
                     </div>
                    <p className="text-gray-500 text-lg">No records found matching "<span className="font-bold text-gray-800">{searchTerm}</span>"</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="p-4 border-t border-gray-200 bg-white flex justify-between items-center text-sm">
          <div className="text-gray-500 font-medium">
            Page <span className="font-bold text-gray-900">{pagination.currentPage}</span> of <span className="font-bold text-gray-900">{pagination.totalPages || 1}</span>
          </div>
          
          <div className="flex gap-2 shadow-sm rounded-lg overflow-hidden border border-gray-200">
            <button 
              disabled={!pagination.hasPrevPage}
              onClick={() => { setPage(p => p - 1); fetchUsers(page - 1, searchTerm); }}
              className="px-4 py-2 bg-white hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed flex items-center gap-1 font-medium text-gray-700 transition-colors border-r border-gray-200"
            >
              <ChevronLeft size={16}/> Prev
            </button>
            <button 
              disabled={!pagination.hasNextPage}
              onClick={() => { setPage(p => p + 1); fetchUsers(page + 1, searchTerm); }}
              className="px-4 py-2 bg-white hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed flex items-center gap-1 font-medium text-gray-700 transition-colors"
            >
              Next <ChevronRight size={16}/>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserDashboard;