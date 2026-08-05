import React, { useState, useEffect } from 'react';
import { Loader2, Users, Video, ChevronDown, ChevronUp, Calendar, Phone, Mail } from 'lucide-react';
import { BASE_URL } from '../config';

const MasterclassEnrollmentStats = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // 🔴 UPDATED: Removed user-id header, added credentials: 'include'
                const res = await fetch(`${BASE_URL}/masterclasses/admin/enrollment-stats`, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include' // REQUIRED TO SEND JWT COOKIE
                });
                
                const data = await res.json();
                
                if (data.success) {
                    setStats(data.stats);
                } else {
                    console.error("❌ Backend rejected request:", data.message);
                }
            } catch (error) {
                console.error("Failed to fetch Masterclass stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-purple-500" size={32} />
            </div>
        );
    }

    return (
        <div className="p-2 md:p-6 text-white font-sans min-h-[500px]">
            <div className="mb-8">
                <h2 className="text-2xl font-black text-white mb-2">Masterclass Bookings</h2>
                <p className="text-gray-400 text-sm">Track students registered for live sessions.</p>
            </div>

            {stats.length === 0 ? (
                <div className="bg-[#1a1a1a] border border-white/5 rounded-3xl p-12 text-center">
                    <Video size={32} className="mx-auto text-gray-500 mb-4" />
                    <h3 className="text-xl font-bold text-gray-400">No Bookings Found</h3>
                </div>
            ) : (
                <div className="space-y-4">
                    {stats.map((mc) => (
                        <div key={mc._id} className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden">
                            <div 
                                className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer hover:bg-white/5 transition-all gap-4"
                                onClick={() => setExpandedId(expandedId === mc._id ? null : mc._id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-purple-500/20 p-3 rounded-xl text-purple-400">
                                        <Video size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white">{mc.title}</h3>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <Calendar size={12} /> {new Date(mc.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • Expert: {mc.expertName}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4 w-full md:w-auto justify-between">
                                    <div className="flex items-center gap-2 text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20">
                                        <Users size={16} />
                                        <span className="font-bold text-sm">{mc.enrolledCount} Booked</span>
                                    </div>
                                    <div className="text-gray-500">
                                        {expandedId === mc._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>
                            </div>

                            {expandedId === mc._id && (
                                <div className="border-t border-white/5 bg-[#0f0f0f] p-4 overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead>
                                            <tr className="text-gray-500 uppercase text-[10px] tracking-widest border-b border-white/10">
                                                <th className="pb-3 pr-4 font-semibold text-center w-10">#</th>
                                                <th className="pb-3 pr-4 font-semibold">Student Name</th>
                                                <th className="pb-3 pr-4 font-semibold">Phone Number</th>
                                                <th className="pb-3 pr-4 font-semibold">Email</th>
                                                <th className="pb-3 font-semibold text-right">Booking Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mc.students.map((student, idx) => (
                                                <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                                    <td className="py-4 pr-4 text-center text-gray-600">{idx + 1}</td>
                                                    <td className="py-4 pr-4 font-bold text-gray-200 uppercase tracking-tight">{student.name}</td>
                                                    <td className="py-4 pr-4 text-gray-300 font-mono flex items-center gap-2">
                                                        <Phone size={12} className="text-gray-500" /> {student.phone}
                                                    </td>
                                                    <td className="py-4 pr-4 text-gray-400 lowercase">
                                                        {student.email || 'N/A'}
                                                    </td>
                                                    <td className="py-4 font-mono text-right text-gray-500 text-xs">
                                                        {new Date(student.enrolledAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MasterclassEnrollmentStats;