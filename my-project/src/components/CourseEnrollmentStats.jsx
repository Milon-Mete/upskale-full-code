import React, { useState, useEffect } from 'react';
import { Loader2, Users, BookOpen, ChevronDown, ChevronUp, Wallet } from 'lucide-react';
import { BASE_URL } from '../config';

const CourseEnrollmentStats = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCourseId, setExpandedCourseId] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // 🔴 UPDATED: Removed user-id header, added credentials: 'include'
                const res = await fetch(`${BASE_URL}/cohorts/admin/enrollment-stats`, {
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include' // REQUIRED TO SEND JWT COOKIE
                });
                const data = await res.json();
                
                if (data.success) {
                    console.log("🔥 DATA RECEIVED IN REACT:", data.stats); 
                    setStats(data.stats);
                } else {
                    console.error("❌ Backend rejected request:", data.message);
                }
            } catch (error) {
                console.error("❌ Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const toggleExpand = (id) => {
        setExpandedCourseId(expandedCourseId === id ? null : id);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-[#008a45]" size={32} />
            </div>
        );
    }

    return (
        <div className="p-2 md:p-6 text-white font-sans min-h-[500px]">
            <div className="mb-8">
                <h2 className="text-2xl font-black text-white mb-2">Cohort Enrollments</h2>
                <p className="text-gray-400 text-sm">Detailed view of students enrolled in your active cohorts.</p>
            </div>

            {stats.length === 0 ? (
                <div className="bg-[#1a1a1a] border border-white/5 rounded-3xl p-12 text-center">
                    <BookOpen size={32} className="mx-auto text-gray-500 mb-4" />
                    <h3 className="text-xl font-bold">No Enrollments Yet</h3>
                </div>
            ) : (
                <div className="space-y-4">
                    {stats.map((course) => (
                        <div key={course._id} className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden transition-all">
                            
                            {/* Header (Click to expand) */}
                            <div 
                                className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer hover:bg-white/5 transition-colors gap-4"
                                onClick={() => toggleExpand(course._id)}
                            >
                                <div>
                                    <h3 className="font-bold text-lg text-white mb-1">
                                        {course.title ? course.title : <span className="text-red-500">Missing Title Data</span>}
                                    </h3>
                                    
                                    <span className="text-[10px] uppercase tracking-wider text-gray-500 bg-black/50 px-2 py-1 rounded border border-white/5">
                                        {course.category || 'Cohort'}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-6 w-full md:w-auto">
                                    <div className="flex items-center gap-2 text-[#008a45] bg-[#008a45]/10 px-3 py-1.5 rounded-lg border border-[#008a45]/20">
                                        <Users size={16} />
                                        <span className="font-bold text-sm">{course.enrolledCount} Students</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20">
                                        <Wallet size={16} />
                                        <span className="font-bold text-sm">₹{course.totalRevenue.toLocaleString()}</span>
                                    </div>
                                    <div className="text-gray-400 shrink-0">
                                        {expandedCourseId === course._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Student List */}
                            {expandedCourseId === course._id && (
                                <div className="border-t border-white/5 bg-[#121212] p-4 overflow-x-auto">
                                    {course.students && course.students.length > 0 ? (
                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                            <thead>
                                                <tr className="text-gray-500 uppercase text-[10px] tracking-widest border-b border-white/10">
                                                    <th className="pb-3 pr-4 font-semibold">Student Name</th>
                                                    <th className="pb-3 pr-4 font-semibold">Phone</th>
                                                    <th className="pb-3 pr-4 font-semibold">Plan</th>
                                                    <th className="pb-3 pr-4 font-semibold">Status</th>
                                                    <th className="pb-3 pr-4 font-semibold">Progress</th>
                                                    <th className="pb-3 font-semibold text-right">Paid</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {course.students.map((student, idx) => (
                                                    <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                                        <td className="py-3 pr-4 font-medium text-gray-200">{student.name}</td>
                                                        <td className="py-3 pr-4 text-gray-400 font-mono">{student.phone}</td>
                                                        <td className="py-3 pr-4 uppercase text-[10px] font-bold text-blue-400">{student.planType || 'N/A'}</td>
                                                        <td className="py-3 pr-4">
                                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                                student.paymentStatus === 'full' 
                                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                                                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                            }`}>
                                                                {student.paymentStatus === 'partial' ? 'EMI Pending' : student.paymentStatus || 'Pending'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 pr-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-20 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                                                    <div className="bg-[#008a45] h-full" style={{ width: `${student.progress || 0}%` }}></div>
                                                                </div>
                                                                <span className="text-[10px] text-gray-500">{student.progress || 0}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 font-mono text-right text-gray-300">₹{student.amountPaid || 0}</td>
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
        </div>
    );
};

export default CourseEnrollmentStats;