import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Users, Activity, ChevronDown, ChevronUp, Clock, ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';
import { BASE_URL } from '../config';

const BiteSizeEnrollmentStats = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedPlanId, setExpandedPlanId] = useState(null);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1, hasMore: false });

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/bitesize-courses/admin/subscription-stats?page=${page}&limit=20`, {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include' 
            });
            const data = await res.json();
            
            if (data.success) {
                setStats(data.stats);
                if (data.pagination) setPagination(data.pagination);
            } else {
                console.error("❌ Backend rejected request:", data.message);
            }
        } catch (error) {
            console.error("❌ Failed to fetch stats", error);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const toggleExpand = (id) => {
        setExpandedPlanId(expandedPlanId === id ? null : id);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
            </div>
        );
    }

    return (
        <div className="p-2 md:p-6 text-white font-sans min-h-[500px]">
            <div className="mb-8">
                <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
                    <Activity className="text-emerald-500" /> Subscription Analytics
                </h2>
                <p className="text-gray-400 text-sm">Monitor active recurring users and track expired trials.</p>
            </div>

            {stats.length === 0 ? (
                <div className="bg-[#1a1a1a] border border-white/5 rounded-3xl p-12 text-center">
                    <ShieldAlert size={32} className="mx-auto text-gray-500 mb-4" />
                    <h3 className="text-xl font-bold">No Subscriptions Yet</h3>
                </div>
            ) : (
                <div className="space-y-4">
                    {stats.map((plan) => (
                        <div key={plan._id} className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden transition-all">
                            
                            {/* Header (Click to expand) */}
                            <div 
                                className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer hover:bg-white/5 transition-colors gap-4"
                                onClick={() => toggleExpand(plan._id)}
                            >
                                <div>
                                    <h3 className="font-bold text-lg text-white mb-1">
                                        {plan.title}
                                    </h3>
                                    <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded border 
                                        ${plan._id === 'trial' ? 'bg-orange-900/50 text-orange-400 border-orange-800' 
                                        : 'bg-emerald-900/50 text-emerald-400 border-emerald-800'}`}>
                                        Global Pass
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-6 w-full md:w-auto">
                                    <div className="flex items-center gap-2 text-gray-300 bg-black/50 px-3 py-1.5 rounded-lg border border-white/10">
                                        <Users size={16} />
                                        <span className="font-bold text-sm">{plan.enrolledCount} Lifetime</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg border border-emerald-400/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
                                        <Activity size={16} />
                                        <span className="font-bold text-sm">{plan.activeCount} Currently Active</span>
                                    </div>
                                    <div className="text-gray-400 shrink-0">
                                        {expandedPlanId === plan._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Student List */}
                            {expandedPlanId === plan._id && (
                                <div className="border-t border-white/5 bg-[#121212] p-4 overflow-x-auto">
                                    {plan.students && plan.students.length > 0 ? (
                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                            <thead>
                                                <tr className="text-gray-500 uppercase text-[10px] tracking-widest border-b border-white/10">
                                                    <th className="pb-3 pr-4 font-semibold">Student Name</th>
                                                    <th className="pb-3 pr-4 font-semibold">Phone</th>
                                                    <th className="pb-3 pr-4 font-semibold">Live Status</th>
                                                    <th className="pb-3 pr-4 font-semibold">Expiration Date</th>
                                                    <th className="pb-3 font-semibold text-right">Trial History</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {plan.students.map((student, idx) => (
                                                    <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                                        <td className="py-3 pr-4 font-medium text-gray-200">{student.name}</td>
                                                        <td className="py-3 pr-4 text-gray-400 font-mono">{student.phone}</td>
                                                        <td className="py-3 pr-4">
                                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit
                                                                ${student.status === 'Active' 
                                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                                }`}>
                                                                {student.status === 'Active' ? <Activity size={10}/> : <Clock size={10}/>}
                                                                {student.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 pr-4 text-gray-400">
                                                            {new Date(student.expiresAt).toLocaleDateString('en-IN', {
                                                                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </td>
                                                        <td className="py-3 font-mono text-right">
                                                            {student.trialUsed 
                                                                ? <span className="text-orange-400 text-[10px] uppercase font-bold tracking-wider">Burned</span> 
                                                                : <span className="text-gray-600 text-[10px] uppercase font-bold tracking-wider">Available</span>}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-gray-500 text-sm text-center py-4">No student details found.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            
            {/* 🔴 PAGINATION CONTROLS */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-gray-400 text-sm font-mono">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={!pagination.hasMore}
                        className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default BiteSizeEnrollmentStats;