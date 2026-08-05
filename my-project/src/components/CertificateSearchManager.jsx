import React, { useState } from 'react';
import { Search, Loader2, Award, Calendar, Phone, ExternalLink, User } from 'lucide-react';
import { BASE_URL } from '../config';

const CertificateSearchManager = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        setHasSearched(true);

        try {
            // 🔴 ADDED: credentials: 'include' is mandatory for protected admin routes
            const res = await fetch(`${BASE_URL}/admin/search-certificates?q=${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include' 
            });
            
            const data = await res.json();
            
            // Log this to your console so you can see exactly what the backend is saying
            console.log("Search Response:", data); 
            
            if (data.success) {
                // Fallback check: some backends use data.data instead of data.certificates
                setResults(data.certificates || data.data || []);
            } else {
                setResults([]);
                // If the backend sends an error message, show it in the console
                console.error("Backend Error:", data.message); 
            }
        } catch (error) {
            console.error("Search failed", error);
            alert("Error connecting to server. Check your console.");
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="p-2 md:p-6 text-white font-sans min-h-[500px]">
            <div className="mb-8">
                <h2 className="text-2xl font-black text-white mb-2">Certificate Directory</h2>
                <p className="text-gray-400 text-sm">Search by student name, phone number, or exact Certificate ID.</p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-8 relative flex gap-3">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-500" />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g. Milon, +919876..., or CERT-123..."
                        className="w-full pl-11 pr-4 py-4 bg-[#1a1a1a] border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-[#008a45] focus:ring-1 focus:ring-[#008a45] transition-all shadow-inner"
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={isSearching || !query.trim()}
                    className="bg-[#008a45] hover:bg-[#007038] text-white px-8 rounded-2xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                >
                    {isSearching ? <Loader2 size={20} className="animate-spin" /> : 'Search'}
                </button>
            </form>

            {/* Results Area */}
            <div>
                {isSearching ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <Loader2 size={40} className="animate-spin mb-4 text-[#008a45]" />
                        <p>Searching database...</p>
                    </div>
                ) : hasSearched && results.length === 0 ? (
                    <div className="bg-[#1a1a1a] border border-white/5 rounded-3xl p-12 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                            <Search size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No Results Found</h3>
                        <p className="text-gray-400">We couldn't find any certificates matching "{query}".</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {results.map((cert) => (
                            <div key={cert._id} className="bg-[#1a1a1a] border border-white/10 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-white/20 transition-colors">
                                
                                <div className="flex items-start gap-4">
                                    <div className="bg-gradient-to-br from-yellow-500/20 to-amber-600/20 p-3 rounded-xl text-yellow-500 border border-yellow-500/10">
                                        <Award size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white">{cert.studentName}</h3>
                                        <p className="text-sm text-[#008a45] font-mono mb-2">{cert.certificateId}</p>
                                        
                                        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                                            <span className="flex items-center gap-1"><User size={12} /> {cert.courseName}</span>
                                            <span className="flex items-center gap-1"><Phone size={12} /> {cert.phone || 'N/A'}</span>
                                            <span className="flex items-center gap-1"><Calendar size={12} /> {cert.issuedDate}</span>
                                        </div>
                                    </div>
                                </div>

                                <a 
                                    href={`/view-certificate/${cert.certificateId}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-full md:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-colors shrink-0"
                                >
                                    View <ExternalLink size={16} />
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CertificateSearchManager;